'use client';
import {useEffect,useRef,useState,type RefObject} from 'react';
export default function PreviewStage({device,frame,src}:{device:string;frame:RefObject<HTMLIFrameElement|null>;src:string}){
 const stage=useRef<HTMLDivElement>(null),[available,setAvailable]=useState(0);const width=device==='mobile'?390:device==='tablet'?820:1200;const scale=available?Math.min(1,available/width):1;
 useEffect(()=>{const node=stage.current;if(!node)return;const measure=()=>setAvailable(node.clientWidth);measure();const observer=new ResizeObserver(measure);observer.observe(node);return()=>observer.disconnect();},[]);
 return <section className="design-stage"><div ref={stage} className="studio-preview-space"><div style={{height:940*scale,width:width*scale,maxWidth:'100%',margin:'auto'}}><div className={'design-frame design-frame-'+device} style={{width,maxWidth:'none',height:940,transform:`scale(${scale})`,transformOrigin:'top left'}}><iframe ref={frame} title="Original page draft preview" src={src} style={{width,height:940}} referrerPolicy="same-origin"/></div></div></div></section>;
}
