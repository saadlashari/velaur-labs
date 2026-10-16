import { NextRequest,NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, hashToken } from '@/lib/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import {hasValidOrigin} from '@/lib/request-security';

export const runtime = 'nodejs';

export async function POST(request:NextRequest) {
  if(!hasValidOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403});
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token && isDatabaseConfigured()) {
    await db.query('DELETE FROM admin_sessions WHERE token_hash = $1', [hashToken(token)]).catch(() => undefined);
  }
  store.set(SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', expires: new Date(0) });
  return NextResponse.json({ ok: true });
}
