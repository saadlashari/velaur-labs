import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { db } from './db';

const scrypt = promisify(scryptCallback);
export const SESSION_COOKIE = 'velaursid';
const SESSION_DAYS = 7;

export type AdminUser = {
  id: string;
  email: string;
  display_name: string;
  role: 'SUPER_ADMIN' | 'SUB_ADMIN';
  permissions: Record<string, string[]>;
  theme: 'dark' | 'light';
};

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, key] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !key || !/^[a-f0-9]{128}$/i.test(key)) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(key, 'hex');
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.query(
    'INSERT INTO admin_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, hashToken(token), expiresAt],
  );
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: expiresAt,
  });
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const result = await db.query<AdminUser & { session_id: string; is_active: boolean; expires_at: Date }>(
    `SELECT u.id, u.email, u.display_name, u.role, u.permissions, u.theme,
            s.id AS session_id, s.expires_at, u.is_active
       FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > NOW() AND u.is_active = TRUE
      LIMIT 1`,
    [hashToken(token)],
  );
  const user = result.rows[0];
  if (!user) return null;
  void db.query('UPDATE admin_sessions SET last_seen_at = NOW() WHERE id = $1', [user.session_id]).catch(() => undefined);
  return {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    role: user.role,
    permissions: user.permissions ?? {},
    theme: user.theme ?? 'dark',
  };
}

export function can(user: AdminUser, module: string, action: string) {
  if (user.role === 'SUPER_ADMIN') return true;
  const allowed = user.permissions?.[module] ?? [];
  return allowed.includes(action) || allowed.includes('MANAGE');
}


function encryptionKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error('AUTH_SECRET must be configured with at least 32 characters.');
  return createHash('sha256').update(secret).digest();
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}.${cipher.getAuthTag().toString('hex')}.${encrypted.toString('hex')}`;
}

export function decryptSecret(value: string) {
  const [ivHex, tagHex, dataHex] = value.split('.');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
}

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function createTotpSecret() {
  const bytes = randomBytes(20);
  let bits = '';
  for (const byte of bytes) bits += byte.toString(2).padStart(8, '0');
  let encoded = '';
  for (let i = 0; i < bits.length; i += 5) encoded += BASE32[parseInt(bits.slice(i, i + 5).padEnd(5, '0'), 2)];
  return encoded;
}

function decodeBase32(value: string) {
  const normalized = value.replace(/=+$/g, '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (const char of normalized) bits += BASE32.indexOf(char).toString(2).padStart(5, '0');
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

export function verifyTotp(secret: string, code: string, now = Date.now()) {
  if (!/^\d{6}$/.test(code)) return false;
  const key = decodeBase32(secret);
  const counter = Math.floor(now / 1000 / 30);
  for (let drift = -1; drift <= 1; drift++) {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(BigInt(counter + drift));
    const digest = createHmac('sha1', key).update(buffer).digest();
    const offset = digest[digest.length - 1] & 0x0f;
    const binary = ((digest[offset] & 0x7f) << 24) | ((digest[offset + 1] & 0xff) << 16) | ((digest[offset + 2] & 0xff) << 8) | (digest[offset + 3] & 0xff);
    const expected = String(binary % 1_000_000).padStart(6, '0');
    const a = Buffer.from(expected);
    const b = Buffer.from(code);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}
