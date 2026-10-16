import {Breadcrumbs} from '@/app/components/agency-sections';
import {metadataForPath} from '@/lib/seo';

import {designId} from '@/lib/design-ids';
import {projectCover} from '@/lib/project-cover';
import {getSiteSettings} from '@/lib/site-settings';
import {getPublicPage} from '@/lib/page-builder';
import {SectionsView} from '@/app/components/published-sections';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowUpRight, Code2, MonitorSmartphone, Smartphone } from 'lucide-react';
import PortfolioBrowser from '../components/portfolio-browser';
import WorkServiceDiscovery from '../components/work-service-discovery';
import { PublicLayout } from '../components/site-chrome';
import PageHero from '../components/page-hero';
import {getPublishedProjects} from '@/lib/public-content';
export async function generateMetadata():Promise<Metadata>{return metadataForPath('/work');}
const categories = [
  { slug: 'websites', title: 'Websites', description: 'Marketing websites, brands, and modern digital presences.', icon: MonitorSmartphone },
  { slug: 'web-applications', title: 'Web Applications', description: 'Custom platforms, dashboards, portals and web products.', icon: Code2 },
  { slug: 'mobile-apps', title: 'Mobile Apps', description: 'Cross-platform and native mobile product experiences.', icon: Smartphone },
];
export const dynamic = 'force-dynamic';
export default async function WorkPage() { const [cms, settings]=await Promise.all([getPublicPage('work'),getSiteSettings()]);const projects=await getPublishedProjects();
 return <PublicLayout><Breadcrumbs items={[{label:"Home",href:"/"},{label:'Our Work'}]}/><PageHero eyebrow={settings.work_hero_eyebrow} title={settings.work_hero_title} highlight={settings.work_hero_highlight} copy={settings.work_hero_copy} />
 <WorkServiceDiscovery/>
 <section data-design-id={designId("app/work/page.tsx:1592")} className="inner-section"><div data-design-id={designId("app/work/page.tsx:1627")} className="portfolio-category-grid">{categories.map(({slug,title,description,icon:Icon})=><Link className="portfolio-category-card" href={`/work/${slug}`} key={slug}><span data-design-id={designId("app/work/page.tsx:1798")} className="portfolio-category-icon"><Icon size={28}/></span><h2 data-design-id={designId("app/work/page.tsx:1864")}>{title}</h2><p data-design-id={designId("app/work/page.tsx:1880")}>{description}</p><span data-design-id={designId("app/work/page.tsx:1900")} className="portfolio-category-link">Explore category <ArrowUpRight size={17}/></span></Link>)}</div></section>
 <section data-design-id={designId("app/work/page.tsx:2018")} className="inner-section published-work-overview"><div data-design-id={designId("app/work/page.tsx:2077")} className="inner-section-heading"><span data-design-id={designId("app/work/page.tsx:2116")} className="eyebrow">SELECTED PROJECTS</span><h2 data-design-id={designId("app/work/page.tsx:2166")}>{settings.work_published_title}</h2></div>{projects.length ? <PortfolioBrowser projects={projects.map(project=>({slug:project.slug,title:project.title,summary:project.summary,category:project.category,cover:projectCover(project.content)??null}))}/> : <div data-design-id={designId("app/work/page.tsx:2420")} className="blog-empty-state"><h2 data-design-id={designId("app/work/page.tsx:2455")}>{settings.work_empty_title}</h2><p data-design-id={designId("app/work/page.tsx:2491")}>{settings.work_empty_copy}</p></div>}</section>
 {cms?.sections.length ? <SectionsView sections={cms.sections}/> : null}</PublicLayout>;
}
