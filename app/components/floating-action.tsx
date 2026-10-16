'use client';
import {designId} from '@/lib/design-ids';

import {usePathname} from 'next/navigation';
import {PhoneCall,MessageCircle,Mail,Link as LinkIcon} from 'lucide-react';
type Props={previewPath?:string;config:{enabled:string;action:string;url:string;icon:string;svgUrl:string;side:string;size:string;bottom:string;offset:string;bg:string;fg:string;border:string;radius:string;glow:string;tooltip:string;pages:string;whatsapp:string;email:string}};
export default function FloatingAction({config:c,previewPath}:Props){
 const actualPath=usePathname();const path=previewPath||actualPath;
 if(c.enabled==='false'||(c.pages==='home'&&path!=='/')||(c.pages==='inner'&&path==='/'))return null;
 const whatsapp=`https://wa.me/${c.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent('Hi VELAUR LABS, I would like to discuss a project.')}`;
 const fallback=c.action==='call'?`tel:${c.whatsapp}`:c.action==='email'?`mailto:${c.email}`:whatsapp;
 const href=c.url&&/^(https:\/\/|tel:|mailto:)/.test(c.url)?c.url:fallback;
 const Icon=c.icon==='message'?MessageCircle:c.icon==='mail'?Mail:c.icon==='link'?LinkIcon:PhoneCall;
 const size=Math.max(36,Math.min(90,Number(c.size)||52));
 const pos=Math.max(8,Math.min(160,Number(c.offset)||22));
 const bottom=Math.max(8,Math.min(160,Number(c.bottom)||22));
 const radius=Math.max(0,Math.min(50,Number(c.radius)||50));
 const isSvg=c.svgUrl?.startsWith('https://')&&/\.svg(?:[?#]|$)/i.test(c.svgUrl);
 return <a data-design-id={designId("app/components/floating-action.tsx:1409")} className="velaur-floating-action" href={href} target={href.startsWith('https://')?'_blank':undefined} rel={href.startsWith('https://')?'noopener noreferrer':undefined} aria-label={c.tooltip||'Contact VELAUR LABS'} title={c.tooltip||'Contact VELAUR LABS'} style={{width:size,height:size,bottom,[c.side==='left'?'left':'right']:pos,backgroundColor:c.bg,color:c.fg,borderColor:c.border,borderRadius:`${radius}%`,boxShadow:c.glow==='true'?`0 5px 22px ${c.border}77`:'none'}}>
  {isSvg?<span data-design-id={designId("app/components/floating-action.tsx:1895")} aria-hidden className="floating-custom-svg" style={{backgroundImage:`url(${c.svgUrl})`}}/>:<Icon size={Math.round(size*.42)} aria-hidden/>}
 </a>;
}
