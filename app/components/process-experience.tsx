'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {Compass,PanelsTopLeft,Code2,ClipboardCheck,Rocket,Check,ChevronDown} from 'lucide-react';
import {designId} from '@/lib/design-ids';
type Step={title:string;description:string;deliverable:string};
const icons=[Compass,PanelsTopLeft,Code2,ClipboardCheck,Rocket];
const palette=['#1358a7','#237fbd','#586bc7','#8557c4','#ad51ba'];
function polar(radius:number,angle:number){const radians=angle*Math.PI/180;return [450+radius*Math.cos(radians),430-radius*Math.sin(radians)];}
function segment(index:number,total:number){const start=180-index*180/total-1.3,end=180-(index+1)*180/total+1.3;const a=polar(310,start),b=polar(310,end),c=polar(170,end),d=polar(170,start);return `M ${a} A 310 310 0 0 1 ${b} L ${c} A 170 170 0 0 0 ${d} Z`;}
export default function ProcessExperience({items,details}:{items:Step[];details:string[][]}){
 const [active,setActive]=useState(0);const story=useRef<HTMLDivElement>(null);const uid=useId().replace(/:/g,'');
 useEffect(()=>{if(!story.current||!('IntersectionObserver' in window))return;const ratios=new Map<number,number>();const observer=new IntersectionObserver(entries=>{for(const entry of entries)ratios.set(Number((entry.target as HTMLElement).dataset.phase),entry.isIntersecting?entry.intersectionRatio:0);const visible=[...ratios].filter(([,ratio])=>ratio>0).sort((a,b)=>b[1]-a[1]);if(visible.length)setActive(visible[0][0]);},{rootMargin:'-12% 0px -12% 0px',threshold:[0,.2,.4,.6,.8,1]});story.current.querySelectorAll('[data-phase]').forEach(node=>observer.observe(node));return()=>observer.disconnect();},[]);
 return <div ref={story} className="delivery-experience" aria-label="Our delivery process">
  <div className="delivery-map"><div className="delivery-arc" aria-hidden="true"><svg viewBox="0 0 900 485" focusable="false">
   <defs>{palette.map((color,index)=><linearGradient key={index} id={`${uid}-phase-${index}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={color}/><stop offset="1" stopColor={color} stopOpacity=".68"/></linearGradient>)}</defs>
   <path className="delivery-arc-track" d="M 130 430 A 320 320 0 0 1 770 430"/>
   {items.map((step,index)=>{const Icon=icons[index%icons.length],angle=180-(index+.5)*180/items.length,[x,y]=polar(245,angle),[nx,ny]=polar(190,angle);return <g key={index} className="delivery-wedge" data-emphasis={active===index}><path d={segment(index,items.length)} fill={`url(#${uid}-phase-${index%palette.length})`}/><Icon x={x-25} y={y-25} width={50} height={50} strokeWidth={1.3}/><text x={nx} y={ny+7} textAnchor="middle">{String(index+1).padStart(2,'0')}</text></g>;})}
   <circle className="delivery-hub-ring" cx="450" cy="430" r="157"/><circle className="delivery-hub" cx="450" cy="430" r="146"/>
  </svg><div className="delivery-hub-label"><span>OUR DELIVERY</span><strong>APPROACH</strong><i/></div></div>
  {items.map((step,index)=>{const Icon=icons[index%icons.length];return <article key={index} data-phase={index} data-active={active===index} className={`delivery-callout delivery-callout-${index}`} aria-labelledby={`phase-heading-${index}`} data-design-id={designId('home-process-scene',String(index))}><span className="delivery-phase-icon" aria-hidden="true"><Icon size={23}/></span><div className="delivery-callout-copy"><h3 id={`phase-heading-${index}`} data-design-id={designId('home-process-title',String(index))}><span className="delivery-phase-number">{String(index+1).padStart(2,'0')}.</span> {step.title}</h3><div className="delivery-outcome" data-design-id={designId('home-process-deliverable',String(index))}>{step.deliverable}</div><p data-design-id={designId('home-process-description',String(index))}>{step.description}</p></div></article>;})}</div>
  <details className="delivery-detail-disclosure"><summary>Explore the delivery details <ChevronDown size={18} aria-hidden="true"/></summary><div className="delivery-detail-grid">{items.map((step,index)=>{const Icon=icons[index%icons.length];return <div className="delivery-detail-card" key={index}><div className="delivery-detail-heading"><span><Icon size={22} aria-hidden="true"/></span><h4>{String(index+1).padStart(2,'0')} / {step.title}</h4></div><ul className="process-phase-points">{(details[index]||[]).map((point,n)=><li key={n} data-design-id={designId('home-process-point',`${index}-${n}`)}><Check size={16} aria-hidden="true"/><span>{point}</span></li>)}</ul></div>;})}</div></details>
 </div>;
}
