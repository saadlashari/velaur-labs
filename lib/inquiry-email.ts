import {db} from './db';
import {getSiteSettings} from './site-settings';

type Message={to:string;subject:string;html:string;template:string};
const escapeHtml=(v:string)=>v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
async function logDelivery(message:Message,inquiryId:string,status:'SENT'|'FAILED',id?:string,error?:string){
 try{await db.query(`INSERT INTO email_logs(provider,recipient,template_key,status,provider_message_id,error_message,related_inquiry_id,sent_at) VALUES('resend',$1,$2,$3,$4,$5,$6,$7)`,[message.to,message.template,status,id??null,error?.slice(0,500)??null,inquiryId,status==='SENT'?new Date():null]);}catch(e){console.error('Email delivery logging failed',e);}
}
async function send(message:Message,inquiryId:string){
 const key=process.env.RESEND_API_KEY;
 const from=process.env.VERIFIED_SENDER_EMAIL;
 if(!key||!from){await logDelivery(message,inquiryId,'FAILED',undefined,'Email provider not configured');return;}
 try{
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[message.to],subject:message.subject,html:message.html}),signal:AbortSignal.timeout(7000)});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(`Provider HTTP ${r.status}`);
  await logDelivery(message,inquiryId,'SENT',String(data.id||''));
 }catch(e){await logDelivery(message,inquiryId,'FAILED',undefined,e instanceof Error?e.message:'Provider failed');}
}
export async function sendInquiryEmails(inquiry:{id:string;reference:string;name:string;email:string;service:string;details:string}){
 const settings=await getSiteSettings();
 const ref=escapeHtml(inquiry.reference), name=escapeHtml(inquiry.name),service=escapeHtml(inquiry.service);
 const admin:Message={to:settings.contact_email,subject:`New VELAUR LABS inquiry — ${inquiry.reference}`,template:'admin_inquiry',html:`<h2>New project inquiry</h2><p>Reference: ${ref}</p><p>Name: ${name}</p><p>Email: ${escapeHtml(inquiry.email)}</p><p>Service: ${service}</p><p>Details:</p><p>${escapeHtml(inquiry.details).replace(/\n/g,'<br>')}</p>`};
 const visitor:Message={to:inquiry.email,subject:`We've received your project inquiry — ${inquiry.reference}`,template:'visitor_confirmation',html:`<p>Hello ${name},</p><p>Thank you for contacting VELAUR LABS about ${service}. We've received your message.</p><p>Your reference is <strong>${ref}</strong>.</p><p>We'll review your inquiry and get back to you as soon as possible.</p><p>VELAUR LABS<br>${escapeHtml(settings.contact_email)}</p>`};
 await Promise.allSettled([send(admin,inquiry.id),send(visitor,inquiry.id)]);
}
