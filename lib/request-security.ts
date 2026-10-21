import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { db } from './db';

// These are exact aliases of this application, not a wildcard for Netlify sites.
const siteOrigins = new Set([
  'https://velaurlabs.com',
  'https://www.velaurlabs.com',
  'https://velaurlabs.netlify.app',
]);

function httpOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
        url.pathname !== '/' || url.search || url.hash) return null;
    return url.origin;
  } catch { return null; }
}

/** Require an explicit primary URL; never derive trust from request/proxy headers. */
export function hasValidOrigin(request: NextRequest): boolean {
  const configured = process.env.APP_URL?.trim();
  const origin = request.headers.get('origin');
  if (!configured || !origin) return false;
  const expected = httpOrigin(configured), actual = httpOrigin(origin);
  // A browser Origin is a serialized origin, never a URL with a path or credentials.
  if (!expected || !actual || actual !== origin) return false;
  if (actual === expected) return true;
  // Only enable these aliases when APP_URL identifies this same VELAUR deployment.
  return siteOrigins.has(expected) && siteOrigins.has(actual);
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
