import {metadataForPath} from '@/lib/seo';
import {designId} from '@/lib/design-ids';
export const dynamic='force-dynamic';
import {getPublicServices} from '@/lib/public-content';
import {getSiteSettings} from '@/lib/site-settings';
import {getPublicPage} from '@/lib/page-builder';
import {SectionsView} from '@/app/components/published-sections';
import Link from 'next/link';
import {PublicLayout} from '../components/site-chrome';
import PageHero from '../components/page-hero';
import AgencyServiceCards from '../components/agency-service-cards';
import {Breadcrumbs} from '../components/agency-sections';
import {serviceCategories,categoryForService} from '@/lib/agency-navigation';
import {growthSolutions} from '@/lib/agency-catalog';
import type {Metadata} from 'next';
export async function generateMetadata():Promise<Metadata>{return metadataForPath('/services');}
export default async function ServicesPage(){const [cms,settings,visibleServices]=await Promise.all([getPublicPage('services'),getSiteSettings(),getPublicServices()]);return <PublicLayout><Breadcrumbs items={[{label:'Home',href:'/'},{label:'Services'}]}/><PageHero showActions={false} eyebrow={settings.services_hero_eyebrow} title={settings.services_hero_title} highlight={settings.services_hero_highlight} copy="Technology, business development and digital growth, connected around the work your business needs next."/><section data-design-id={designId('app/services/page.tsx:1165')} className="inner-section agency-category-jump" aria-label="Service categories">{serviceCategories.map(category=><Link key={category.slug} href={`/services/${category.slug}`}><span className="eyebrow">EXPLORE</span><h2>{category.title}</h2><p>{category.description}</p><span>View category </span></Link>)}</section><section className="inner-section">{serviceCategories.map(category=><div className="service-group" key={category.slug}><div className="inner-section-heading"><Link className="eyebrow" href={`/services/${category.slug}`}>EXPLORE CATEGORY </Link><h2>{category.title}</h2><p>{category.description}</p></div><AgencyServiceCards services={visibleServices.filter(service=>categoryForService(service.slug)===category.slug)}/></div>)}</section><section className="inner-section"><div className="inner-section-heading"><span className="eyebrow">CONNECTED ENGAGEMENTS</span><h2>Growth Solutions</h2><p>Combine the capabilities you need into a coordinated plan. Scope and priorities are agreed after discovery.</p></div><div className="service-outcome-grid">{growthSolutions.map(solution=><Link key={solution.slug} className="service-outcome-card" href={`/growth-solutions/${solution.slug}`}><h3>{solution.title}</h3><p>{solution.description}</p><span>Explore solution </span></Link>)}</div></section>{cms?.sections.length ? <SectionsView sections={cms.sections}/> : null}</PublicLayout>;}
