import optimized from '@/data/optimized-media.json';
// Project screenshots live in the existing projects.content JSONB field; no schema migration.
export type ProjectGalleryImage = {url:string;alt:string;caption:string;width?:number;height?:number};
export function projectGallery(data:unknown):ProjectGalleryImage[]{
 if(!data || typeof data!=='object' || Array.isArray(data))return [];
 const gallery=(data as Record<string,unknown>).gallery;
 if(!Array.isArray(gallery))return [];
 return gallery.slice(0,20).flatMap((item):ProjectGalleryImage[]=>{
  if(!item || typeof item!=='object' || Array.isArray(item))return [];
  const v=item as Record<string,unknown>;
  if(typeof v.url!=='string' || (!/^https:\/\/[^\s]+$/i.test(v.url)&&!/^\/project-media\/[a-z0-9-]+\.(webp|png|jpg|avif)$/.test(v.url)) || v.url.length>2048)return [];
  const variant=(optimized as Record<string,{url:string;width:number;height:number}>)[v.url];
  return [{url:variant?.url||v.url,...(variant?{width:variant.width,height:variant.height}:{}),alt:typeof v.alt==='string'?v.alt.slice(0,250):'',caption:typeof v.caption==='string'?v.caption.slice(0,240):''}];
 });
}
