import { db, isDatabaseConfigured } from './db';
export type PublicSection = {section_key:string;section_type:string;content:Record<string,unknown>;settings:Record<string,unknown>};
export type PublicPage = {slug:string;title:string;seo_title:string|null;meta_description:string|null;no_index:boolean;sections:PublicSection[]};
export async function getPublicPage(slug:string):Promise<PublicPage|null>{
 if(!isDatabaseConfigured()||!/^[a-z0-9-]+$/.test(slug))return null;
 const result=await db.query<{id:string;slug:string;title:string;seo_title:string|null;meta_description:string|null;no_index:boolean}>('SELECT id,slug,title,seo_title,meta_description,no_index FROM pages WHERE slug=$1 AND status=$2 LIMIT 1',[slug,'PUBLISHED']);
 if(!result.rows[0])return null;
 const page=result.rows[0];
 const sections=await db.query<PublicSection>('SELECT section_key,section_type,content,settings FROM page_sections WHERE page_id=$1 AND is_visible=TRUE ORDER BY position,id',[page.id]);
 return {...page,sections:sections.rows};
}
