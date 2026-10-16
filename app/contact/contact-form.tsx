'use client';
import {inquiryServiceOptions as serviceOptions} from '@/lib/agency-navigation';
import {designId} from '@/lib/design-ids';

import { useState, type FormEvent } from 'react';
import { CalendarDays, Mail, MessageCircle, MapPin, CheckCircle2, LoaderCircle, AlertCircle } from 'lucide-react';

type ContactOptions={initialService?:string;email:string;whatsapp:string;calendly:string;content:{formTitle:string;formIntro:string;sideTitle:string;sideIntro:string;nextCopy:string}};


type SubmissionState = { kind: 'idle' } | { kind: 'sending' } | { kind: 'success'; reference: string } | { kind: 'error'; message: string };

export default function ContactForm({email,whatsapp,calendly,content,initialService=''}:ContactOptions) {
  const [submission, setSubmission] = useState<SubmissionState>({ kind: 'idle' });
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submission.kind === 'sending') return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),15000);
    setSubmission({ kind: 'sending' });
    try {
      const response = await fetch('/api/inquiries', {
        signal:controller.signal,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'), email: data.get('email'), company: data.get('company'),
          service: data.get('service'), budget: data.get('budget'), details: data.get('details'),
          companyWebsite:data.get('companyWebsite'),consent: data.get('consent') === 'on', website: data.get('website'),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not submit your inquiry. Please try again.');
      if(response.status!==201||result.ok!==true||typeof result.reference!=='string'||!result.reference)throw new Error('We could not confirm your inquiry was saved. Please try again.');
      setSubmission({ kind: 'success', reference: result.reference });
      form.reset();
    } catch (error) {
      setSubmission({ kind: 'error', message: controller.signal.aborted?'Your request timed out. Please try again or contact us by email.':error instanceof Error ? error.message : 'We could not submit your inquiry. Please try again.' });
    }finally{clearTimeout(timeout);}
  }

  return <><section id="inquiry-form" data-design-id={designId("app/contact/contact-form.tsx:2019")} className="inner-section contact-layout"><div data-design-id={designId("app/contact/contact-form.tsx:2069")} className="contact-form-wrap"><span data-design-id={designId("app/contact/contact-form.tsx:2104")} className="eyebrow">PROJECT INQUIRY</span><h2 data-design-id={designId("app/contact/contact-form.tsx:2152")}>{content.formTitle}</h2><p data-design-id={designId("app/contact/contact-form.tsx:2180")}>{content.formIntro}</p>
      {submission.kind === 'success' ? <div data-design-id={designId("app/contact/contact-form.tsx:2245")} className="form-preview-notice"><CheckCircle2 size={24}/><h3 data-design-id={designId("app/contact/contact-form.tsx:2308")}>Thanks — we received your inquiry.</h3><p data-design-id={designId("app/contact/contact-form.tsx:2351")}>Your reference number is <strong data-design-id={designId("app/contact/contact-form.tsx:2379")}>{submission.reference}</strong>. Please keep it for your records.</p><button data-design-id={designId("app/contact/contact-form.tsx:2456")} className="button-secondary" type="button" onClick={() => setSubmission({ kind: 'idle' })}>Send another inquiry</button></div> : <form data-design-id={designId("app/contact/contact-form.tsx:2592")} className="contact-form" aria-busy={submission.kind==='sending'} onSubmit={handleSubmit}>
        <div data-design-id={designId("app/contact/contact-form.tsx:2657")} className="form-two-col"><label data-design-id={designId("app/contact/contact-form.tsx:2687")}>Full name *<input data-design-id={designId("app/contact/contact-form.tsx:2705")} required minLength={2} maxLength={120} name="name" autoComplete="name" placeholder="Your name"/></label><label data-design-id={designId("app/contact/contact-form.tsx:2816")}>Work email *<input data-design-id={designId("app/contact/contact-form.tsx:2835")} required type="email" maxLength={254} name="email" autoComplete="email" placeholder="you@company.com"/></label></div>
        <div data-design-id={designId("app/contact/contact-form.tsx:2968")} className="form-two-col"><label data-design-id={designId("app/contact/contact-form.tsx:2998")}>Company<input data-design-id={designId("app/contact/contact-form.tsx:3012")} maxLength={160} name="company" autoComplete="organization" placeholder="Company name"/></label><label data-design-id={designId("app/contact/contact-form.tsx:3114")}>Service of interest *<select data-design-id={designId("app/contact/contact-form.tsx:3142")} required name="service" defaultValue={initialService}><option data-design-id={designId("app/contact/contact-form.tsx:3190")} value="" disabled>Select a service</option>{serviceOptions.map(s => <option data-design-id={designId("app/contact/contact-form.tsx:3265",s)} key={s}>{s}</option>)}</select></label></div>
        <label>Business website<input className="business-url" type="url" name="companyWebsite" maxLength={2048} autoComplete="url" placeholder="https://your-business.com"/><small>Optional. Include https:// so we can find the right website.</small></label>
        <label data-design-id={designId("app/contact/contact-form.tsx:3328")}>Estimated budget<select data-design-id={designId("app/contact/contact-form.tsx:3351")} name="budget" defaultValue=""><option data-design-id={designId("app/contact/contact-form.tsx:3389")} value="">Select a range (optional)</option><option data-design-id={designId("app/contact/contact-form.tsx:3440")}>Under $1,000</option><option data-design-id={designId("app/contact/contact-form.tsx:3469")}>$1,000–$5,000</option><option data-design-id={designId("app/contact/contact-form.tsx:3499")}>$5,000–$15,000</option><option data-design-id={designId("app/contact/contact-form.tsx:3530")}>$15,000+</option><option data-design-id={designId("app/contact/contact-form.tsx:3555")}>Not sure yet</option></select></label>
        <label data-design-id={designId("app/contact/contact-form.tsx:3610")}>Project details *<textarea data-design-id={designId("app/contact/contact-form.tsx:3634")} required minLength={10} maxLength={8000} name="details" rows={5} placeholder="What are you looking to build or improve?"/></label>
        <label data-design-id={designId("app/contact/contact-form.tsx:3783")} className="consent-check"><input data-design-id={designId("app/contact/contact-form.tsx:3816")} type="checkbox" name="consent" required/> <span data-design-id={designId("app/contact/contact-form.tsx:3865")}>I agree that VELAUR LABS may use these details to respond to my inquiry. *</span></label>
        <label data-design-id={designId("app/contact/contact-form.tsx:3969")} aria-hidden="true" style={{position:'absolute',width:1,height:1,padding:0,margin:-1,overflow:'hidden',clip:'rect(0,0,0,0)',whiteSpace:'nowrap',border:0}}>Leave this field empty<input data-design-id={designId("app/contact/contact-form.tsx:4152")} tabIndex={-1} autoComplete="off" name="website"/></label>
        {submission.kind === 'error' && <div data-design-id={designId("app/contact/contact-form.tsx:4256")} role="alert" className="form-preview-notice"><AlertCircle size={20}/><p data-design-id={designId("app/contact/contact-form.tsx:4331")}>{submission.message}</p></div>}
        <button data-design-id={designId("app/contact/contact-form.tsx:4374")} className="button-primary" type="submit" disabled={submission.kind === 'sending'}>{submission.kind === 'sending' ? <>Submitting… <LoaderCircle size={16} className="spin-icon"/></> : <>Submit inquiry <span data-design-id={designId("app/contact/contact-form.tsx:4581")}></span></>}</button>
        <p data-design-id={designId("app/contact/contact-form.tsx:4617")} className="form-fine-print">Your details are used to respond to this inquiry. Do not include passwords or sensitive personal information.</p>
      </form>}
    </div><aside data-design-id={designId("app/contact/contact-form.tsx:4787")} className="contact-details"><span data-design-id={designId("app/contact/contact-form.tsx:4822")} className="eyebrow">GET IN TOUCH</span><h2 data-design-id={designId("app/contact/contact-form.tsx:4867")}>{content.sideTitle}</h2><p data-design-id={designId("app/contact/contact-form.tsx:4895")}>{content.sideIntro}</p><a data-design-id={designId("app/contact/contact-form.tsx:4921")} className="contact-detail-row" href={`mailto:${email}`}><span data-design-id={designId("app/contact/contact-form.tsx:4980")}><Mail size={19}/></span><div data-design-id={designId("app/contact/contact-form.tsx:5010")}><b data-design-id={designId("app/contact/contact-form.tsx:5015")}>Email</b><small data-design-id={designId("app/contact/contact-form.tsx:5027")}>{email}</small></div></a><a data-design-id={designId("app/contact/contact-form.tsx:5059")} className="contact-detail-row" href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"><span data-design-id={designId("app/contact/contact-form.tsx:5179")}><MessageCircle size={19}/></span><div data-design-id={designId("app/contact/contact-form.tsx:5218")}><b data-design-id={designId("app/contact/contact-form.tsx:5223")}>WhatsApp</b><small data-design-id={designId("app/contact/contact-form.tsx:5238")}>{whatsapp}</small></div></a><a data-design-id={designId("app/contact/contact-form.tsx:5273")} className="contact-detail-row" href={calendly} target="_blank" rel="noreferrer"><span data-design-id={designId("app/contact/contact-form.tsx:5356")}><CalendarDays size={19}/></span><div data-design-id={designId("app/contact/contact-form.tsx:5394")}><b data-design-id={designId("app/contact/contact-form.tsx:5399")}>Book a call</b><small data-design-id={designId("app/contact/contact-form.tsx:5417")}>30-minute meeting via Calendly</small></div></a><div data-design-id={designId("app/contact/contact-form.tsx:5472")} className="contact-detail-row"><span data-design-id={designId("app/contact/contact-form.tsx:5508")}><MapPin size={19}/></span><div data-design-id={designId("app/contact/contact-form.tsx:5540")}><b data-design-id={designId("app/contact/contact-form.tsx:5545")}>Availability</b><small data-design-id={designId("app/contact/contact-form.tsx:5564")}>Remote · Worldwide</small></div></div><div data-design-id={designId("app/contact/contact-form.tsx:5609")} className="contact-note"><b data-design-id={designId("app/contact/contact-form.tsx:5639")}>What happens next?</b><p data-design-id={designId("app/contact/contact-form.tsx:5664")}>{content.nextCopy}</p></div></aside></section>
  </>;
}
