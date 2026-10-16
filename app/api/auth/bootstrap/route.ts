import {hasValidOrigin} from '@/lib/request-security';
import { NextRequest, NextResponse } from 'next/server';
import { createTotpSecret, encryptSecret, hashPassword } from '@/lib/auth';
import { db, isDatabaseConfigured } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if(!hasValidOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403});
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
  const bootstrapSecret = process.env.BOOTSTRAP_SECRET;
  if (!bootstrapSecret) return NextResponse.json({ error: 'Initial setup is disabled. Configure BOOTSTRAP_SECRET first.' }, { status: 503 });
  const suppliedSecret = request.headers.get('x-bootstrap-secret') ?? '';
  if (suppliedSecret.length !== bootstrapSecret.length || suppliedSecret !== bootstrapSecret) {
    return NextResponse.json({ error: 'Invalid setup credential.' }, { status: 403 });
  }
  const body = await request.json().catch(() => null) as { email?: string; displayName?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  const displayName = body?.displayName?.trim();
  const password = body?.password ?? '';
  if (!email || !displayName || password.length < 12 || password.length > 200) {
    return NextResponse.json({ error: 'Provide a valid email, display name, and password of at least 12 characters.' }, { status: 400 });
  }
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE admin_users IN EXCLUSIVE MODE');
    const existing = await client.query('SELECT id FROM admin_users LIMIT 1');
    if (existing.rowCount) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Initial administrator already exists.' }, { status: 409 });
    }
    const passwordHash = await hashPassword(password);
    const totpSecret = createTotpSecret();
    const encryptedTotp = encryptSecret(totpSecret);
    const inserted = await client.query(
      `INSERT INTO admin_users (email, display_name, password_hash, role, permissions, two_factor_secret_encrypted)
       VALUES ($1, $2, $3, 'SUPER_ADMIN', '{}'::jsonb, $4) RETURNING id, email, display_name, role`,
      [email, displayName, passwordHash, encryptedTotp],
    );
    await client.query('INSERT INTO audit_logs (actor_user_id, action, module, target_id, details) VALUES ($1, $2, $3, $4, $5)', [inserted.rows[0].id, 'INITIAL_ADMIN_CREATED', 'USERS', inserted.rows[0].id, JSON.stringify({ email })]);
    await client.query('COMMIT');
    const label = encodeURIComponent(`VELAUR LABS:${email}`);
    const otpauthUrl = `otpauth://totp/${label}?secret=${totpSecret}&issuer=VELAUR%20LABS&algorithm=SHA1&digits=6&period=30`;
    return NextResponse.json({ user: inserted.rows[0], totpSecret, otpauthUrl, message: 'Initial Super Admin created. Set up an authenticator app now; this secret is shown only once.' }, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    console.error('Admin bootstrap failed', error);
    return NextResponse.json({ error: 'Could not create the initial administrator.' }, { status: 500 });
  } finally {
    client.release();
  }
}
