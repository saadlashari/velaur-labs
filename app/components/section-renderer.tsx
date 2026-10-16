import StructuredData,{faqStructuredData} from './structured-data';

import {designId} from '@/lib/design-ids';
import Link from 'next/link';
import type {CSSProperties} from 'react';
import type { PublicSection } from '@/lib/page-builder';
import { isApprovedContentUrl } from '@/lib/section-content-validation';
import {BlocksView} from './block-renderer';
import {validateBlocks,type BuilderBlock} from '@/lib/builder-blocks';
const str=(v:unknown)=>typeof v==='string'?v:'';
const safeUrl=(v:unknown)=>isApprovedContentUrl(v)?(v as string).trim():'';
const list=(v:unknown):Record<string,unknown>[]=>Array.isArray(v)?v.filter(x=>!!x&&typeof x==='object'&&!Array.isArray(x)):[];
function visualStyle(raw:Record<string,unknown> = {}):CSSProperties {
 const color=(v:unknown)=>typeof v==='string'&&/^#[a-fA-F0-9]{6}$/.test(v)?v:undefined;
 const px=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)?`${Math.max(min,Math.min(max,v))}px`:undefined;
 const alignment=['left','center','right'].includes(String(raw.alignment))?raw.alignment as CSSProperties['textAlign']:undefined;
 const style:CSSProperties & Record<string,string|number|undefined>={
  backgroundColor:color(raw.backgroundColor),color:color(raw.textColor),textAlign:alignment,
  paddingTop:px(raw.paddingTop,0,240),paddingBottom:px(raw.paddingBottom,0,240),
  borderRadius:px(raw.borderRadius,0,70),
  '--section-title-size':px(raw.headingSize,18,100),
  '--section-text-size':px(raw.bodySize,12,32),
  '--section-width':px(raw.maxWidth,320,1600),
  '--section-title-tablet':px(raw.tabletHeadingSize,18,84),
  '--section-text-tablet':px(raw.tabletBodySize,12,30),
  '--section-pad-tablet':px(raw.tabletPadding,8,160),
  '--section-title-mobile':px(raw.mobileHeadingSize,18,64),
  '--section-text-mobile':px(raw.mobileBodySize,12,24),
  '--section-pad-mobile':px(raw.mobilePadding,8,120),
  '--builder-card-bg':color(raw.cardBackground),
  '--builder-card-border':color(raw.cardBorder),
  '--builder-card-radius':px(raw.cardRadius,0,56),
  '--builder-card-gap':px(raw.cardGap,0,80),
  '--builder-image-radius':px(raw.imageRadius,0,56),
  '--builder-image-height':px(raw.imageHeight,120,700),
  '--builder-image-fit':raw.imageFit==='contain'?'contain':'cover',
  '--builder-image-order':raw.imagePosition==='left'?0:2,
  '--builder-shadow':raw.cardShadow===true?'0 18px 42px rgba(0,0,0,.25)':'none' 
 };
 return style;
}
function ActionLink({href,label}:{href:unknown;label:string}) {
 const url=safeUrl(href);
 if(!url)return null;
 return url.startsWith('/')?<Link className="button-primary" href={url}>{label}</Link>:<a data-design-id={designId("app/components/section-renderer.tsx:2495")} className="button-primary" href={url} target="_blank" rel="noopener noreferrer">{label}</a>;
}
function CardLink({href,label,project=false}:{href:unknown;label?:unknown;project?:boolean}){
 const url=safeUrl(href);
 if(!url)return null;
 return url.startsWith('/')?<Link className="builder-card-link" href={url}>{str(label)||(project?'View project':'Learn more')}</Link>:<a data-design-id={designId("app/components/section-renderer.tsx:2869")} className="builder-card-link" href={url} target="_blank" rel="noopener noreferrer">{str(label)||(project?'Visit project':'Learn more')}</a>;
}
function Picture({src,alt,cover=false}:{src:unknown;alt:string;cover?:boolean}){
 const url=safeUrl(src);if(!url)return null;
 return <div data-design-id={designId("app/components/section-renderer.tsx:3148")} className={cover?'builder-media builder-media-cover':'builder-media'}><img data-design-id={designId("app/components/section-renderer.tsx:3224")} src={url} alt={alt} loading="lazy" decoding="async"/></div>;
}
function Section({section}:{section:PublicSection}){
 const deviceClasses=['desktop','tablet','mobile'].filter(device=>section.settings?.['hideOn'+device[0].toUpperCase()+device.slice(1)]===true).map(device=>'builder-hide-'+device).join(' ');
 const c=section.content||{};const heading=str(c.heading);const body=str(c.text);const items=list(c.items);
 const label=str(c.buttonLabel)||'Contact Us';const design=visualStyle(section.settings);const cols=Math.max(1,Math.min(4,Number(section.settings?.columns)||3));
 if(section.section_type==='LAYOUT')return validateBlocks(c.blocks)?null:<section data-design-id={designId("app/components/section-renderer.tsx:3878",section.section_key)} style={design} className={'builder-section '+deviceClasses}><div data-design-id={designId("app/components/section-renderer.tsx:3947",section.section_key)} className="builder-wrap"><BlocksView blocks={c.blocks as BuilderBlock[]}/></div></section>;
 if(section.section_type==='HERO')return <section data-design-id={designId("app/components/section-renderer.tsx:4084",section.section_key)} style={design} className={"builder-section builder-hero "+deviceClasses}><div data-design-id={designId("app/components/section-renderer.tsx:4167",section.section_key)} className="builder-wrap builder-split"><div data-design-id={designId("app/components/section-renderer.tsx:4211",section.section_key)}><p data-design-id={designId("app/components/section-renderer.tsx:4216",section.section_key)} className="builder-kicker">VELAUR LABS</p>{heading&&<h2 data-design-id={designId("app/components/section-renderer.tsx:4271",section.section_key)}>{heading}</h2>}{body&&<p data-design-id={designId("app/components/section-renderer.tsx:4297",section.section_key)}>{body}</p>}<ActionLink href={c.href} label={label}/></div><Picture src={c.imageUrl} alt={str(c.imageAlt)||heading} cover/></div></section>;
 if(section.section_type==='CTA')return <section data-design-id={designId("app/components/section-renderer.tsx:4479",section.section_key)} style={design} className={"builder-section builder-cta "+deviceClasses}><div data-design-id={designId("app/components/section-renderer.tsx:4561",section.section_key)} className="builder-wrap">{heading&&<h2 data-design-id={designId("app/components/section-renderer.tsx:4601",section.section_key)}>{heading}</h2>}{body&&<p data-design-id={designId("app/components/section-renderer.tsx:4627",section.section_key)}>{body}</p>}<ActionLink href={safeUrl(c.href)||'/contact'} label={label}/></div></section>;
 if(section.section_type==='STATS')return <section data-design-id={designId("app/components/section-renderer.tsx:4762",section.section_key)} style={design} className={"builder-section "+deviceClasses}><div data-design-id={designId("app/components/section-renderer.tsx:4832",section.section_key)} className="builder-wrap">{heading&&<h2 data-design-id={designId("app/components/section-renderer.tsx:4872",section.section_key)}>{heading}</h2>}{body&&<p data-design-id={designId("app/components/section-renderer.tsx:4898",section.section_key)}>{body}</p>}<div data-design-id={designId("app/components/section-renderer.tsx:4912",section.section_key)} className="builder-cards builder-stats" style={{'--builder-cols':cols} as CSSProperties}>{items.map((x,i)=><div data-design-id={designId("app/components/section-renderer.tsx:5024",i)} key={i} className="builder-stat"><strong data-design-id={designId("app/components/section-renderer.tsx:5062",section.section_key)}>{str(x.value)||str(x.title)}</strong><span data-design-id={designId("app/components/section-renderer.tsx:5107",section.section_key)}>{str(x.label)||str(x.text)}</span></div>)}</div></div></section>;
 if(['CARDS','PROJECTS'].includes(section.section_type))return <section data-design-id={designId("app/components/section-renderer.tsx:5241",section.section_key)} style={design} className={"builder-section "+deviceClasses}><div data-design-id={designId("app/components/section-renderer.tsx:5311",section.section_key)} className="builder-wrap">{heading&&<h2 data-design-id={designId("app/components/section-renderer.tsx:5351",section.section_key)}>{heading}</h2>}{body&&<p data-design-id={designId("app/components/section-renderer.tsx:5377",section.section_key)}>{body}</p>}<div data-design-id={designId("app/components/section-renderer.tsx:5391",section.section_key)} className="builder-cards" style={{'--builder-cols':cols} as CSSProperties}>{items.map((x,i)=><article data-design-id={designId("app/components/section-renderer.tsx:5489",i)} key={i} className="builder-card"><Picture src={x.imageUrl} alt={str(x.imageAlt)||str(x.title)}/>{str(x.category)&&<span data-design-id={designId("app/components/section-renderer.tsx:5612",section.section_key)} className="builder-card-kicker">{str(x.category)}</span>}<h3 data-design-id={designId("app/components/section-renderer.tsx:5675",section.section_key)}>{str(x.title)}</h3><p data-design-id={designId("app/components/section-renderer.tsx:5698",section.section_key)}>{str(x.text)||str(x.description)}</p><CardLink href={x.href} label={x.linkLabel} project={section.section_type==='PROJECTS'}/></article>)}</div></div></section>;
 if(section.section_type==='FAQ')return <><StructuredData value={faqStructuredData(items.map(x=>({question:str(x.question)||str(x.title),answer:str(x.answer)||str(x.text)})))}/><section data-design-id={designId("app/components/section-renderer.tsx:5902",section.section_key)} style={design} className={"builder-section "+deviceClasses}><div data-design-id={designId("app/components/section-renderer.tsx:5972",section.section_key)} className="builder-wrap">{heading&&<h2 data-design-id={designId("app/components/section-renderer.tsx:6012",section.section_key)}>{heading}</h2>}{items.map((x,i)=><details data-design-id={designId("app/components/section-renderer.tsx:6049",i)} className="builder-faq" key={i}><summary data-design-id={designId("app/components/section-renderer.tsx:6090",section.section_key)}>{str(x.question)||str(x.title)}</summary><p data-design-id={designId("app/components/section-renderer.tsx:6140",section.section_key)}>{str(x.answer)||str(x.text)}</p></details>)}</div></section></>;
 return <section data-design-id={designId("app/components/section-renderer.tsx:6212",section.section_key)} style={design} className={"builder-section "+deviceClasses}><div data-design-id={designId("app/components/section-renderer.tsx:6282",section.section_key)} className="builder-wrap builder-split"><div data-design-id={designId("app/components/section-renderer.tsx:6326",section.section_key)}>{heading&&<h2 data-design-id={designId("app/components/section-renderer.tsx:6341",section.section_key)}>{heading}</h2>}{body&&<p data-design-id={designId("app/components/section-renderer.tsx:6367",section.section_key)}>{body}</p>}<ActionLink href={c.href} label={str(c.buttonLabel)||'Learn more'}/></div><Picture src={c.imageUrl} alt={str(c.imageAlt)||heading} cover/></div></section>;
}
export function SectionsView({sections}:{sections:PublicSection[]}){return <>{sections.map(section=><Section key={section.section_key} section={section}/>)}</>}

