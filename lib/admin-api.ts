import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin, can, type AdminUser } from '@/lib/auth';
import { hasValidOrigin } from './request-security';

export async function requireAdminPermission(request: NextRequest, module: string, action: string) {
  const user = await getCurrentAdmin().catch(() => null);
  if (!user) return { user: null, response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) };
  const normalizedAction = ({ READ: 'VIEW', UPDATE: 'EDIT' } as Record<string, string>)[action] ?? action;
  if (!can(user, module, normalizedAction)) return { user, response: NextResponse.json({ error: 'You do not have permission to perform this action.' }, { status: 403 }) };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    if (!hasValidOrigin(request)) {
      return { user, response: NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 }) };
    }
  }
  return { user: user as AdminUser, response: null };
}

export async function writeAudit(userId: string, action: string, module: string, targetId?: string, details: Record<string, unknown> = {}) {
  const { db } = await import('@/lib/db');
  await db.query(
    'INSERT INTO audit_logs (actor_user_id, action, module, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [userId, action, module, targetId ?? null, JSON.stringify(details)],
  );
}
