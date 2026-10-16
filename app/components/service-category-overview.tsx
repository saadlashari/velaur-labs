import ServiceSearchContent from './service-search-content';
import Link from 'next/link';
import {getSeoPage} from '@/lib/seo';
import {notFound} from 'next/navigation';
import {serviceCategories,categoryForService} from '@/lib/agency-navigation';
import {getPublicServices} from '@/lib/public-content';
import {PublicLayout} from './site-chrome';
import PageHero from './page-hero';
import AgencyServiceCards from './agency-service-cards';
import {Breadcrumbs,DiscoveryActions} from './agency-sections';
export default async function CategoryOverview({slug}:{slug:string}){const category=serviceCategories.find(item=>item.slug===slug);if(!category)notFound();const seo=await getSeoPage(`/services/${slug}`);const services=(await getPublicServices()).filter(service=>categoryForService(service.slug)===slug);return <PublicLayout><Breadcrumbs items={[{label:'Home',href:'/'},{label:'Services',href:'/services'},{label:category.title}]}/><PageHero showActions={false} eyebrow="OUR EXPERTISE" title={seo?.headline||category.title} copy={seo?.answer||category.description}/><DiscoveryActions title={category.title} related="#category-services"/><ServiceSearchContent path={`/services/${slug}`}/><section className="inner-section"><div className="inner-section-heading"><span className="eyebrow">BUILT AROUND YOUR BUSINESS</span><h2>The right expertise for your next step.</h2><p>{category.audience}</p></div><div id="category-services"><AgencyServiceCards services={services}/></div></section><section className="inner-final-cta"><h2>Need more than one capability?</h2><p>Explore coordinated engagements across technology, business development and digital marketing.</p><Link className="button-primary" href="/growth-solutions">Explore Growth Solutions</Link></section></PublicLayout>;}
