import {Breadcrumbs} from '@/app/components/agency-sections';
import {metadataForPath} from '@/lib/seo';
import {inquiryServiceOptions} from '@/lib/agency-navigation';
import PublishedSections from '@/app/components/published-sections';
import type {Metadata} from 'next';
import {PublicLayout} from '../components/site-chrome';
import PageHero from '../components/page-hero';
import ContactForm from './contact-form';
import {getSiteSettings} from '@/lib/site-settings';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{return metadataForPath('/contact');}
export default async function ContactPage({searchParams}:{searchParams?:Promise<{service?:string}>}={}){
 const requested=(await searchParams)?.service;const initialService=requested&&inquiryServiceOptions.includes(requested)?requested:'';
 const settings=await getSiteSettings();
 const t=(key:keyof typeof settings,fallback:string)=>typeof settings[key]==='string'&&settings[key].trim()?settings[key]:fallback;
 return <PublicLayout><Breadcrumbs items={[{label:"Home",href:"/"},{label:'Contact'}]}/><PageHero showActions={false} eyebrow={t('contact_hero_eyebrow','CONTACT VELAUR LABS')} title={t('contact_hero_title','Let’s build something')} highlight={t('contact_hero_highlight','meaningful.')} copy={t('contact_hero_copy','Tell us about the idea, challenge or opportunity you have in mind. We’ll use the details to understand what a useful next step could look like.')}/><ContactForm initialService={initialService} email={settings.contact_email} whatsapp={settings.whatsapp_number} calendly={settings.calendly_url} content={{formTitle:t('contact_form_title','Tell us a little about it.'),formIntro:t('contact_form_intro','Share what you can. You don’t need every detail figured out to start a conversation.'),sideTitle:t('contact_side_title','Prefer a direct conversation?'),sideIntro:t('contact_side_intro','Choose the channel that works best for you.'),nextCopy:t('contact_next_copy','Your inquiry is saved when the form confirms successful submission. The team will review it through our inquiry system. Email confirmations depend on configured delivery settings.')}}/><PublishedSections slug="contact"/></PublicLayout>;
}
