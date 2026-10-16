import {isApprovedContentUrl} from './section-content-validation';
import {validateBlocks,type BuilderBlock} from './builder-blocks';
export const elementNumbers=['fontSize','lineHeight','width','height','maxWidth','minHeight','padding','paddingTop','paddingBottom','paddingLeft','paddingRight','marginTop','marginBottom','marginLeft','marginRight','gap','borderRadius','borderWidth','opacity','order','zIndex','transformX','transformY','columns'] as const;
export const elementColors=['color','backgroundColor','borderColor','fill','stroke'] as const;
export const elementChoices:Record<string,string[]>={display:['block','flex','grid','inline','inline-block','none'],position:['static','relative','absolute','fixed','sticky'],textAlign:['left','center','right'],fontWeight:['300','400','500','600','700','800','900'],fontFamily:['system-ui','Arial','Georgia','monospace'],flexDirection:['row','column','row-reverse','column-reverse'],alignItems:['stretch','start','center','end'],justifyContent:['start','center','end','space-between','space-around'],objectFit:['cover','contain','fill'],borderStyle:['none','solid','dashed','dotted']};
export type ElementStyle=Record<string,string|number>;
export type ElementRule={text?:string;src?:string;alt?:string;href?:string;hidden?:boolean;deleted?:boolean;siblingIndex?:number;additions?:BuilderBlock[];styles?:{desktop?:ElementStyle;tablet?:ElementStyle;mobile?:ElementStyle}};
export type ElementDesign=Record<string,Record<string,ElementRule>>;
export const isDesignPath=(path:string)=>/^\/(?:$|about$|growth-solutions(?:\/[a-z0-9-]+)?$|services(?:\/[a-z0-9-]+)?$|work(?:\/[a-z0-9-]+|\/projects\/[a-z0-9-]+)?$|blog(?:\/[a-z0-9-]+)?$|contact$|privacy-policy$|terms-of-service$|pages\/[a-z0-9-]+$)/.test(path)&&path.length<=180;
export const isDesignSelector=(selector:string)=>selector.length<=1800&&/^\.public-site(?:\s*>\s*(?:\[data-design-id="d-[a-f0-9]{8}(?:-[a-f0-9]{8})?"\]|[a-z][a-z0-9-]*(?::nth-of-type\([1-9][0-9]{0,3}\))?)){0,24}$/.test(selector);
const record=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
export function validateElementDesign(value:unknown):string|null{
 if(!record(value)||Object.keys(value).length>100)return 'Invalid page design map.';let count=0;
 for(const [path,entries] of Object.entries(value)){
  if(!isDesignPath(path)||!record(entries))return 'Invalid design page.';
  for(const [selector,value] of Object.entries(entries)){
   if(++count>600||!isDesignSelector(selector)||!record(value))return 'Invalid or excessive element selection.';
   if(Object.keys(value).some(key=>!['text','src','alt','href','hidden','deleted','siblingIndex','additions','styles'].includes(key)))return 'Unsupported element property.';
   if(value.siblingIndex!==undefined&&(!Number.isInteger(value.siblingIndex)||Number(value.siblingIndex)<0||Number(value.siblingIndex)>500))return 'Invalid component position.';
   if(value.href!==undefined&&!isApprovedContentUrl(value.href))return 'Buttons require an internal path or HTTPS URL.';
   for(const key of ['hidden','deleted'])if(value[key]!==undefined&&typeof value[key]!=='boolean')return 'Visibility must be true or false.';
   if(value.additions!==undefined){const error=validateBlocks(value.additions);if(error)return error;}
   if(value.text!==undefined&&(typeof value.text!=='string'||value.text.length>12000))return 'Invalid element text.';
   if(value.src!==undefined&&!isApprovedContentUrl(value.src))return 'Element images require an internal path or HTTPS URL.';
   if(value.alt!==undefined&&(typeof value.alt!=='string'||value.alt.length>250))return 'Invalid image alt text.';
   if(value.styles!==undefined){if(!record(value.styles))return 'Invalid styles.';
    for(const [device,style] of Object.entries(value.styles)){
     if(!['desktop','tablet','mobile'].includes(device)||!record(style))return 'Invalid style breakpoint.';
     for(const [key,value] of Object.entries(style)){
      if((elementColors as readonly string[]).includes(key)){if(typeof value!=='string'||!/^#[a-f0-9]{6}$/i.test(value))return 'Use six-digit hex colors.';}
      else if((elementNumbers as readonly string[]).includes(key)){if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>3000)return 'Invalid element dimension.';if(key==='opacity'&&(value<0||value>1))return 'Opacity must be between zero and one.';if(key==='columns'&&(!Number.isInteger(value)||value<1||value>12))return 'Columns must be between one and twelve.';if(!['transformX','transformY','order','marginTop','marginBottom','marginLeft','marginRight'].includes(key)&&value<0)return 'Dimensions cannot be negative.';}
      else if(!elementChoices[key]?.includes(String(value)))return 'Unsupported style property or value.';
     }
    }
   }
  }
 }return null;
}
export function parseElementDesign(raw:string):ElementDesign{try{const value=JSON.parse(raw);return validateElementDesign(value)?{}:value;}catch{return {};}}
export function resolvedElementStyle(rule:ElementRule,device:'desktop'|'tablet'|'mobile'):ElementStyle{return {...rule.styles?.desktop,...(device!=='desktop'?rule.styles?.tablet:{}),...(device==='mobile'?rule.styles?.mobile:{})};}
export function cssElementStyle(style:ElementStyle):Record<string,string>{
 const css:Record<string,string>={};
 for(const [key,value] of Object.entries(style)){
  if(key==='transformX'||key==='transformY'||key==='columns')continue;
  const property=key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
  css[property]=typeof value==='number'&&!['opacity','order','zIndex','lineHeight'].includes(key)?value+'px':String(value);
 }
 if(style.transformX!==undefined||style.transformY!==undefined)css.transform=`translate(${style.transformX||0}px, ${style.transformY||0}px)`;
 if(style.columns!==undefined)css['grid-template-columns']=`repeat(${style.columns}, minmax(0, 1fr))`;
 return css;
}
