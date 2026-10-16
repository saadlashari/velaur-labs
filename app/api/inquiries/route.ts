import {inquiryServiceOptions} from '@/lib/agency-navigation';
import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseConfigured } from '@/lib/db';
import { sendInquiryEmails } from '@/lib/inquiry-email';
import {hasValidOrigin,consumeAttempt} from '@/lib/request-security';

export const runtime = 'nodejs';
const services = new Set([...inquiryServiceOptions,'Software Testing']);

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Inquiry service is temporarily unavailable. Please email contact@velaurlabs.com.' }, { status: 503 });
  if (!hasValidOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const company = typeof body?.company === 'string' ? body.company.trim() : '';
  const service = typeof body?.service === 'string' ? body.service : '';
  const budget = typeof body?.budget === 'string' ? body.budget.trim() : '';
  const details = typeof body?.details === 'string' ? body.details.trim() : '';
  const companyWebsite=typeof body?.companyWebsite==='string'?body.companyWebsite.trim():'';
  let validWebsite=!companyWebsite;try{if(companyWebsite){const parsed=new URL(companyWebsite);validWebsite=['http:','https:'].includes(parsed.protocol)&&!parsed.username&&!parsed.password&&companyWebsite.length<=2048;}}catch{validWebsite=false;}
  const consent = body?.consent === true;
  // Honeypot field: bots often fill hidden fields.
  if (typeof body?.website === 'string' && body.website.trim()) return NextResponse.json({error:'Could not submit your inquiry. Please review the form and try again.'},{status:400});
  if (name.length < 2 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !services.has(service) || details.length < 10 || details.length > 8000 || company.length > 160 || budget.length > 80 || !consent || !validWebsite) {
    return NextResponse.json({ error: 'Please check the required fields and try again.' }, { status: 400 });
  }
  const reference = `VL-${new Date().getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  try {
    const global=await consumeAttempt('inquiry-global','all',50,60);
    const sender=await consumeAttempt('inquiry-sender',email,5,900);
    if(!global.allowed||!sender.allowed)return NextResponse.json({error:'Too many inquiries. Please try again later.'},{status:429,headers:{'Retry-After':String(!global.allowed?global.retryAfter:sender.retryAfter)}});
    const result = await db.query<{ id:string; reference_code: string; created_at: Date }>(
      `INSERT INTO inquiries (reference_code, name, email, company, service, budget, details, consent_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING id,reference_code, created_at`,
      [reference, name, email, company || null, service, budget || null, companyWebsite?`Business website: ${companyWebsite}\n\n${details}`:details],
    );
    await sendInquiryEmails({id:result.rows[0].id,reference:reference,name,email,service,details:companyWebsite?`Business website: ${companyWebsite}\n\n${details}`:details}).catch((e)=>console.error('Email processing failed',e));
    return NextResponse.json({ ok: true, reference: result.rows[0].reference_code, createdAt: result.rows[0].created_at, message: 'Your inquiry has been received.' }, { status: 201 });
  } catch (error) {
    console.error('Inquiry submission failed', error);
    return NextResponse.json({ error: 'We could not save your inquiry. Please try again or email contact@velaurlabs.com.' }, { status: 500 });
  }
}
