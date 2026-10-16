// Controls the existing curated homepage without replacing its components.
export const HOME_SECTION_KEYS = ['hero','capabilities','services','work','process','why','insights','cta'] as const;
export type HomeSectionKey = typeof HOME_SECTION_KEYS[number];
export type HomeSectionPreference = {key:HomeSectionKey; visible:boolean};
export const HOME_SECTION_LABELS:Record<HomeSectionKey,string> = {
 hero:'Hero',capabilities:'Capabilities strip',services:'Three featured services',work:'Four featured projects',
 process:'How We Work',why:'Why VELAUR LABS',insights:'Latest Insights',cta:'Final call to action'
};
export const defaultHomeLayout:HomeSectionPreference[] = HOME_SECTION_KEYS.map(key=>({key,visible:true}));
export function parseHomeLayout(raw:string|undefined):HomeSectionPreference[]{
 if(!raw)return defaultHomeLayout;
 try{
  const value:unknown=JSON.parse(raw);
  if(!Array.isArray(value)||value.length!==HOME_SECTION_KEYS.length)return defaultHomeLayout;
  const seen=new Set<string>();
  const valid=value.every((item:unknown)=>{
   if(!item||typeof item!=='object')return false;
   const entry=item as Record<string,unknown>;
   if(typeof entry.key!=='string'||!HOME_SECTION_KEYS.includes(entry.key as HomeSectionKey)||typeof entry.visible!=='boolean'||seen.has(entry.key))return false;
   seen.add(entry.key);return true;
  });
  if(!valid)return defaultHomeLayout;
  return (value as HomeSectionPreference[]).map(item=>({...item,visible:item.key==='hero'?true:item.visible}));
 }catch{return defaultHomeLayout;}
}
