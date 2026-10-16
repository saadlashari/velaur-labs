
import {Breadcrumbs} from './agency-sections';
import {designId} from '@/lib/design-ids';
import {projectCover} from '@/lib/project-cover';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PublicLayout } from './site-chrome';
import PageHero from './page-hero';
import { getPublishedProjects, type PortfolioCategory } from '../../lib/public-content';

const config: Record<string,{title:string,description:string,category:PortfolioCategory}> = {
  websites: { title:'Websites',description:'Verified websites and brand experiences.',category:'WEBSITE' },
  'web-applications': { title:'Web Applications',description:'Verified digital platforms, dashboards and portals.',category:'WEB_APPLICATION' },
  'mobile-apps': { title:'Mobile Apps',description:'Verified mobile app projects and experiences.',category:'MOBILE_APP' },
};
export default async function CategoryPage({categorySlug}:{categorySlug:string}){
  const c=config[categorySlug];
  const projects = await getPublishedProjects(c.category);
  return <PublicLayout><Breadcrumbs items={[{label:'Home',href:'/'},{label:'Our Work',href:'/work'},{label:c.title}]}/><PageHero eyebrow={`OUR WORK / ${c.title.toUpperCase()}`} title={c.title} copy={c.description}/>
  <section data-design-id={designId("app/components/portfolio-category.tsx:1075")} className="inner-section"><div data-design-id={designId("app/components/portfolio-category.tsx:1110")} className="portfolio-project-grid">{projects.map(project => <article data-design-id={designId("app/components/portfolio-category.tsx:1174",project.slug)} className="portfolio-project-card" key={project.slug}>{projectCover(project.content)&&<Link href={`/work/projects/${project.slug}`} className="portfolio-cover"><img data-design-id={designId("app/components/portfolio-category.tsx:1344")} loading="lazy" alt={projectCover(project.content)?.alt||project.title} src={projectCover(project.content)?.url}/></Link>}<span data-design-id={designId("app/components/portfolio-category.tsx:1470")} className="eyebrow">{project.page_type==='CASE_STUDY'?'FULL CASE STUDY':'PROJECT OVERVIEW'}</span><h2 data-design-id={designId("app/components/portfolio-category.tsx:1574")}>{project.title}</h2><p data-design-id={designId("app/components/portfolio-category.tsx:1598")}>{project.summary}</p><Link className="text-link" href={`/work/projects/${project.slug}`}>View project <ArrowRight size={16}/></Link></article>)}</div>{projects.length===0&&<div data-design-id={designId("app/components/portfolio-category.tsx:1773")} className="portfolio-empty"><h2 data-design-id={designId("app/components/portfolio-category.tsx:1806")}>Projects are being curated.</h2><p data-design-id={designId("app/components/portfolio-category.tsx:1842")}>Only verified and published projects appear here. Nothing is represented as completed client work without approval.</p></div>}<div data-design-id={designId("app/components/portfolio-category.tsx:1971")} className="portfolio-empty-actions"><Link className="button-secondary" href="/work"><ArrowLeft size={16}/> All categories</Link><Link className="button-primary" href="/contact">Discuss a project <ArrowRight size={16}/></Link></div></section></PublicLayout>;
}
