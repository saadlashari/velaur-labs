import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { isDatabaseConfigured } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });
  try {
    const user = await getCurrentAdmin();
    if (!user) return NextResponse.json({ user: null }, { status: 401 });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Could not verify session.' }, { status: 503 });
  }
}
