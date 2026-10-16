import {sharingImage} from './sharing-image';
import type {Metadata} from 'next';
import {getSiteSettings} from './site-settings';
import {parseSeoOverrides,resolveSeoPage} from './seo-catalog';
export async function getSeoPage(path:string){return resolveSeoPage(path,(await getSiteSettings()).seo_pages);}
export const brandedTitle=(title:string)=>title.endsWith(' | VELAUR LABS')?title:`${title} | VELAUR LABS`;
export async function metadataForPath(path:string,fallback:{title?:string|null;description?:string|null}={}):Promise<Metadata>{
 const settings=await getSiteSettings();const page=resolveSeoPage(path,settings.seo_pages);const override=parseSeoOverrides(settings.seo_pages)[path];
 const title=override?.title||fallback.title||page?.title||'VELAUR LABS';
 const description=override?.description||fallback.description||page?.description;
 return {title:{absolute:brandedTitle(title)},description,alternates:{canonical:path},openGraph:{type:'website',siteName:'VELAUR LABS',title:brandedTitle(title),description,url:path,images:[sharingImage(settings)]},twitter:{card:'summary_large_image',title:brandedTitle(title),description,images:[{url:sharingImage(settings).url,alt:sharingImage(settings).alt}]},robots:page?.noIndex?{index:false,follow:true}:{index:true,follow:true}};
}
export function serviceStructuredData(path:string,name:string,description:string){return {'@context':'https://schema.org','@type':'Service','@id':`https://velaurlabs.com${path}#service`,name,serviceType:name,description,url:`https://velaurlabs.com${path}`,areaServed:{'@type':'Place',name:'Worldwide'},provider:{'@type':'Organization','@id':'https://velaurlabs.com/#organization',name:'VELAUR LABS',url:'https://velaurlabs.com/'},availableChannel:{'@type':'ServiceChannel',serviceUrl:'https://velaurlabs.com/contact'}};}
