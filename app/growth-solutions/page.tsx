import {metadataForPath} from '@/lib/seo';
import type {Metadata} from 'next';
import Link from 'next/link';
import {PublicLayout} from '@/app/components/site-chrome';
import PageHero from '@/app/components/page-hero';
import {Breadcrumbs} from '@/app/components/agency-sections';
import {growthSolutions} from '@/lib/agency-catalog';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{return metadataForPath('/growth-solutions');}
export default async function GrowthOverview(){return <PublicLayout><Breadcrumbs items={[{label:'Home',href:'/'},{label:'Growth Solutions'}]}/><PageHero showActions={false} eyebrow="TECHNOLOGY · BUSINESS · GROWTH" title="Connected capabilities. A considered growth plan." copy="Choose an engagement around your situation, then agree the services, sequence and responsibilities that make sense for your business."/><section className="inner-section"><div className="service-outcome-grid">{growthSolutions.map(solution=><Link className="service-outcome-card" key={solution.slug} href={`/growth-solutions/${solution.slug}`}><span className="eyebrow">GROWTH SOLUTION</span><h2>{solution.title}</h2><p>{solution.description}</p><span>Explore the approach </span></Link>)}</div></section><section className="inner-final-cta"><h2>Start with the priority, then choose the scope.</h2><p>Tell us about your audience, current workflow and the next problem to solve.</p><Link className="button-primary" href="/contact#inquiry-form">Book a Discovery Call</Link></section></PublicLayout>;}
