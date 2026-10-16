import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {requireAdminPermission} from '@/lib/admin-api';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isObject=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);

/** Restores a previous snapshot as a DRAFT, never directly re-publishes old content. */
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
 const {response,user}=await requireAdminPermission(request,'pages','UPDATE');if(response)return response;
 const {id}=await params;if(!uuid.test(id))return NextResponse.json({error:'Invalid page id'},{status:400});
 let revisionNumber:unknown;
 try{revisionNumber=(await request.json()).revision_number;}catch{return NextResponse.json({error:'Invalid body'},{status:400});}
 if(!Number.isSafeInteger(revisionNumber)||(revisionNumber as number)<1)return NextResponse.json({error:'Invalid revision number'},{status:400});
 const client=await db.connect();
 try{
  await client.query('BEGIN');
  const page=await client.query('SELECT * FROM pages WHERE id=$1 FOR UPDATE',[id]);
  if(!page.rowCount){await client.query('ROLLBACK');return NextResponse.json({error:'Page not found'},{status:404});}
  const canPublish=user!.role==='SUPER_ADMIN'||(user!.permissions?.pages??[]).includes('PUBLISH');
  if(page.rows[0].status==='PUBLISHED'&&!canPublish){await client.query('ROLLBACK');return NextResponse.json({error:'Publishing permission required to restore a published page'},{status:403});}
  const selected=await client.query("SELECT snapshot FROM content_revisions WHERE entity_type='pages' AND entity_id=$1 AND revision_number=$2",[id,revisionNumber]);
  if(!selected.rowCount){await client.query('ROLLBACK');return NextResponse.json({error:'Revision not found'},{status:404});}
  const snapshot=selected.rows[0].snapshot;
  if(!isObject(snapshot)||!isObject(snapshot.page)||!Array.isArray(snapshot.sections))throw new Error('Corrupted revision snapshot');
  const latest=await client.query("SELECT COALESCE(MAX(revision_number),0)+1 AS n FROM content_revisions WHERE entity_type='pages' AND entity_id=$1",[id]);
  const sections=await client.query('SELECT section_key,section_type,is_visible,content,settings FROM page_sections WHERE page_id=$1 ORDER BY position,id',[id]);
  await client.query('INSERT INTO content_revisions(entity_type,entity_id,revision_number,snapshot,created_by) VALUES($1,$2,$3,$4::jsonb,$5)', ['pages',id,latest.rows[0].n,JSON.stringify({page:page.rows[0],sections:sections.rows}),user!.id]);
  for(const section of snapshot.sections){if(!isObject(section)||typeof section.section_key!=='string'||typeof section.section_type!=='string')throw new Error('Corrupted revision section');}
  const draft={page:{title:snapshot.page.title,seo_title:snapshot.page.seo_title||null,meta_description:snapshot.page.meta_description||null,status:'DRAFT'},sections:snapshot.sections};
  await client.query("UPDATE pages SET content=jsonb_set(content,'{builder_draft}',$1::jsonb),updated_by=$2,updated_at=NOW() WHERE id=$3",[JSON.stringify(draft),user!.id,id]);
  await client.query('INSERT INTO audit_logs(actor_user_id,action,module,target_id,details) VALUES($1,$2,$3,$4,$5::jsonb)',[user!.id,'RESTORE','pages',id,JSON.stringify({revision_number:revisionNumber,restored_as:'DRAFT'})]);
  await client.query('COMMIT');return NextResponse.json({ok:true,status:'DRAFT'});
 }catch{await client.query('ROLLBACK').catch(()=>{});return NextResponse.json({error:'Unable to restore revision; no changes saved'},{status:500});}
 finally{client.release();}
}
