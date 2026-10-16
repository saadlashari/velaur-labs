import Link from 'next/link';
import {getSiteSettings} from '@/lib/site-settings';
import {getPublicServices} from '@/lib/public-content';
import {resolveSeoPage} from '@/lib/seo-catalog';
import {serviceStructuredData} from '@/lib/seo';
import {growthSolutions,getServiceProfile} from '@/lib/agency-catalog';
export default async function ServiceSearchContent({path}:{path:string}){
 const [settings,visible]=await Promise.all([getSiteSettings(),getPublicServices()]);const page=resolveSeoPage(path,settings.seo_pages);if(!page)return null;
 const slug=path.split('/').pop()!;const profile=getServiceProfile(slug);const solution=growthSolutions.find(item=>item.slug===slug);
 const linked=visible.filter(service=>profile?.related.includes(service.slug)||solution?.services.includes(service.slug)).slice(0,4);
 const solutions=profile?growthSolutions.filter(item=>item.services.includes(slug)).slice(0,2):[];
 return <>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(serviceStructuredData(path,page.label,page.description)).replace(/</g,'\\u003c')}}/>
  {page.sections.length>0&&<section id="service-scope" className="inner-section seo-service-context" aria-label={`${page.label} scope and remote delivery`}>
   <div className="inner-section-heading"><span className="eyebrow">SERVICE SCOPE & COLLABORATION</span>{page.definition&&<><h2>What is {page.label}?</h2><p>{page.definition}</p></>}</div>{!!page.takeaways?.length&&<aside className="seo-takeaways" aria-label="Key takeaways"><strong>Key takeaways</strong><ul>{page.takeaways.map(item=><li key={item}>{item}</li>)}</ul></aside>}
   <div className="service-outcome-grid">{page.sections.map((section,index)=><article className="service-outcome-card" key={index}><h2>{section.heading}</h2><p>{section.body}</p></article>)}</div>
   {(linked.length>0||solutions.length>0)&&<nav className="seo-related-links" aria-label={`Connected ${page.label} services`}>{linked.map(item=><Link key={item.slug} href={`/services/${item.slug}`}>{item.title}</Link>)}{solutions.map(item=><Link key={item.slug} href={`/growth-solutions/${item.slug}`}>{item.title}</Link>)}</nav>}
  </section>}
 </>;
}
