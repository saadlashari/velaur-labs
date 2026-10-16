import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';import {requireAdminPermission} from '@/lib/admin-api';import {can} from '@/lib/auth';
import catalog from '@/data/portfolio.json';
export async function POST(request:NextRequest){
 const {user,response}=await requireAdminPermission(request,'projects','CREATE');if(response)return response;
 const body=await request.json().catch(()=>null);
 if(body?.confirmation!=='IMPORT_APPROVED_PORTFOLIO')return NextResponse.json({error:'Confirm the approved catalog import.'},{status:400});
 const publish=body.publish===true;
 if(publish&&!can(user!,'projects','PUBLISH'))return NextResponse.json({error:'Publishing permission required.'},{status:403});
 const client=await db.connect();let inserted=0;
 try{
  await client.query('BEGIN');
  for(const p of catalog){const result=await client.query(`INSERT INTO projects(slug,title,category,page_type,summary,content,status,position,is_featured,live_url,app_store_url,play_store_url,published_at,created_by,updated_by) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12,CASE WHEN $7='PUBLISHED' THEN NOW() ELSE NULL END,$13,$13) ON CONFLICT(slug) DO NOTHING RETURNING id`,[p.slug,p.title,p.category,p.page_type,p.summary,JSON.stringify(p.content),publish?'PUBLISHED':'DRAFT',p.position,p.is_featured,p.live_url,p.app_store_url,p.play_store_url,user!.id]);inserted+=result.rowCount||0;}
  await client.query('INSERT INTO audit_logs(actor_user_id,action,module,details) VALUES($1,$2,$3,$4::jsonb)',[user!.id,'IMPORT_APPROVED_PORTFOLIO','projects',JSON.stringify({total:catalog.length,inserted,publish})]);
  await client.query('COMMIT');return NextResponse.json({ok:true,total:catalog.length,inserted,existing:catalog.length-inserted,status:publish?'PUBLISHED':'DRAFT'});
 }catch{await client.query('ROLLBACK').catch(()=>{});return NextResponse.json({error:'Catalog import failed. No projects were added.'},{status:500});}
 finally{client.release();}
}
