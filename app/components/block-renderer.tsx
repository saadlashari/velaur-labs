
import {designId} from '@/lib/design-ids';
import type {CSSProperties} from 'react';
import Link from 'next/link';
import type {BuilderBlock} from '@/lib/builder-blocks';
import {isApprovedContentUrl} from '@/lib/section-content-validation';
function Block({block,depth=0}:{block:BuilderBlock;depth?:number}){
 if(depth>6)return null;
 const raw=block.style||{};
 const px=(key:string)=>typeof raw[key]==='number'?Math.max(0,Math.min(600,Number(raw[key])))+'px':undefined;
 const color=(key:string)=>typeof raw[key]==='string'&&/^#[a-f0-9]{6}$/i.test(String(raw[key]))?String(raw[key]):undefined;
 const cols=(key:string,fallback:number)=>Math.max(1,Math.min(4,Number(raw[key])||fallback));
 const style={color:color('color'),background:color('background'),borderColor:color('borderColor'),borderRadius:px('radius'),textAlign:['left','center','right'].includes(String(raw.align))?raw.align:undefined,
  '--block-size':px('fontSize'),'--block-size-tablet':px('tabletFontSize'),'--block-size-mobile':px('mobileFontSize'),
  '--block-padding':px('padding'),'--block-padding-tablet':px('tabletPadding'),'--block-padding-mobile':px('mobilePadding'),
  '--block-gap':px('gap'),'--block-cols':cols('columns',1),'--block-cols-tablet':cols('tabletColumns',2),'--block-cols-mobile':cols('mobileColumns',1),
  ...(block.type==='SPACER'?{height:px('height')||40}:{})} as CSSProperties;
 const className='layout-block layout-'+block.type.toLowerCase()+['Desktop','Tablet','Mobile'].filter(device=>raw['hideOn'+device]===true).map(device=>' builder-hide-'+device.toLowerCase()).join('');
 const url=block.url&&isApprovedContentUrl(block.url)?block.url:'';
 const content=block.type==='CONTAINER'?<BlocksView blocks={block.children||[]} depth={depth+1}/>:block.type==='HEADING'?<h2 data-design-id={designId("app/components/block-renderer.tsx:1720")}>{block.text}</h2>:block.type==='TEXT'?<p data-design-id={designId("app/components/block-renderer.tsx:1762")}>{block.text}</p>:block.type==='IMAGE'&&url?<img data-design-id={designId("app/components/block-renderer.tsx:1808")} src={url} alt={block.alt||''} loading="lazy"/>:block.type==='BUTTON'&&url?(url.startsWith('/')?<Link className="button-primary" href={url}>{block.text||'Learn more'}</Link>:<a data-design-id={designId("app/components/block-renderer.tsx:1986")} className="button-primary" href={url} target="_blank" rel="noopener noreferrer">{block.text||'Learn more'}</a>):block.type==='DIVIDER'?<hr data-design-id={designId("app/components/block-renderer.tsx:2124")}/>:null;
 return <div data-design-id={designId("app/components/block-renderer.tsx:2143",block.id)} className={className} style={style} data-block-id={block.id}>{content}</div>;
}
export function BlocksView({blocks,depth=0}:{blocks:BuilderBlock[];depth?:number}){return <>{blocks.slice(0,150).map(block=><Block key={block.id} block={block} depth={depth}/>)}</>;}
