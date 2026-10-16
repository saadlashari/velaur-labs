import catalog from '@/data/portfolio.json';
/** Fill only absent launch fields; preserve saved edits, visibility and intentionally empty fields. */
export function projectWithEditorial<T extends {slug:string;content:unknown}>(project:T):T{
 const base=catalog.find(item=>item.slug===project.slug);if(!base)return project;
 const saved=project.content&&typeof project.content==='object'&&!Array.isArray(project.content)?project.content as Record<string,unknown>:{};
 const defaults=base.content as Record<string,unknown>;const content={...saved};
 for(const key of ['challenge','solution','scope_note','access_notes','featured_summary'])if(!(key in content)&&typeof defaults[key]==='string')content[key]=defaults[key];
 // The supplied SalesFox capture replaces its old title-only fallback, never a user's custom gallery.
 if(project.slug==='salesfox-website'&&saved.editorial_version!==2&&!('gallery' in saved&&Array.isArray(saved.gallery)&&saved.gallery.length>0))content.gallery=defaults.gallery;
 return {...project,content};
}
