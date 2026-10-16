import {hasValidOrigin} from '@/lib/request-security';
import { NextRequest, NextResponse } from 'next/server';
import { decryptSecret, verifyTotp } from '@/lib/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import {createRecoveryCodes, hashedRecoveryCodes, recoverySettingKey} from '@/lib/recovery-codes';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if(!hasValidOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403});
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
  const expected = process.env.BOOTSTRAP_SECRET ?? '';
  const supplied = request.headers.get('x-bootstrap-secret') ?? '';
  if (!expected || supplied.length !== expected.length || supplied !== expected) return NextResponse.json({ error: 'Invalid setup credential.' }, { status: 403 });
  const body = await request.json().catch(() => null) as { email?: string; code?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? '';
  const code = body?.code ?? '';
  const result = await db.query<{ id: string; two_factor_secret_encrypted: string | null; two_factor_enabled: boolean; role: string }>(
    'SELECT id, two_factor_secret_encrypted, two_factor_enabled, role FROM admin_users WHERE email = $1 LIMIT 1', [email],
  );
  const user = result.rows[0];
  if (!user || user.role !== 'SUPER_ADMIN' || !user.two_factor_secret_encrypted) return NextResponse.json({ error: 'Initial administrator setup was not found.' }, { status: 404 });
  if (user.two_factor_enabled) return NextResponse.json({ error: 'Two-factor authentication is already enabled.' }, { status: 409 });
  if (!/^\d{6}$/.test(String(code))) return NextResponse.json({error:'Enter a six-digit authenticator code.'},{status:400});
  const client=await db.connect();
  try {
    await client.query('BEGIN');
    const locked=await client.query<{two_factor_secret_encrypted:string|null;two_factor_enabled:boolean;role:string}>(
      'SELECT two_factor_secret_encrypted,two_factor_enabled,role FROM admin_users WHERE id=$1 FOR UPDATE',[user.id]);
    const current=locked.rows[0];
    if (!current || current.role!=='SUPER_ADMIN'||!current.two_factor_secret_encrypted||current.two_factor_enabled){
      await client.query('ROLLBACK');
      return NextResponse.json({error:'Setup is no longer available.'},{status:409});
    }
    if (!verifyTotp(decryptSecret(current.two_factor_secret_encrypted), code)){
      await client.query('ROLLBACK');
      return NextResponse.json({error:'Verification code is incorrect or expired.'},{status:400});
    }
    const recoveryCodes=createRecoveryCodes();
    await client.query('UPDATE admin_users SET two_factor_enabled=TRUE, updated_at=NOW() WHERE id=$1',[user.id]);
    await client.query(`INSERT INTO global_settings(setting_key,setting_value,updated_by)
      VALUES($1,$2::jsonb,$3) ON CONFLICT(setting_key) DO UPDATE
      SET setting_value=EXCLUDED.setting_value,updated_by=EXCLUDED.updated_by,updated_at=NOW()`,
      [recoverySettingKey(user.id),JSON.stringify({hashes:hashedRecoveryCodes(recoveryCodes)}),user.id]);
    await client.query('INSERT INTO audit_logs (actor_user_id,action,module,target_id) VALUES($1,$2,$3,$4)',
      [user.id,'SUPER_ADMIN_2FA_ENABLED','AUTH',user.id]);
    await client.query('COMMIT');
    return NextResponse.json({ok:true,recoveryCodes,message:'Two-factor authentication enabled. Save these single-use recovery codes securely; they will not be shown again.'},{headers:{'Cache-Control':'no-store'}});
  } catch (error) {
    await client.query('ROLLBACK').catch(()=>undefined);
    console.error('2FA setup failed', error);
    return NextResponse.json({ error:'Could not verify setup. Check AUTH_SECRET configuration.' },{status:500});
  } finally {client.release();}
}
