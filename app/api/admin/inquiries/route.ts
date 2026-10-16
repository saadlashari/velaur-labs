import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseConfigured } from '@/lib/db';
import { requireAdminPermission, writeAudit } from '@/lib/admin-api';

export const runtime = 'nodejs';
const statuses = new Set(['NEW', 'IN_PROGRESS', 'REPLIED', 'CONVERTED', 'CLOSED']);
const priorities = new Set(['LOW', 'NORMAL', 'HIGH', 'URGENT']);

export async function GET(request: NextRequest) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
  const auth = await requireAdminPermission(request, 'inquiries', 'VIEW');
  if (auth.response) return auth.response;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = (searchParams.get('q') ?? '').trim().slice(0, 120);
  const page = Math.max(1, Math.min(10000, Number(searchParams.get('page') ?? 1) || 1));
  const limit = 25;
  const values: unknown[] = [];
  let where = 'WHERE 1=1';
  if (status && statuses.has(status)) { values.push(status); where += ` AND i.status = $${values.length}`; }
  if (search) {
    values.push(`%${search}%`);
    where += ` AND (i.name ILIKE $${values.length} OR i.email ILIKE $${values.length} OR i.company ILIKE $${values.length} OR i.reference_code ILIKE $${values.length})`;
  }
  values.push(limit, (page - 1) * limit);
  try {
    const result = await db.query(
      `SELECT i.id, i.reference_code, i.name, i.email, i.company, i.service, i.budget, i.details,
              i.status, i.priority, i.assigned_to, u.display_name AS assigned_name, i.internal_notes,
              i.follow_up_at, i.created_at, i.updated_at
         FROM inquiries i LEFT JOIN admin_users u ON u.id = i.assigned_to
         ${where} ORDER BY i.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );
    const countValues = values.slice(0, -2);
    const count = await db.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM inquiries i ${where}`, countValues);
    const assignees = await db.query('SELECT id, display_name, email FROM admin_users WHERE is_active = TRUE ORDER BY display_name');
    return NextResponse.json({ items: result.rows, total: Number(count.rows[0]?.count ?? 0), page, pageSize: limit, assignees: assignees.rows });
  } catch (error) {
    console.error('Inquiry list failed', error);
    return NextResponse.json({ error: 'Could not load inquiries.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
  const auth = await requireAdminPermission(request, 'inquiries', 'EDIT');
  if (auth.response || !auth.user) return auth.response;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const id = typeof body?.id === 'string' ? body.id : '';
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'A valid inquiry ID is required.' }, { status: 400 });
  const fields: string[] = [];
  const values: unknown[] = [];
  const add = (column: string, value: unknown) => { values.push(value); fields.push(`${column} = $${values.length}`); };
  if (typeof body?.status === 'string') {
    if (!statuses.has(body.status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    if (!auth.user || (!((auth.user.role === 'SUPER_ADMIN') || (auth.user.permissions?.inquiries ?? []).some(p => ['EDIT', 'MANAGE'].includes(p))))) return NextResponse.json({ error: 'You cannot change inquiry status.' }, { status: 403 });
    add('status', body.status);
  }
  if (typeof body?.priority === 'string') {
    if (!priorities.has(body.priority)) return NextResponse.json({ error: 'Invalid priority.' }, { status: 400 });
    add('priority', body.priority);
  }
  if (body?.assignedTo === null || typeof body?.assignedTo === 'string') {
    const assignee = body.assignedTo as string | null;
    if (assignee && !/^[0-9a-f-]{36}$/i.test(assignee)) return NextResponse.json({ error: 'Invalid assignee.' }, { status: 400 });
    if (assignee) {
      const exists = await db.query('SELECT id FROM admin_users WHERE id = $1 AND is_active = TRUE', [assignee]);
      if (!exists.rowCount) return NextResponse.json({ error: 'Selected admin is not active.' }, { status: 400 });
    }
    add('assigned_to', assignee);
  }
  if (typeof body?.internalNotes === 'string') {
    if (body.internalNotes.length > 10000) return NextResponse.json({ error: 'Notes are too long.' }, { status: 400 });
    add('internal_notes', body.internalNotes.trim());
  }
  if (typeof body?.followUpAt === 'string' || body?.followUpAt === null) {
    const date = body.followUpAt === null || body.followUpAt === '' ? null : new Date(String(body.followUpAt));
    if (date && Number.isNaN(date.getTime())) return NextResponse.json({ error: 'Invalid follow-up date.' }, { status: 400 });
    add('follow_up_at', date);
  }
  if (!fields.length) return NextResponse.json({ error: 'No supported fields supplied.' }, { status: 400 });
  values.push(id);
  try {
    const result = await db.query(`UPDATE inquiries SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING id, reference_code, status, priority, assigned_to, internal_notes, follow_up_at, updated_at`, values);
    if (!result.rowCount) return NextResponse.json({ error: 'Inquiry not found.' }, { status: 404 });
    await writeAudit(auth.user.id, 'INQUIRY_UPDATED', 'INQUIRIES', id, { fields: fields.map(field => field.split(' = ')[0]) });
    return NextResponse.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Inquiry update failed', error);
    return NextResponse.json({ error: 'Could not update inquiry.' }, { status: 500 });
  }
}
