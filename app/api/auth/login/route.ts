import { NextRequest, NextResponse } from 'next/server';
import { createSession, decryptSecret, verifyPassword, verifyTotp } from '@/lib/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import {consumeRecoveryCode} from '@/lib/recovery-codes';
import { consumeAttempt, hasValidOrigin } from '@/lib/request-security';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
  if (!hasValidOrigin(request)) return NextResponse.json({error:'Invalid request origin.'},{status:403});
  const body = await request.json().catch(() => null) as { email?: string; password?: string; code?: string } | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!email || !password || email.length > 254 || password.length > 200) return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 });
  try {
    const global = await consumeAttempt('login-global','all',100,60);
    const account = await consumeAttempt('login',email,10,900);
    if (!global.allowed || !account.allowed) return NextResponse.json({error:'Too many sign-in attempts. Please try again later.'},{status:429,headers:{'Retry-After':String(!global.allowed?global.retryAfter:account.retryAfter)}});
  } catch { return NextResponse.json({error:'Sign-in protection is temporarily unavailable.'},{status:503}); }
  const result = await db.query<{ id: string; email: string; display_name: string; password_hash: string; role: string; is_active: boolean; two_factor_enabled: boolean; two_factor_secret_encrypted: string | null }>(
    'SELECT id, email, display_name, password_hash, role, is_active, two_factor_enabled, two_factor_secret_encrypted FROM admin_users WHERE email = $1 LIMIT 1', [email],
  );
  const user = result.rows[0];
  const valid = user ? await verifyPassword(password, user.password_hash) : await verifyPassword(password, 'scrypt$00000000000000000000000000000000$'+'0'.repeat(128));
  if (!user || !valid || !user.is_active) {
    await db.query('INSERT INTO audit_logs (action, module, details) VALUES ($1, $2, $3)', ['LOGIN_FAILED', 'AUTH', JSON.stringify({ email })]).catch(() => undefined);
    return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
  }
  if (user.role === 'SUPER_ADMIN' && !user.two_factor_enabled) {
    return NextResponse.json({ error: 'Super Admin two-factor authentication must be enrolled before sign-in.', setupRequired: true }, { status: 403 });
  }
  if (user.two_factor_enabled) {
    if (typeof body?.code !== 'string' || body.code.length>32 || !user.two_factor_secret_encrypted) return NextResponse.json({ error: 'Enter your authenticator or recovery code.' }, { status: 400 });
    try {
      const validTotp=verifyTotp(decryptSecret(user.two_factor_secret_encrypted), body.code);
      if(validTotp && !(await consumeAttempt('totp',user.id+':'+body.code,1,90)).allowed) return NextResponse.json({error:'This authenticator code was already used. Wait for the next code.'},{status:401});
      const validRecovery=!validTotp && await consumeRecoveryCode(user.id, body.code);
      if (!validTotp && !validRecovery) return NextResponse.json({ error: 'Authenticator or recovery code is incorrect or expired.' }, { status: 401 });
      if(validRecovery) await db.query('INSERT INTO audit_logs(actor_user_id, action, module, target_id) VALUES($1,$2,$3,$4)',[user.id,'2FA_RECOVERY_USED','AUTH',user.id]).catch(()=>undefined);
    } catch {
      return NextResponse.json({ error: 'Could not verify authenticator. Check AUTH_SECRET configuration.' }, { status: 503 });
    }
  }
  await createSession(user.id);
  await db.query('UPDATE admin_users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1', [user.id]);
  await db.query('INSERT INTO audit_logs (actor_user_id, action, module, target_id) VALUES ($1, $2, $3, $4)', [user.id, 'LOGIN_SUCCEEDED', 'AUTH', user.id]);
  return NextResponse.json({ user: { id: user.id, email: user.email, displayName: user.display_name, role: user.role } });
}
