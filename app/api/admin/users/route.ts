import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseConfigured } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { requireAdminPermission, writeAudit } from '@/lib/admin-api';

export const runtime = 'nodejs';
const allowedModules = new Set(['pages', 'services', 'projects', 'blog', 'inquiries', 'bookings', 'seo', 'users', 'audit','backups','settings','media','approvals']);
const allowedActions = new Set(['VIEW', 'CREATE', 'EDIT', 'PUBLISH', 'DELETE', 'MANAGE']);

export async function GET(request: NextRequest) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
  const auth = await requireAdminPermission(request, 'users', 'VIEW');
  if (auth.response) return auth.response;
  try {
    const result = await db.query(
      `SELECT id, email, display_name, role, permissions, theme, is_active, two_factor_enabled, last_login_at, created_at
         FROM admin_users ORDER BY created_at DESC LIMIT 200`,
    );
    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error('Admin user list failed', error);
    return NextResponse.json({ error: 'Could not load admin users.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
  const auth = await requireAdminPermission(request, 'users', 'CREATE');
  if (auth.response || !auth.user) return auth.response;
  if (auth.user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Only Super Admin can create administrator accounts.' }, { status: 403 });
  const body = await request.json().catch(() => null) as { email?: string; displayName?: string; password?: string; permissions?: Record<string, string[]> } | null;
  const email = typeof body?.email==='string'?body.email.trim().toLowerCase():'';
  const displayName = typeof body?.displayName==='string'?body.displayName.trim():'';
  const password = typeof body?.password==='string'?body.password:'';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || displayName.length < 2 || displayName.length > 100 || password.length < 12 || password.length > 200) {
    return NextResponse.json({ error: 'Provide a valid email, display name and password of at least 12 characters.' }, { status: 400 });
  }
  const permissions: Record<string, string[]> = {};
  for (const [module, actions] of Object.entries(body?.permissions ?? {})) {
    if (!allowedModules.has(module) || !Array.isArray(actions)) return NextResponse.json({ error: 'Invalid permissions.' }, { status: 400 });
    const safeActions = [...new Set(actions)];
    if (safeActions.some(action => !allowedActions.has(action))) return NextResponse.json({ error: 'Invalid permission action.' }, { status: 400 });
    permissions[module] = safeActions;
  }
  try {
    const passwordHash = await hashPassword(password);
    const result = await db.query(
      `INSERT INTO admin_users (email, display_name, password_hash, role, permissions, created_by)
       VALUES ($1, $2, $3, 'SUB_ADMIN', $4::jsonb, $5)
       RETURNING id, email, display_name, role, permissions, theme, is_active, created_at`,
      [email, displayName, passwordHash, JSON.stringify(permissions), auth.user.id],
    );
    await writeAudit(auth.user.id, 'SUB_ADMIN_CREATED', 'USERS', result.rows[0].id, { email });
    return NextResponse.json({ user: result.rows[0], message: 'Sub-admin created. Share the initial password securely.' }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === '23505') return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    console.error('Sub-admin creation failed', error);
    return NextResponse.json({ error: 'Could not create sub-admin.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
  const auth = await requireAdminPermission(request, 'users', 'MANAGE');
  if (auth.response || !auth.user) return auth.response;
  if (auth.user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Only Super Admin can manage accounts.' }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: string; isActive?: boolean; permissions?: Record<string, string[]>; displayName?: string } | null;
  const id = body?.id ?? '';
  if (!/^[0-9a-f-]{36}$/i.test(id) || id === auth.user.id) return NextResponse.json({ error: 'Select another valid admin account.' }, { status: 400 });
  const target = await db.query<{ role: string }>('SELECT role FROM admin_users WHERE id = $1', [id]);
  if (!target.rowCount) return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });
  if (target.rows[0].role === 'SUPER_ADMIN') return NextResponse.json({ error: 'This endpoint cannot modify Super Admin accounts.' }, { status: 403 });
  const updates: string[] = [];
  const values: unknown[] = [];
  if (typeof body?.isActive === 'boolean') { values.push(body.isActive); updates.push(`is_active = $${values.length}`); }
  if (typeof body?.displayName === 'string') {
    const name = body.displayName.trim();
    if (name.length < 2 || name.length > 100) return NextResponse.json({ error: 'Display name must be 2–100 characters.' }, { status: 400 });
    values.push(name); updates.push(`display_name = $${values.length}`);
  }
  if (body?.permissions) {
    const permissions: Record<string, string[]> = {};
    for (const [module, actions] of Object.entries(body.permissions)) {
      if (!allowedModules.has(module) || !Array.isArray(actions) || actions.some(action => !allowedActions.has(action))) return NextResponse.json({ error: 'Invalid permissions.' }, { status: 400 });
      permissions[module] = [...new Set(actions)];
    }
    values.push(JSON.stringify(permissions)); updates.push(`permissions = $${values.length}::jsonb`);
  }
  if (!updates.length) return NextResponse.json({ error: 'No supported changes supplied.' }, { status: 400 });
  values.push(id);
  try {
    const result = await db.query(`UPDATE admin_users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING id, email, display_name, role, permissions, is_active, updated_at`, values);
    await db.query('DELETE FROM admin_sessions WHERE user_id = $1', [id]);
    await writeAudit(auth.user.id, 'SUB_ADMIN_UPDATED', 'USERS', id, { changedFields: updates.map(value => value.split(' = ')[0]) });
    return NextResponse.json({ user: result.rows[0], message: 'Account updated and existing sessions revoked.' });
  } catch (error) {
    console.error('Sub-admin update failed', error);
    return NextResponse.json({ error: 'Could not update admin account.' }, { status: 500 });
  }
}
