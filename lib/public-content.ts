import {projectWithEditorial} from './project-editorial';
import { db, isDatabaseConfigured } from './db';
import approvedCatalog from '@/data/portfolio.json';
import {launchArticles,getLaunchArticle} from './launch-articles';
import {serviceData} from './service-catalog';

export type PortfolioCategory = 'WEBSITE' | 'WEB_APPLICATION' | 'MOBILE_APP';
export type PortfolioProject = { seo_title?:string|null;meta_description?:string|null; slug: string; title: string; summary: string; category: PortfolioCategory; page_type: 'SIMPLE' | 'CASE_STUDY'; content: unknown; live_url: string | null; figma_url: string | null; app_store_url: string | null; play_store_url: string | null };
export type PublishedArticle = { seo_title?:string|null;meta_description?:string|null; slug: string; title: string; excerpt: string; category: string | null; body: unknown; published_at: string | null };

// Public requests can only access records explicitly published in the CMS.
export async function getPublishedProjects(category?: PortfolioCategory): Promise<PortfolioProject[]> {
  const catalog=approvedCatalog as PortfolioProject[];
  if (!isDatabaseConfigured()) return category?catalog.filter(p=>p.category===category):catalog;
  const params = category ? [category] : [];
  const sql = `SELECT seo_title,meta_description,slug,title,summary,category,page_type,content,live_url,figma_url,app_store_url,play_store_url FROM projects WHERE status = 'PUBLISHED' ${category ? 'AND category = $1' : ''} ORDER BY is_featured DESC, position ASC, published_at DESC`;
  const result = await db.query<PortfolioProject>(sql, params);
  const controlled=await db.query<{slug:string}>('SELECT slug FROM projects');
  const known=new Set(controlled.rows.map(p=>p.slug));
  return [...result.rows.map(projectWithEditorial),...catalog.filter(p=>!known.has(p.slug)&&(!category||p.category===category))];
}
export async function getPublishedProject(slug: string): Promise<PortfolioProject | null> {
  if (!isDatabaseConfigured()) return (approvedCatalog as PortfolioProject[]).find(p=>p.slug===slug)||null;
  const result = await db.query<PortfolioProject>(`SELECT seo_title,meta_description,slug,title,summary,category,page_type,content,live_url,figma_url,app_store_url,play_store_url FROM projects WHERE status='PUBLISHED' AND slug=$1 LIMIT 1`, [slug]);
  if(result.rows[0])return projectWithEditorial(result.rows[0]);
  const controlled=await db.query('SELECT id FROM projects WHERE slug=$1',[slug]);
  return controlled.rowCount?null:(approvedCatalog as PortfolioProject[]).find(p=>p.slug===slug)||null;
}
export async function getPublishedArticles(): Promise<PublishedArticle[]> {
  if (!isDatabaseConfigured()) return [];
  const result = await db.query<PublishedArticle>(`SELECT seo_title,meta_description,slug,title,excerpt,category,body,published_at FROM blog_posts WHERE status='PUBLISHED' AND (published_at IS NULL OR published_at <= NOW()) ORDER BY published_at DESC NULLS LAST`);
  return result.rows;
}
export async function getPublishedArticle(slug: string): Promise<PublishedArticle | null> {
  if (!isDatabaseConfigured()) return null;
  const result = await db.query<PublishedArticle>(`SELECT seo_title,meta_description,slug,title,excerpt,category,body,published_at FROM blog_posts WHERE status='PUBLISHED' AND slug=$1 AND (published_at IS NULL OR published_at <= NOW()) LIMIT 1`, [slug]);
  return result.rows[0] ?? null;
}

/** A saved row controls its original default, including draft and trash states. */
export async function getPublicArticles(){
 const published=await getPublishedArticles();
 const controlled=isDatabaseConfigured()?(await db.query<{slug:string}>('SELECT slug FROM blog_posts')).rows:[];
 const slugs=new Set(controlled.map(row=>row.slug));return [...published,...launchArticles.filter(article=>!slugs.has(article.slug))];
}
export async function getPublicArticle(slug:string){
 const published=await getPublishedArticle(slug);if(published)return published;
 if(isDatabaseConfigured()&&(await db.query('SELECT slug FROM blog_posts WHERE slug=$1 LIMIT 1',[slug])).rowCount)return null;
 return getLaunchArticle(slug)||null;
}
export type PublicService={slug:string;n:string;title:string;group:string;desc:string;detail:string;deliverables:readonly string[];icon:(typeof serviceData)[number]['icon']};
export async function getPublicServices():Promise<PublicService[]>{
 if(!isDatabaseConfigured())return [...serviceData];
 const result=await db.query<{slug:string;title:string;summary:string;category:string;content:unknown;status:string}>('SELECT slug,title,summary,category,content,status FROM services ORDER BY position ASC,updated_at DESC');
 const controlled=new Set(result.rows.map(row=>row.slug));
 const published=result.rows.filter(row=>row.status==='PUBLISHED').map((row,index)=>{
  const original=serviceData.find(item=>item.slug===row.slug);
  return {...(original||serviceData[1]),n:original?.n||String(index+1).padStart(2,'0'),slug:row.slug,title:row.title,desc:row.summary,detail:contentParagraphs(row.content)[0]||row.summary,group:original?.group||(row.category==='AI'?'AI & Intelligent Solutions':row.category==='DESIGN'?'Design & Quality':'Software Development'),deliverables:original?.deliverables||['Agreed project scope','Implementation and testing','Launch documentation']};
 });return [...published,...serviceData.filter(item=>!controlled.has(item.slug))];
}

// Strictly render plain text blocks from JSONB; never inject arbitrary HTML from CMS data.
export function contentParagraphs(data: unknown): string[] {
  if (typeof data === 'string') return [data];
  if (!data || typeof data !== 'object') return [];
  const value = data as Record<string,unknown>;
  for (const key of ['paragraphs','sections','blocks']) {
    if (Array.isArray(value[key])) return (value[key] as unknown[]).flatMap(item => typeof item === 'string' ? [item] : item && typeof item === 'object' && 'text' in item && typeof (item as {text:unknown}).text === 'string' ? [(item as {text:string}).text] : []);
  }
  return typeof value.description === 'string' ? [value.description] : [];
}

export type PublishedService = {slug:string;title:string;summary:string;content:unknown;seo_title:string|null;meta_description:string|null};
export async function getPublishedService(slug:string):Promise<PublishedService|null>{
  if(!isDatabaseConfigured())return null;
  const result=await db.query<PublishedService>(`SELECT slug,title,summary,content,seo_title,meta_description FROM services WHERE slug=$1 AND status='PUBLISHED' LIMIT 1`,[slug]);
  return result.rows[0]??null;
}

