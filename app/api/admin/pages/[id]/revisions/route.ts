import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {requireAdminPermission} from '@/lib/admin-api';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
 const {response}=await requireAdminPermission(request,'pages','READ');if(response)return response;
 const {id}=await params;if(!uuid.test(id))return NextResponse.json({error:'Invalid page id'},{status:400});
 try{
  const data=await db.query("SELECT revision_number,created_at,created_by FROM content_revisions WHERE entity_type='pages' AND entity_id=$1 ORDER BY revision_number DESC LIMIT 30",[id]);
  return NextResponse.json({items:data.rows});
 }catch{return NextResponse.json({error:'Unable to read revisions'},{status:500});}
}
