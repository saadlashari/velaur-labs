import {isApprovedContentUrl} from './section-content-validation';
export const blockTypes=['CONTAINER','HEADING','TEXT','IMAGE','BUTTON','DIVIDER','SPACER'] as const;
export type BlockType=typeof blockTypes[number];
export type BuilderBlock={id:string;type:BlockType;text?:string;url?:string;alt?:string;children?:BuilderBlock[];style?:Record<string,string|number|boolean>};
export function createBlock(type:BlockType):BuilderBlock{
 return {id:'block-'+globalThis.crypto.randomUUID(),type,...(type==='CONTAINER'?{children:[],style:{columns:2,gap:24,padding:24}}:type==='IMAGE'?{url:'',alt:''}:type==='BUTTON'?{text:'Contact us',url:'/contact'}:type==='HEADING'?{text:'New heading'}:type==='TEXT'?{text:'Tell your story.'}:type==='SPACER'?{style:{height:40}}:{})};
}
/** Validate a bounded tree; no raw HTML, scripts or arbitrary CSS are supported. */
export function validateBlocks(value:unknown):string|null{
 if(!Array.isArray(value))return 'Layout blocks must be a list.';
 let count=0;const ids=new Set<string>();
 const visit=(nodes:unknown[],depth:number):string|null=>{
  if(depth>6)return 'Maximum six levels of nested containers.';
  for(const value of nodes){
   if(++count>150)return 'Maximum 150 blocks per layout.';
   if(!value||typeof value!=='object'||Array.isArray(value))return 'Invalid block.';
   const block=value as Record<string,unknown>;
   if(typeof block.id!=='string'||!/^[a-zA-Z0-9-]{1,100}$/.test(block.id)||ids.has(block.id))return 'Invalid or duplicate block ID.';
   ids.add(block.id);
   if(!blockTypes.includes(block.type as BlockType))return 'Unknown block type.';
   if(block.text!==undefined&&(typeof block.text!=='string'||block.text.length>12000))return 'Invalid block text.';
   if(['IMAGE','BUTTON'].includes(String(block.type))&&block.url&& !isApprovedContentUrl(block.url))return 'Use an internal path or HTTPS URL for blocks.';
   if(block.type==='IMAGE'&&block.url&&(typeof block.alt!=='string'||!block.alt.trim()))return 'Block images require alt text.';
   if(block.children!==undefined){if(block.type!=='CONTAINER'||!Array.isArray(block.children))return 'Only containers may have children.';const error=visit(block.children,depth+1);if(error)return error;}
   if(block.style!==undefined){
    if(!block.style||typeof block.style!=='object'||Array.isArray(block.style))return 'Invalid block styles.';
    for(const [key,value] of Object.entries(block.style)){
     if(['color','background','borderColor'].includes(key)){if(typeof value!=='string'||!/^#[a-f0-9]{6}$/i.test(value))return 'Use six-digit hex colors.';}
     else if(['columns','tabletColumns','mobileColumns'].includes(key)){if(!Number.isInteger(value)||Number(value)<1||Number(value)>4)return 'Columns must be between one and four.';}
     else if(['fontSize','tabletFontSize','mobileFontSize','padding','tabletPadding','mobilePadding','gap','radius','height'].includes(key)){if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>600)return 'Invalid block dimensions.';}
     else if(key==='align'){if(!['left','center','right'].includes(String(value)))return 'Invalid block alignment.';}
     else if(['hideOnDesktop','hideOnTablet','hideOnMobile'].includes(key)){if(typeof value!=='boolean')return 'Invalid block visibility.';}
     else return 'Unsupported block style.';
    }
   }
  }return null;
 };return visit(value,0);
}
