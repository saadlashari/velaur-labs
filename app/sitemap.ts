import {getSiteSettings} from '@/lib/site-settings';
import {parseSeoOverrides} from '@/lib/seo-catalog';
import {serviceCategories,solutionNavigation} from '@/lib/agency-navigation';

import {db,isDatabaseConfigured} from '@/lib/db';
import {publicPagePath} from '@/lib/page-path';
export const dynamic='force-dynamic';
import type {MetadataRoute} from 'next';
import {getPublishedProjects,getPublicArticles as getPublishedArticles,getPublicServices} from '@/lib/public-content';
const origin='https://velaurlabs.com';
const staticRoutes=['','/about','/services','/work','/work/websites','/work/web-applications','/work/mobile-apps','/blog','/contact','/privacy-policy','/terms-of-service'];

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const seo=parseSeoOverrides((await getSiteSettings()).seo_pages);
 const [projects,articles,visibleServices]=await Promise.all([getPublishedProjects().catch(()=>[]),getPublishedArticles().catch(()=>[]),getPublicServices().catch(()=>[])]);
 const pages=isDatabaseConfigured()?(await db.query<{slug:string}>("SELECT slug FROM pages WHERE status='PUBLISHED' AND no_index=FALSE")).rows:[];
 return [...new Set([...pages.map(p=>publicPagePath(p.slug)),...staticRoutes,'/growth-solutions',...serviceCategories.map(item=>`/services/${item.slug}`),...solutionNavigation.map(([slug])=>`/growth-solutions/${slug}`),...visibleServices.map(s=>`/services/${s.slug}`),...projects.map(p=>`/work/projects/${p.slug}`),...articles.map(a=>`/blog/${a.slug}`)])].filter(path=>!seo[path||'/']?.noIndex).map(path=>({url:`${origin}${path}`,changeFrequency:'monthly' as const,priority:path===''?1:.6}));
}
