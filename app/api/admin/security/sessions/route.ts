import {hasValidOrigin} from '@/lib/request-security';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { getCurrentAdmin, SESSION_COOKIE, hashToken } from '@/lib/auth';
import { writeAudit } from '@/lib/admin-api';
export const runtime = 'nodejs';
export async function GET() {
  const user = await getCurrentAdmin().catch(() => null);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const rows = await db.query<{id:string;created_at:string;last_seen_at:string|null;expires_at:string;is_current:boolean}>(
    `SELECT id, created_at, last_seen_at, expires_at, token_hash = $2 AS is_current
     FROM admin_sessions WHERE user_id=$1 AND expires_at > NOW() ORDER BY last_seen_at DESC NULLS LAST LIMIT 100`,
    [user.id, token ? hashToken(token) : '']);
  return NextResponse.json({sessions: rows.rows}, {headers:{'Cache-Control':'no-store'}});
}
export async function DELETE(request: NextRequest) {
 // All signed-in administrators can revoke their own sessions.
 const user=await getCurrentAdmin().catch(()=>null);
 if (!user) return NextResponse.json({error:'Authentication required'}, {status:401});
 if(!hasValidOrigin(request))return NextResponse.json({error:'Invalid request origin'},{status:403});
 const body=await request.json().catch(()=>null) as {id?:string;allOthers?:boolean}|null;
 const token=(await cookies()).get(SESSION_COOKIE)?.value;
 if(!token)return NextResponse.json({error:'Session cookie missing'},{status:401});
 if(body?.allOthers){const result=await db.query('DELETE FROM admin_sessions WHERE user_id=$1 AND token_hash<>$2',[user.id,hashToken(token)]);
 await writeAudit(user.id,'REVOKE_OTHER_SESSIONS','AUTH',user.id,{count:result.rowCount??0});return NextResponse.json({ok:true,count:result.rowCount??0});}
 if(!body?.id||!/^[0-9a-f-]{36}$/i.test(body.id))return NextResponse.json({error:'Valid session ID required'},{status:400});
 const result=await db.query('DELETE FROM admin_sessions WHERE id=$1 AND user_id=$2 AND token_hash<>$3',[body.id,user.id,hashToken(token)]);
 if(!result.rowCount)return NextResponse.json({error:'Session not found or it is your current session'},{status:404});
 await writeAudit(user.id,'REVOKE_SESSION','AUTH',body.id);return NextResponse.json({ok:true});
}
