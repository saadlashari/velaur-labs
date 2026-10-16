import { NextRequest, NextResponse } from 'next/server';
import {db} from '@/lib/db';
import {requireAdminPermission} from '@/lib/admin-api';
export const runtime='nodejs';
export async function GET(request:NextRequest){
 const auth=await requireAdminPermission(request,'audit','VIEW');if(auth.response)return auth.response;
 const p=request.nextUrl.searchParams;const limit=Math.min(Math.max(Number(p.get('limit'))||50,1),100);
 const offset=Math.min(Math.max(Number(p.get('offset'))||0,0),10000);
 const moduleName=(p.get('module')||'').trim().slice(0,48);
 const [events,count]=await Promise.all([
  db.query(`SELECT a.id,a.action,a.module,a.target_id,a.created_at,u.display_name FROM audit_logs a LEFT JOIN admin_users u ON u.id=a.actor_user_id WHERE ($1='' OR a.module=$1) ORDER BY a.created_at DESC LIMIT $2 OFFSET $3`,[moduleName,limit,offset]),
  db.query<{total:string}>(`SELECT count(*)::text AS total FROM audit_logs WHERE ($1='' OR module=$1)`,[moduleName])]);
 return NextResponse.json({events:events.rows,total:Number(count.rows[0]?.total||0),limit,offset},{headers:{'Cache-Control':'no-store'}});
}
