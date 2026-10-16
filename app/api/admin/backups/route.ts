import {createHash} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {requireAdminPermission,writeAudit} from '@/lib/admin-api';
export const runtime='nodejs';
const tables=['pages','page_sections','services','projects','blog_posts','global_settings','inquiries','media_assets','redirects'] as const;
export async function GET(req:NextRequest){
 const auth=await requireAdminPermission(req,'backups','VIEW');if(auth.response)return auth.response;
 const result=await db.query(`SELECT id,status,backup_type,provider_reference,message,started_at,finished_at FROM backup_events ORDER BY started_at DESC LIMIT 40`);
 return NextResponse.json({events:result.rows,exportAvailable:auth.user?.role==='SUPER_ADMIN'},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:NextRequest){
 const auth=await requireAdminPermission(req,'backups','MANAGE');if(auth.response)return auth.response;
 if(auth.user?.role!=='SUPER_ADMIN')return NextResponse.json({error:'Only Super Admin may export data'},{status:403});
 const body=await req.json().catch(()=>({})) as {confirmation?:string};
 if(body.confirmation!=='EXPORT')return NextResponse.json({error:'Enter EXPORT to confirm sensitive data export'},{status:400});
 const event=await db.query<{id:string}>(`INSERT INTO backup_events(status,backup_type,message) VALUES('STARTED','MANUAL','Content JSON export requested') RETURNING id`);
 const id=event.rows[0].id;
 try{
  // All content tables must reflect the same committed point in time.
  // A single client is required: independent pool queries would not share a snapshot.
  const client=await db.connect();
  const records:Record<string,unknown[]>={};
  const counts:Record<string,number>={};
  const checksums:Record<string,string>={};
  try{
   await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
   for(const table of tables){
    const filter=table==='global_settings'?" WHERE setting_key NOT LIKE 'admin_%' AND setting_key NOT LIKE 'security_%'":'';
    const count=await client.query<{total:string}>(`SELECT COUNT(*)::text AS total FROM ${table}${filter}`);
    const total=Number(count.rows[0]?.total||0);
    if(total>5000)throw new Error(`${table} exceeds 5,000 rows; use Neon-managed backup instead`);
    const rows=await client.query(`SELECT * FROM ${table}${filter}`);
    records[table]=rows.rows;
    counts[table]=total;
    checksums[table]=createHash('sha256').update(JSON.stringify(rows.rows)).digest('hex');
    if(rows.rowCount!==total)throw new Error(`Export snapshot mismatch for ${table}`);
   }
   await client.query('COMMIT');
  }catch(error){await client.query('ROLLBACK').catch(()=>undefined);throw error;}
  finally{client.release();}
  const document={format:'VELAUR-CONTENT-EXPORT-v2',exportedAt:new Date().toISOString(),note:'Consistent committed snapshot of content tables. Not a PostgreSQL disaster-recovery backup; secrets and sessions excluded.',counts,checksums,tables:records};
  await db.query(`UPDATE backup_events SET status='SUCCEEDED',finished_at=NOW(),message=$2 WHERE id=$1`,[id,'JSON content export generated. Store securely.']);
  await writeAudit(auth.user.id,'CONTENT_EXPORT','BACKUPS',id,{tables:tables.length}).catch(()=>undefined);
  return new NextResponse(JSON.stringify(document),{status:200,headers:{'Content-Type':'application/json','Content-Disposition':`attachment; filename="velaur-content-${new Date().toISOString().slice(0,10)}.json"`,'Cache-Control':'no-store, private'}});
 }catch(error){await db.query(`UPDATE backup_events SET status='FAILED',finished_at=NOW(),message=$2 WHERE id=$1`,[id,error instanceof Error?error.message:'Export failed']).catch(()=>{});
 return NextResponse.json({error:'Content export failed. Check database size and configuration.'},{status:500});}
}
