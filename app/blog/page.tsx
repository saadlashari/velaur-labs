import {Breadcrumbs} from '@/app/components/agency-sections';
import {metadataForPath} from '@/lib/seo';

import {designId} from '@/lib/design-ids';
import {articleCover} from '@/lib/blog-content';
import {getSiteSettings} from '@/lib/site-settings';
import {getPublicPage} from '@/lib/page-builder';
import {SectionsView} from '@/app/components/published-sections';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, BookOpen } from 'lucide-react';
import { PublicLayout } from '../components/site-chrome';
import PageHero from '../components/page-hero';
import { getPublicArticles as getPublishedArticles } from '../../lib/public-content';

export async function generateMetadata():Promise<Metadata>{return metadataForPath('/blog');}
export const dynamic = 'force-dynamic';
export default async function BlogPage({searchParams}:{searchParams:Promise<{category?:string}>}){const [cms,settings]=await Promise.all([getPublicPage('blog'),getSiteSettings()]);const published=await getPublishedArticles();const allPosts=published;const {category}=await searchParams;const categories=[...new Set(allPosts.map(p=>p.category).filter((v):v is string=>Boolean(v)))];const selected=categories.includes(category||'')?category:undefined;const posts=selected?allPosts.filter(p=>p.category===selected):allPosts;return <PublicLayout><Breadcrumbs items={[{label:"Home",href:"/"},{label:'Insights'}]}/><PageHero eyebrow={settings.blog_hero_eyebrow} title={settings.blog_hero_title} highlight={settings.blog_hero_highlight} copy={settings.blog_hero_copy}/><section data-design-id={designId("app/blog/page.tsx:1470")} className="inner-section"><nav data-design-id={designId("app/blog/page.tsx:1505")} className="blog-category-tabs" aria-label="Article categories"><Link href="/blog" className={!selected?'active':''}>All articles</Link>{categories.map(c=><Link className={selected===c?'active':''} href={`/blog?category=${encodeURIComponent(c)}`} key={c}>{c}</Link>)}</nav>{posts.length ? <div data-design-id={designId("app/blog/page.tsx:1797")} className="portfolio-project-grid">{posts.map(post=><article data-design-id={designId("app/blog/page.tsx:1855",post.slug)} className="portfolio-project-card" key={post.slug}><div data-design-id={designId("app/blog/page.tsx:1915")} className="editorial-cover">{articleCover(post)&&<img src={articleCover(post)!.url} alt={articleCover(post)!.alt} width="1200" height="690" loading="lazy" decoding="async"/>}</div><span data-design-id={designId("app/blog/page.tsx:2095")} className="eyebrow">{post.category||'INSIGHTS'}</span><h2 data-design-id={designId("app/blog/page.tsx:2155")}>{post.title}</h2><p data-design-id={designId("app/blog/page.tsx:2176")}>{post.excerpt}</p><Link href={`/blog/${post.slug}`} className="text-link">Read {post.title} <ArrowRight size={16}/></Link></article>)}</div>:<div data-design-id={designId("app/blog/page.tsx:2315")} className="blog-empty-state"><BookOpen size={27}/><h2 data-design-id={designId("app/blog/page.tsx:2370")}>{settings.blog_empty_title}</h2><p data-design-id={designId("app/blog/page.tsx:2406")}>{settings.blog_empty_copy}</p></div>}</section>{cms?.sections.length ? <SectionsView sections={cms.sections}/> : null}</PublicLayout>;}
