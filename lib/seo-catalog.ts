import catalog from '@/data/seo-pages.json';
export type SeoSection={heading:string;body:string};
export type SeoPage={path:string;label:string;group:string;title:string;description:string;keywords:string[];sections:SeoSection[];noIndex:boolean;headline?:string;answer?:string;definition?:string;takeaways?:string[];reviewedAt?:string};
export const seoPages=catalog as SeoPage[];
export type SeoOverrides=Record<string,Partial<Pick<SeoPage,'title'|'description'|'keywords'|'sections'|'noIndex'|'headline'|'answer'|'definition'|'takeaways'>>>;
const fields=['title','description','keywords','sections','noIndex','headline','answer','definition','takeaways'];
const plain=(value:unknown,max:number)=>typeof value==='string'&&value.trim().length>0&&value.length<=max&&!/[<>\u0000-\u0008]/.test(value);
export function validSeoOverrides(value:unknown):value is SeoOverrides{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 return Object.entries(value).every(([path,entry])=>{
  if(!seoPages.some(page=>page.path===path)||!entry||typeof entry!=='object'||Array.isArray(entry))return false;
  return Object.entries(entry).every(([key,v])=>fields.includes(key)&&(key==='title'?plain(v,100):key==='description'?plain(v,320):key==='headline'?v===''||plain(v,150):key==='answer'||key==='definition'?v===''||plain(v,900):key==='takeaways'?Array.isArray(v)&&v.length<=6&&v.every(term=>plain(term,250)):key==='noIndex'?typeof v==='boolean':key==='keywords'?Array.isArray(v)&&v.length<=15&&v.every(term=>plain(term,100)):Array.isArray(v)&&v.length<=4&&v.every(section=>section&&typeof section==='object'&&!Array.isArray(section)&&Object.keys(section).every(k=>['heading','body'].includes(k))&&plain(section.heading,140)&&plain(section.body,1800))));
 });
}
export function parseSeoOverrides(raw:string):SeoOverrides{try{const value:unknown=JSON.parse(raw);return validSeoOverrides(value)?value:{};}catch{return {};}}
export function resolveSeoPage(path:string,raw='{}'):SeoPage|undefined{const base=seoPages.find(page=>page.path===path);return base?{...base,...parseSeoOverrides(raw)[path]}:undefined;}
