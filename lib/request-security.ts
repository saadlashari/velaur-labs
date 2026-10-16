import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { db } from './db';

/** Reject malformed and foreign origins without throwing or trusting proxy headers. */
export function hasValidOrigin(request: NextRequest): boolean {
  try {
    const expected = process.env.APP_URL;
    const origin = request.headers.get('origin');
    if (!expected || !origin) return false;
    const a = new URL(expected), b = new URL(origin);
    return ['http:', 'https:'].includes(a.protocol) && a.origin === b.origin;
  } catch { return false; }
}

/** Atomic, database-backed limits work across multiple server instances. */
export async function consumeAttempt(scope: string, identity: string, limit: number, windowSeconds: number) {
  const key = 'security_rate_' + scope + '_' + createHash('sha256').update(identity).digest('hex');
  const result = await db.query<{ count: number; retry_after: number }>(`
    INSERT INTO global_settings(setting_key,setting_value)
    VALUES($1,jsonb_build_object('count',1,'expires',EXTRACT(EPOCH FROM NOW())+$2::integer))
    ON CONFLICT(setting_key) DO UPDATE SET setting_value =
      CASE WHEN (global_settings.setting_value->>'expires')::numeric <= EXTRACT(EPOCH FROM NOW())
      THEN EXCLUDED.setting_value
      ELSE jsonb_set(global_settings.setting_value,'{count}',to_jsonb((global_settings.setting_value->>'count')::integer+1)) END,
      updated_at=NOW()
    RETURNING (setting_value->>'count')::integer AS count,
      GREATEST(1,CEIL((setting_value->>'expires')::numeric-EXTRACT(EPOCH FROM NOW())))::integer AS retry_after
  `, [key, windowSeconds]);
  const row = result.rows[0];
  if(scope.endsWith('-global')&&row.count===1)void db.query("DELETE FROM global_settings WHERE setting_key IN (SELECT setting_key FROM global_settings WHERE setting_key LIKE 'security_rate_%' AND (setting_value->>'expires')::numeric < EXTRACT(EPOCH FROM NOW())-86400 LIMIT 500)").catch(()=>undefined);
  return { allowed: row.count <= limit, retryAfter: row.retry_after };
}
