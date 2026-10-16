'use client';
import {useMemo} from 'react';

type Entry={label:string;href:string;icon?:string};
type Props={title:string;raw:string;onChange:(value:string)=>void;withIcons?:boolean;maxItems?:number};
const iconOptions=['brain','code','mobile','workflow','blocks','palette','shield','cloud'];
function decode(raw:string):Entry[]{try{const value:unknown=JSON.parse(raw);if(!Array.isArray(value))return [];return value.filter((item):item is Entry=>Boolean(item&&typeof item.label==='string'&&typeof item.href==='string')).map(item=>({label:item.label,href:item.href,...(typeof item.icon==='string'?{icon:item.icon}:{})}));}catch{return [];}}
export default function MenuEditor({title,raw,onChange,withIcons=false,maxItems=16}:Props){
 const items=useMemo(()=>decode(raw),[raw]);
 const invalid=raw.trim()!==''&&(()=>{try{return !Array.isArray(JSON.parse(raw));}catch{return true;}})();
 const apply=(updated:Entry[])=>onChange(JSON.stringify(updated));
 const patch=(index:number,delta:Partial<Entry>)=>apply(items.map((item,i)=>i===index?{...item,...delta}:item));
 const move=(index:number,offset:number)=>{const next=[...items];const target=index+offset;if(target<0||target>=items.length)return;[next[index],next[target]]=[next[target],next[index]];apply(next);};
 return <section className="menu-editor" aria-label={title}>
  <div className="menu-editor-heading"><h2>{title}</h2><span>{items.length} / {maxItems} links</span></div>
  <p className="cms-hint">Edit labels, destinations and order here. Each destination must begin with / and remain inside the website.</p>
  {invalid&&<p className="cms-error" role="alert">Saved menu is invalid JSON. Fix it before editing these links.</p>}
  <div className="menu-editor-items">{items.map((item,i)=><div className="menu-editor-item" key={i}>
   <label><span>Menu label</span><input aria-label={`${title} link ${i+1} label`} value={item.label} maxLength={70} onChange={e=>patch(i,{label:e.target.value})}/></label>
   <label><span>Internal path</span><input aria-label={`${title} link ${i+1} path`} value={item.href} placeholder="/about" onChange={e=>patch(i,{href:e.target.value})}/></label>
   {withIcons&&<label><span>Icon</span><select value={item.icon||'brain'} onChange={e=>patch(i,{icon:e.target.value})}>{iconOptions.map(icon=><option key={icon} value={icon}>{icon}</option>)}</select></label>}
   <div className="menu-editor-buttons"><button type="button" onClick={()=>move(i,-1)} disabled={i===0}>Move up</button><button type="button" onClick={()=>move(i,1)} disabled={i===items.length-1}>Move down</button><button type="button" className="menu-editor-remove" onClick={()=>apply(items.filter((_,j)=>j!==i))}>Remove</button></div>
  </div>)}</div>
  <button type="button" className="menu-editor-add" disabled={items.length>=maxItems||invalid} onClick={()=>apply([...items,{label:'New Link',href:'/'} ,].map((item,i)=>withIcons&&i===items.length?{...item,icon:'brain'}:item))}>Add link</button>
 </section>;
}
