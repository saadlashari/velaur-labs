'use client';
import {useEffect,useState} from 'react';import {usePathname} from 'next/navigation';
import {createPortal} from 'react-dom';import {BlocksView} from './block-renderer';import type {BuilderBlock} from '@/lib/builder-blocks';
import {parseElementDesign,resolvedElementStyle,cssElementStyle} from '@/lib/element-design';
export default function ElementOverrides({raw,previewPath}:{raw:string;previewPath?:string}){
 const current=usePathname(),path=previewPath||current;
 const [draft,setDraft]=useState(raw),[slots,setSlots]=useState<{element:HTMLElement;blocks:BuilderBlock[]}[]>([]);
 useEffect(()=>setDraft(raw),[raw]);
 useEffect(()=>{if(!previewPath)return;const receive=(event:MessageEvent)=>{if(event.origin===window.location.origin&&event.source===window.parent&&event.data?.type==='velaur-design-draft'&&typeof event.data.raw==='string')setDraft(event.data.raw);};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[previewPath]);
 useEffect(()=>{
  const rules=parseElementDesign(draft)[path]||{};const originals=new Map<Element,{style:string;text:string|null;src:string|null;srcset:string|null;alt:string|null}>();
  const links=new Map<HTMLAnchorElement,string|null>(),containers=new Map<Element,HTMLElement>();
  const linkNavigation=new Map<HTMLAnchorElement,(event:MouseEvent)=>void>();
  const parentOrders=new Map<Element,Element[]>();const targets=new Map<string,Element[]>();
  const restore=(element:Element,original:{style:string;text:string|null;src:string|null;srcset:string|null;alt:string|null})=>{
   if(element instanceof HTMLElement||element instanceof SVGElement)element.setAttribute('style',original.style);
   if(original.text!==null&&element.childElementCount===0&&element.textContent!==original.text)element.textContent=original.text;
   if(element instanceof HTMLImageElement){for(const [key,value] of [['src',original.src],['srcset',original.srcset],['alt',original.alt]] as const){if(value===null)element.removeAttribute(key);else if(element.getAttribute(key)!==value)element.setAttribute(key,value);}}
  };
  const apply=()=>{
   const device=window.innerWidth<=767?'mobile':window.innerWidth<=1024?'tablet':'desktop';
   for(const [selector] of Object.entries(rules))if(!targets.has(selector)||targets.get(selector)!.some(node=>!node.isConnected))targets.set(selector,Array.from(document.querySelectorAll(selector)));
   for(const [selector,rule] of Object.entries(rules))for(const element of targets.get(selector)||[]){
    if(!(element instanceof HTMLElement||element instanceof SVGElement))continue;
    // Let the preview's plaintext editor finish before reapplying saved content.
    if(element.hasAttribute('contenteditable'))continue;
    if(rule.siblingIndex!==undefined&&element.parentElement){const parent=element.parentElement;if(!parentOrders.has(parent))parentOrders.set(parent,Array.from(parent.children));const peers=Array.from(parent.children).filter(node=>node!==element&&!node.classList.contains('design-added-content')&&!/^(STYLE|SCRIPT)$/.test(node.tagName));const before=peers[rule.siblingIndex]||null;if(element.nextElementSibling!==before)parent.insertBefore(element,before);}
    let original=originals.get(element);if(!original){original={style:element.getAttribute('style')||'',text:element.childElementCount===0?element.textContent:null,src:element.getAttribute('src'),srcset:element.getAttribute('srcset'),alt:element.getAttribute('alt')};originals.set(element,original);}else restore(element,original);
    for(const [key,value] of Object.entries(cssElementStyle(resolvedElementStyle(rule,device))))element.style.setProperty(key,value,'important');
    if(rule.hidden||rule.deleted)element.style.setProperty('display','none','important');
    if(element instanceof HTMLAnchorElement&&rule.href!==undefined){if(!links.has(element))links.set(element,element.getAttribute('href'));element.setAttribute('href',rule.href);
     // A Next Link retains its original React destination after a DOM href edit.
     // Let the browser follow the updated anchor, preserving modifier/new-tab behavior.
     if(!previewPath&&!linkNavigation.has(element)){const followSavedLink=(event:MouseEvent)=>{if(event.button===0)event.stopPropagation();};element.addEventListener('click',followSavedLink,true);linkNavigation.set(element,followSavedLink);}
    }
    if(rule.text!==undefined&&element.childElementCount===0&&/^(H[1-6]|P|SPAN|STRONG|SMALL|A|LI|B|LABEL|BLOCKQUOTE|DIV)$/.test(element.tagName)&&element.textContent!==rule.text)element.textContent=rule.text;
    if(element instanceof HTMLImageElement){if(rule.src){element.removeAttribute('srcset');if(element.src!==new URL(rule.src,window.location.origin).href)element.src=rule.src;}if(rule.alt!==undefined)element.alt=rule.alt;}
    if(rule.additions?.length&&!containers.has(element)&&element.parentElement&&!/^(HTML|BODY|SVG|PATH|INPUT|OPTION|TR|TD|TH)$/.test(element.tagName)){const slot=document.createElement('velaur-content');slot.className='design-added-content';element.insertAdjacentElement('afterend',slot);containers.set(element,slot);setSlots(old=>[...old,{element:slot,blocks:rule.additions!}]);}
   }
  };
  apply();const observer=new MutationObserver(()=>{observer.disconnect();apply();observer.observe(document.querySelector('.public-site')||document.body,{childList:true,subtree:true});});observer.observe(document.querySelector('.public-site')||document.body,{childList:true,subtree:true});window.addEventListener('resize',apply);
  return()=>{observer.disconnect();window.removeEventListener('resize',apply);for(const [element,listener] of linkNavigation)element.removeEventListener('click',listener,true);for(const [element,original] of originals)restore(element,original);for(const [element,href] of links){if(href===null)element.removeAttribute('href');else element.setAttribute('href',href);}for(const slot of containers.values())slot.remove();for(const [parent,children] of parentOrders)for(const child of children)if(child.parentElement===parent)parent.appendChild(child);setSlots([]);};
 },[draft,path,previewPath]);
 const hidden=Object.entries(parseElementDesign(draft)[path]||{}).filter(([,rule])=>rule.hidden||rule.deleted).map(([selector])=>selector+'{display:none!important}').join('\n');
 return <>{hidden&&<style>{hidden}</style>}{slots.map((slot,index)=>createPortal(<BlocksView blocks={slot.blocks}/>,slot.element,String(index)))}</>;
}


