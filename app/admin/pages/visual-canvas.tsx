'use client';
import { SectionsView } from '@/app/components/section-renderer';
import type { PublicSection } from '@/lib/page-builder';
type EditableSection=PublicSection&{is_visible:boolean};
export default function VisualCanvas({sections,selected,onSelect,onMove,onEdit}:{
 sections:EditableSection[];selected:string|null;onSelect:(key:string)=>void;
 onMove:(from:number,to:number)=>void;onEdit:(index:number,patch:Partial<EditableSection>)=>void;
}){
 return <div className="visual-canvas">{sections.map((section,index)=>section.is_visible&&<div
  key={section.section_key} className={'canvas-block'+(selected===section.section_key?' is-selected':'')}
  onClickCapture={event=>{if((event.target as HTMLElement).closest('a'))event.preventDefault();onSelect(section.section_key);}}
  onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();const from=Number(event.dataTransfer.getData('application/velaur-section'));if(Number.isInteger(from)&&event.dataTransfer.types.includes('application/velaur-section'))onMove(from,index);}}
 >
  <div className="canvas-block-toolbar"><button type="button" draggable
   onDragStart={event=>{event.dataTransfer.setData('application/velaur-section',String(index));event.dataTransfer.effectAllowed='move';}}
   onClick={()=>onSelect(section.section_key)} aria-label={'Select '+section.section_key}>↕ {section.section_type} · {index+1}</button>
   <button type="button" disabled={index===0} onClick={()=>onMove(index,index-1)}>↑</button>
   <button type="button" disabled={index===sections.length-1} onClick={()=>onMove(index,index+1)}>↓</button>
  </div>
  <SectionsView sections={[section]}/>
  {selected===section.section_key&&<div className="canvas-inline-fields">
   <label>Heading<input value={String(section.content.heading||'')} onChange={event=>onEdit(index,{content:{...section.content,heading:event.target.value}})}/></label>
   <label>Text<textarea value={String(section.content.text||'')} onChange={event=>onEdit(index,{content:{...section.content,text:event.target.value}})}/></label>
  </div>}
 </div>)}</div>;
}
