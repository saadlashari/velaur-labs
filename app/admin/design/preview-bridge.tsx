'use client';
import {describeElement,type ElementSelection} from '@/lib/element-selection';
import {useEffect,useRef,useState} from 'react';
export default function PreviewBridge({settings}:{settings:Record<string,string>}){
 const [selection,setSelection]=useState<ElementSelection|null>(null),[position,setPosition]=useState({left:12,top:12});const target=useRef<HTMLElement|null>(null);
 useEffect(()=>{
  const send=(message:Record<string,unknown>)=>window.parent.postMessage(message,window.location.origin);
  const place=()=>{const bounds=target.current?.getBoundingClientRect();if(bounds)setPosition({left:Math.max(8,Math.min(bounds.left,window.innerWidth-320)),top:Math.max(8,Math.min(bounds.top-46,window.innerHeight-46))});};
  const select=(event:MouseEvent)=>{const node=event.target as HTMLElement;if(node.closest('.preview-element-actions'))return;if(node.closest('.design-added-content'))return;
   if(node.closest('a')&&event.altKey){event.preventDefault();const href=node.closest('a')?.getAttribute('href');if(href?.startsWith('/')&&!href.startsWith('/admin'))send({type:'velaur-design-navigate',href});return;}
   const descriptor=describeElement(node);if(descriptor){target.current?.removeAttribute('data-editor-selected');target.current=node;node.setAttribute('data-editor-selected','true');setSelection(descriptor);place();send({type:'velaur-design-element',element:descriptor});}
   if(node.closest('a,button')&&!node.closest('.theme-toggle,.mobile-menu-toggle,.nav-dropdown-trigger')){event.preventDefault();event.stopPropagation();}
  };
  const inline=(event:MouseEvent)=>{const node=event.target as HTMLElement;if(node.closest('.preview-element-actions,.design-added-content')||node.childElementCount||!/^(H[1-6]|P|SPAN|STRONG|SMALL|A|LI|B|BLOCKQUOTE)$/.test(node.tagName))return;event.preventDefault();const descriptor=describeElement(node);if(!descriptor)return;
   const original=node.textContent||'';node.contentEditable='plaintext-only';node.focus();
   const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){node.textContent=original;node.blur();}if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();node.blur();}};
   const finish=()=>{node.removeAttribute('contenteditable');node.removeEventListener('keydown',key);send({type:'velaur-design-inline',element:descriptor,text:node.textContent||''});};node.addEventListener('keydown',key);node.addEventListener('blur',finish,{once:true});
  };
  const onScroll=()=>{place();send({type:'velaur-design-scroll',top:window.scrollY});};
  const receive=(event:MessageEvent)=>{if(event.origin!==window.location.origin||event.source!==window.parent)return;if(event.data?.type==='velaur-design-scroll-to'&&typeof event.data.top==='number')window.scrollTo(0,event.data.top);};
  const stopSubmit=(event:Event)=>{event.preventDefault();event.stopPropagation();};
  const orderObserver=new MutationObserver(()=>{if(target.current){const descriptor=describeElement(target.current);if(descriptor)setSelection(descriptor);place();}});const site=document.querySelector('.public-site');if(site)orderObserver.observe(site,{childList:true,subtree:true});
  document.addEventListener('submit',stopSubmit,true);document.addEventListener('click',select,true);document.addEventListener('dblclick',inline,true);window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',place);window.addEventListener('message',receive);send({type:'velaur-design-ready'});
  return()=>{orderObserver.disconnect();target.current?.removeAttribute('data-editor-selected');document.removeEventListener('click',select,true);document.removeEventListener('dblclick',inline,true);document.removeEventListener('submit',stopSubmit,true);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',place);window.removeEventListener('message',receive);};
 },[settings]);
 const action=(action:string)=>{if(selection)window.parent.postMessage({type:'velaur-design-action',action,element:target.current?describeElement(target.current)||selection:selection,peers:action==='up'||action==='down'?Array.from(target.current?.parentElement?.children||[]).filter(node=>!node.classList.contains('design-added-content')&&!/^(STYLE|SCRIPT)$/.test(node.tagName)).map(describeElement).filter(Boolean):undefined},window.location.origin);if(action==='hide'||action==='delete'){target.current?.removeAttribute('data-editor-selected');target.current=null;setSelection(null);}};
 return <><style>{'[data-editor-selected]{outline:2px solid #8d96ff!important;outline-offset:3px}.preview-element-actions{position:fixed;z-index:9999;display:flex;flex-wrap:wrap;max-width:calc(100vw - 16px);gap:2px;padding:5px;background:#fff;color:#172238;border:1px solid #ccd5e6;border-radius:10px;box-shadow:0 8px 26px #101b3033;font:13px Arial}.preview-element-actions button{border:0;background:transparent;color:inherit;padding:8px;cursor:pointer;border-radius:6px}.preview-element-actions button:hover{background:#edf0ff}'}</style>{selection&&<div className="preview-element-actions" role="toolbar" aria-label="Selected content actions" style={position}><button onClick={()=>action('edit')}>Edit</button><button onClick={()=>action('hide')}>Hide</button><button onClick={()=>action('delete')}>Delete</button><button onClick={()=>action('create')}>Create new</button><button aria-label="Move component up" disabled={!selection.siblingIndex} onClick={()=>action('up')}>↑</button><button aria-label="Move component down" disabled={selection.siblingIndex===Number(selection.siblingCount)-1} onClick={()=>action('down')}>↓</button><button aria-label="Select parent component" onClick={()=>{const node=target.current?.parentElement;if(node&&node.className!=='public-site'){node.click();}}}>↑</button></div>}</>;
}



