import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminPermission } from '@/lib/admin-api';
import { validateSectionContent } from '@/lib/section-content-validation';
import {validateBlocks} from '@/lib/builder-blocks';

const pageStatuses = new Set(['DRAFT','IN_REVIEW','PUBLISHED','ARCHIVED']);
const sectionTypes = new Set(['HERO','TEXT','CARDS','PROJECTS','CTA','FAQ','IMAGE_TEXT','STATS','LAYOUT']);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const sectionKey = /^[a-z][a-z0-9-]{0,79}$/;
type Section = {section_key:string;section_type:string;is_visible:boolean;content:Record<string,unknown>;settings:Record<string,unknown>};
const record = (v:unknown):v is Record<string,unknown> => !!v && typeof v==='object' && !Array.isArray(v);

/** Save the page and its ordered sections atomically. A failing write never partially publishes a layout. */
export async function PUT(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
 const {response,user}=await requireAdminPermission(request,'pages','UPDATE');
 if(response)return response;
 const {id}=await params;
 if(!uuid.test(id))return NextResponse.json({error:'Invalid page ID'},{status:400});
 let payload:unknown;
 try{payload=await request.json();}catch{return NextResponse.json({error:'Invalid JSON body'},{status:400});}
 if(!record(payload)||!record(payload.page)||!Array.isArray(payload.sections))return NextResponse.json({error:'Expected page and sections'},{status:400});
 const page=payload.page; const sections=payload.sections as Section[];
 const draftOnly=payload.mode==='draft';
 const title=page.title, status=page.status, seoTitle=page.seo_title, description=page.meta_description;
 const expectedVersion=page.updated_at;
 if(typeof expectedVersion!=='string'||!Number.isFinite(Date.parse(expectedVersion)))return NextResponse.json({error:'Missing page version. Reload the page before saving.'},{status:400});
 if(typeof title!=='string'||!title.trim()||title.length>160||typeof status!=='string'||!pageStatuses.has(status))return NextResponse.json({error:'Invalid title or status'},{status:400});
 if((seoTitle!=null&&(typeof seoTitle!=='string'||seoTitle.length>250))||(description!=null&&(typeof description!=='string'||description.length>500)))return NextResponse.json({error:'Invalid SEO fields'},{status:400});
 if(sections.length>40)return NextResponse.json({error:'Maximum 40 sections per page'},{status:400});
 const keys=new Set<string>();
 for(const section of sections){
  if(!record(section)||typeof section.section_key!=='string'||!sectionKey.test(section.section_key)||keys.has(section.section_key)||!sectionTypes.has(section.section_type)||typeof section.is_visible!=='boolean'||!record(section.content)||!record(section.settings)||JSON.stringify(section).length>25000)return NextResponse.json({error:'Invalid or duplicate section'},{status:400});
  if(section.is_visible && section.settings.hideOnDesktop===true && section.settings.hideOnTablet===true && section.settings.hideOnMobile===true)return NextResponse.json({error:'A visible section cannot be hidden on desktop, tablet and mobile at the same time'},{status:400});
  const contentError=section.section_type==='LAYOUT'?validateBlocks(section.content.blocks):validateSectionContent(section);
  if(contentError)return NextResponse.json({error:`${section.section_key}: ${contentError}`},{status:400});
  keys.add(section.section_key);
 }
 if(!draftOnly && status==='PUBLISHED' && !sections.some(s=>s.is_visible))return NextResponse.json({error:'Cannot publish an empty page or one with every section hidden'},{status:400});
 const canPublish=user!.role==='SUPER_ADMIN'||(user!.permissions?.pages??[]).includes('PUBLISH');
 if(!draftOnly && status==='PUBLISHED'&&!canPublish)return NextResponse.json({error:'Publishing permission required'},{status:403});
 const client=await db.connect();
 try{
  await client.query('BEGIN');
  const existing=await client.query<{status:string;updated_at:Date}>('SELECT status,updated_at FROM pages WHERE id=$1 FOR UPDATE',[id]);
  if(!existing.rowCount){await client.query('ROLLBACK');return NextResponse.json({error:'Page not found'},{status:404});}
  if(new Date(existing.rows[0].updated_at).getTime()!==Date.parse(expectedVersion)){await client.query('ROLLBACK');return NextResponse.json({error:'This page was changed by another admin. Your edits were NOT overwritten. Copy any unsaved text, then reload the page to review the newest version.',code:'VERSION_CONFLICT'},{status:409});}
  if(!draftOnly && existing.rows[0].status==='PUBLISHED'&&!canPublish){await client.query('ROLLBACK');return NextResponse.json({error:'Editing a published page requires publishing permission'},{status:403});}
  // Keep the previous page and section tree for an authorized rollback.
  const oldPage=await client.query('SELECT title,status,seo_title,meta_description,content FROM pages WHERE id=$1',[id]);
  const oldSections=await client.query('SELECT section_key,section_type,is_visible,content,settings FROM page_sections WHERE page_id=$1 ORDER BY position,id',[id]);
  const revision=await client.query<{revision_number:number}>("SELECT COALESCE(MAX(revision_number),0)+1 AS revision_number FROM content_revisions WHERE entity_type='pages' AND entity_id=$1",[id]);
  const previousDraft=oldPage.rows[0].content?.builder_draft;
  await client.query('INSERT INTO content_revisions(entity_type,entity_id,revision_number,snapshot,created_by) VALUES($1,$2,$3,$4::jsonb,$5)', ['pages',id,revision.rows[0].revision_number,JSON.stringify(previousDraft||{page:oldPage.rows[0],sections:oldSections.rows}),user!.id]);
  if(draftOnly){
   const draft={page:{title:title.trim(),status:status==='IN_REVIEW'?'IN_REVIEW':'DRAFT',seo_title:seoTitle||null,meta_description:description||null},sections};
   const saved=await client.query<{updated_at:Date}>("UPDATE pages SET content=jsonb_set(content,'{builder_draft}',$1::jsonb),updated_by=$2,updated_at=NOW() WHERE id=$3 RETURNING updated_at",[JSON.stringify(draft),user!.id,id]);
   await client.query('INSERT INTO audit_logs(actor_user_id,action,module,target_id) VALUES($1,$2,$3,$4)',[user!.id,'SAVE_DRAFT','pages',id]);
   await client.query('COMMIT');
   return NextResponse.json({ok:true,draft:true,updated_at:saved.rows[0].updated_at});
  }
  for(let i=0;i<sections.length;i++){
   const s=sections[i];
   await client.query(`INSERT INTO page_sections(page_id,section_key,section_type,position,is_visible,content,settings) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb) ON CONFLICT(page_id,section_key) DO UPDATE SET section_type=EXCLUDED.section_type,position=EXCLUDED.position,is_visible=EXCLUDED.is_visible,content=EXCLUDED.content,settings=EXCLUDED.settings,updated_at=NOW()`,[id,s.section_key,s.section_type,i,s.is_visible,JSON.stringify(s.content),JSON.stringify(s.settings)]);
  }
  await client.query('DELETE FROM page_sections WHERE page_id=$1 AND NOT(section_key=ANY($2::text[]))',[id,sections.map(s=>s.section_key)]);
  const savedPage=await client.query<{updated_at:Date}>(`UPDATE pages SET title=$1,status=$2,seo_title=$3,meta_description=$4,content=content-'builder_draft',updated_by=$5,updated_at=NOW(),published_at=CASE WHEN $2='PUBLISHED' THEN COALESCE(published_at,NOW()) ELSE published_at END WHERE id=$6 RETURNING updated_at`,[title.trim(),status,seoTitle||null,description||null,user!.id,id]);
  await client.query('INSERT INTO audit_logs(actor_user_id,action,module,target_id,details) VALUES($1,$2,$3,$4,$5::jsonb)',[user!.id,'UPDATE','pages',id,JSON.stringify({status,sections:sections.length,atomic:true})]);
  await client.query('COMMIT');
  return NextResponse.json({ok:true,status,sections:sections.length,updated_at:savedPage.rows[0].updated_at});
 }catch{await client.query('ROLLBACK').catch(()=>{});return NextResponse.json({error:'Could not save page and sections; no changes published'},{status:500});}
 finally{client.release();}
}
