import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {requireAdminPermission} from '@/lib/admin-api';
import {can} from '@/lib/auth';
import {validateSectionContent} from '@/lib/section-content-validation';
const entities={pages:'pages',services:'services',projects:'projects',blog:'blog_posts'} as const;
type Entity=keyof typeof entities;
const uuid=/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i;
function isEntity(value:unknown):value is Entity{return typeof value==='string'&&Object.hasOwn(entities,value);}
export async function GET(request:NextRequest){
 const {response}=await requireAdminPermission(request,'approvals','VIEW');if(response)return response;
 try{const result=await db.query(`SELECT a.id,a.entity_type,a.entity_id,a.status,a.submitted_at,a.reviewer_note,u.display_name AS submitted_by_name FROM content_approvals a LEFT JOIN admin_users u ON u.id=a.submitted_by ORDER BY CASE WHEN a.status='PENDING' THEN 0 ELSE 1 END,a.submitted_at DESC LIMIT 100`);return NextResponse.json({items:result.rows});}
 catch{return NextResponse.json({error:'Could not load approvals'},{status:500});}
}
export async function POST(request:NextRequest){
 const {response,user}=await requireAdminPermission(request,'approvals','CREATE');if(response)return response;
 const body=await request.json().catch(()=>null);
 if(!isEntity(body?.entity_type)||typeof body.entity_id!=='string'||!uuid.test(body.entity_id))return NextResponse.json({error:'Invalid content reference'},{status:400});
 const entity:Entity=body.entity_type, id=body.entity_id;
 if(!can(user!,entity,'EDIT'))return NextResponse.json({error:'Content editing permission required'},{status:403});
 const client=await db.connect();
 try{
  await client.query('BEGIN');
  const record=await client.query(`SELECT * FROM ${entities[entity]} WHERE id=$1 FOR UPDATE`,[id]);
  const row=record.rows[0];const draft=entity==='pages'?row?.content?.builder_draft:null;
  if(!row||(draft?.page?.status||row.status)!=='IN_REVIEW'){await client.query('ROLLBACK');return NextResponse.json({error:'Save content as IN_REVIEW first'},{status:400});}
  const pending=await client.query("SELECT id FROM content_approvals WHERE entity_type=$1 AND entity_id=$2 AND status='PENDING'",[entity,id]);
  if(pending.rowCount){await client.query('ROLLBACK');return NextResponse.json({error:'Already pending review'},{status:409});}
  const revisionType='approval:'+entity;
  const number=await client.query('SELECT COALESCE(MAX(revision_number),0)+1 AS n FROM content_revisions WHERE entity_type=$1 AND entity_id=$2',[revisionType,id]);
  const n=number.rows[0].n;
  await client.query('INSERT INTO content_revisions(entity_type,entity_id,revision_number,snapshot,created_by) VALUES($1,$2,$3,$4::jsonb,$5)',[revisionType,id,n,JSON.stringify({version:row.updated_at,draft}),user!.id]);
  const result=await client.query('INSERT INTO content_approvals(entity_type,entity_id,submitted_by,submitted_revision) VALUES($1,$2,$3,$4) RETURNING id',[entity,id,user!.id,n]);
  await client.query('INSERT INTO audit_logs(actor_user_id,action,module,target_id) VALUES($1,$2,$3,$4)',[user!.id,'SUBMIT','approvals',result.rows[0].id]);
  await client.query('COMMIT');return NextResponse.json({ok:true},{status:201});
 }catch{await client.query('ROLLBACK').catch(()=>{});return NextResponse.json({error:'Could not submit for review'},{status:500});}
 finally{client.release();}
}
export async function PATCH(request:NextRequest){
 const {response,user}=await requireAdminPermission(request,'approvals','PUBLISH');if(response)return response;
 const body=await request.json().catch(()=>null);
 if(typeof body?.id!=='string'||!uuid.test(body.id)||!['APPROVED','REJECTED'].includes(body.decision)||typeof body.note!=='string'||body.note.length>1000)return NextResponse.json({error:'Invalid review'},{status:400});
 const client=await db.connect();
 try{
  await client.query('BEGIN');
  const selected=await client.query('SELECT * FROM content_approvals WHERE id=$1 FOR UPDATE',[body.id]);
  const approval=selected.rows[0];
  if(!approval||approval.status!=='PENDING'||!isEntity(approval.entity_type)){await client.query('ROLLBACK');return NextResponse.json({error:'Approval not pending'},{status:409});}
  const entity:Entity=approval.entity_type;
  if(!can(user!,entity,'PUBLISH')){await client.query('ROLLBACK');return NextResponse.json({error:'Publishing permission for this content is required'},{status:403});}
  const target=await client.query(`SELECT * FROM ${entities[entity]} WHERE id=$1 FOR UPDATE`,[approval.entity_id]);
  const row=target.rows[0];
  const revision=await client.query('SELECT snapshot FROM content_revisions WHERE entity_type=$1 AND entity_id=$2 AND revision_number=$3',['approval:'+entity,approval.entity_id,approval.submitted_revision]);
  const snapshot=revision.rows[0]?.snapshot;
  if(!row||!snapshot||new Date(row.updated_at).getTime()!==new Date(snapshot.version).getTime()){await client.query("UPDATE content_approvals SET status='CANCELLED',reviewed_by=$2,reviewed_at=NOW(),reviewer_note='Content changed after submission' WHERE id=$1",[body.id,user!.id]);await client.query('COMMIT');return NextResponse.json({error:'Content changed after submission. This stale review was cancelled; submit the current version.',code:'REVIEW_VERSION_CONFLICT'},{status:409});}
  const draft=snapshot.draft;
  if(entity==='pages'&&draft){
   if(body.decision==='APPROVED'){
    if(!Array.isArray(draft.sections)||!draft.sections.some((s:{is_visible:boolean})=>s.is_visible))throw Error('Empty draft');
    for(const section of draft.sections){if(validateSectionContent(section))throw Error('Invalid draft content');}
    await client.query('DELETE FROM page_sections WHERE page_id=$1',[approval.entity_id]);
    for(const [position,s] of draft.sections.entries())await client.query('INSERT INTO page_sections(page_id,section_key,section_type,position,is_visible,content,settings) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb)',[approval.entity_id,s.section_key,s.section_type,position,s.is_visible,JSON.stringify(s.content),JSON.stringify(s.settings)]);
    await client.query("UPDATE pages SET title=$2,seo_title=$3,meta_description=$4,status='PUBLISHED',content=content-'builder_draft',published_at=NOW(),updated_at=NOW(),updated_by=$5 WHERE id=$1",[approval.entity_id,draft.page.title,draft.page.seo_title,draft.page.meta_description,user!.id]);
   }else{
    draft.page.status='DRAFT';
    await client.query("UPDATE pages SET content=jsonb_set(content,'{builder_draft}',$2::jsonb),updated_at=NOW(),updated_by=$3 WHERE id=$1",[approval.entity_id,JSON.stringify(draft),user!.id]);
   }
  }else{
   if(row.status!=='IN_REVIEW')throw Error('Content is no longer in review');
   await client.query(`UPDATE ${entities[entity]} SET status=$2,published_at=CASE WHEN $2='PUBLISHED' THEN NOW() ELSE published_at END,updated_at=NOW(),updated_by=$3 WHERE id=$1`,[approval.entity_id,body.decision==='APPROVED'?'PUBLISHED':'DRAFT',user!.id]);
  }
  await client.query('UPDATE content_approvals SET status=$2,reviewed_by=$3,reviewer_note=$4,reviewed_at=NOW() WHERE id=$1',[body.id,body.decision,user!.id,body.note.trim()]);
  await client.query('INSERT INTO audit_logs(actor_user_id,action,module,target_id) VALUES($1,$2,$3,$4)',[user!.id,body.decision,'approvals',body.id]);
  await client.query('COMMIT');return NextResponse.json({ok:true});
 }catch{await client.query('ROLLBACK').catch(()=>{});return NextResponse.json({error:'Review operation failed; no changes published'},{status:500});}
 finally{client.release();}
}
