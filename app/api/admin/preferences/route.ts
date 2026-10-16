import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db, isDatabaseConfigured } from '@/lib/db';
import { hasValidOrigin } from '@/lib/request-security';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
  if (!hasValidOrigin(request)) return NextResponse.json({error:'Invalid request origin.'},{status:403});
  const user = await getCurrentAdmin().catch(() => null);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const body = await request.json().catch(() => null) as { theme?: string } | null;
  if (body?.theme !== 'dark' && body?.theme !== 'light') return NextResponse.json({ error: 'Theme must be dark or light.' }, { status: 400 });
  await db.query('UPDATE admin_users SET theme = $1, updated_at = NOW() WHERE id = $2', [body.theme, user.id]);
  await db.query('INSERT INTO audit_logs (actor_user_id, action, module, target_id, details) VALUES ($1, $2, $3, $4, $5)', [user.id, 'THEME_PREFERENCE_UPDATED', 'PROFILE', user.id, JSON.stringify({ theme: body.theme })]);
  return NextResponse.json({ ok: true, theme: body.theme });
}
