export const STYLABLE_HOME_SECTIONS = ['hero','capabilities','services','work','process','why','insights','cta'] as const;
export type HomeStyleKey = typeof STYLABLE_HOME_SECTIONS[number];
export type HomeSectionStyle = {background:string;headingColor:string;headingSize:number;spacing:number};
export type HomeSectionStyles = Record<HomeStyleKey,HomeSectionStyle>;
export const defaultHomeSectionStyles:HomeSectionStyles = Object.fromEntries(STYLABLE_HOME_SECTIONS.map(key=>[key,{background:'',headingColor:'',headingSize:0,spacing:0}])) as HomeSectionStyles;
const validColor=(value:unknown)=>value===''||(typeof value==='string'&&/^#[0-9a-fA-F]{6}$/.test(value));
export function validHomeSectionStyles(raw:unknown):raw is HomeSectionStyles{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return false;
 const data=raw as Record<string,unknown>;
 if(Object.keys(data).length!==STYLABLE_HOME_SECTIONS.length)return false;
 return STYLABLE_HOME_SECTIONS.every(key=>{const entry=data[key];if(!entry||typeof entry!=='object'||Array.isArray(entry))return false;const style=entry as Record<string,unknown>;
  return Object.keys(style).sort().join(',')==='background,headingColor,headingSize,spacing'&&validColor(style.background)&&validColor(style.headingColor)&&typeof style.headingSize==='number'&&Number.isInteger(style.headingSize)&&style.headingSize>=0&&style.headingSize<=84&&typeof style.spacing==='number'&&Number.isInteger(style.spacing)&&style.spacing>=0&&style.spacing<=160;
 });
}
export function parseHomeSectionStyles(value:unknown):HomeSectionStyles{
 try{const parsed=typeof value==='string'?JSON.parse(value):value;if(!validHomeSectionStyles(parsed))return structuredClone(defaultHomeSectionStyles);return parsed;}catch{return structuredClone(defaultHomeSectionStyles);}
}
