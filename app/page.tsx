import {metadataForPath} from '@/lib/seo';
import {parseProcessDetails} from '@/lib/site-expansion';
import type {Metadata} from 'next';
import {brandStructuredData} from '@/lib/brand-seo';
import {brandIcons} from '@/lib/brand-icons';
import ProcessExperience from './components/process-experience';
import {parseCapabilities,parsePresentation} from '@/lib/home-presentation';

import {designId} from '@/lib/design-ids';
import PublishedSections from '@/app/components/published-sections';
import {projectCover} from '@/lib/project-cover';
import {articleCover} from '@/lib/blog-content';
import {parseHomeSectionStyles,type HomeStyleKey} from '@/lib/home-section-styles';
import type {CSSProperties} from 'react';
import {parseWhyReasons} from '@/lib/why-content';
import {parseHomeLayout,type HomeSectionKey} from '@/lib/home-layout';
import {parseHomepageItems,defaultProcessSteps} from '@/lib/homepage-content';
export const dynamic = 'force-dynamic';
export async function generateMetadata():Promise<Metadata>{return metadataForPath('/');}


import {
  ArrowRight, TrendingUp,
  Code2, Layers3, MessageCircle,
  Palette, ShieldCheck, Send, BrainCircuit, Workflow,
} from 'lucide-react';
import { PublicLayout } from './components/site-chrome';
import {getPublishedProjects,getPublicArticles as getPublishedArticles} from '@/lib/public-content';
import Link from 'next/link';
import {getSiteSettings} from '@/lib/site-settings';



const reasons = [
  ['AI-first thinking', 'We look for practical ways intelligent technology can solve real business problems.', BrainCircuit],
  ['Tailored solutions', 'The approach starts with your needs, not a one-size-fits-all package.', Layers3],
  ['End-to-end delivery', 'From planning and design through development, testing and deployment.', Workflow],
  ['Transparent collaboration', 'Clear communication, shared visibility and agreed milestones.', MessageCircle],
  ['Scalable engineering', 'Build with maintainability and future growth in mind.', TrendingUp],
  ['Quality & reliability', 'Thoughtful testing and maintainable foundations are part of the process.', ShieldCheck],
] as const;

export default async function HomePage() {
  const [featuredProjects,recentArticles,settings]=await Promise.all([getPublishedProjects(),getPublishedArticles(),getSiteSettings()]);
  const sectionLayout=parseHomeLayout(settings.home_layout);
  const homeStyles=parseHomeSectionStyles(settings.home_section_styles);
  const sectionStyles=(key:HomeSectionKey):CSSProperties=>{
   const style=homeStyles[key as HomeStyleKey];
   return {order:sectionLayout.findIndex(entry=>entry.key===key),
    ...(style.background?{backgroundColor:style.background}:{}),
    ...(style.headingColor?{'--home-heading-color':style.headingColor} as CSSProperties:{}),
    ...(style.headingSize?{'--home-heading-size':`${style.headingSize}px`} as CSSProperties:{}),
    ...(style.spacing?{paddingTop:style.spacing,paddingBottom:style.spacing}:{})};
  };
  const sectionVisible=(key:HomeSectionKey)=>sectionLayout.find(entry=>entry.key===key)?.visible!==false;
  const featuredSlugs=(()=>{try{const parsed:unknown=JSON.parse(settings.home_featured_project_slugs);return Array.isArray(parsed)&&parsed.length===4&&parsed.every(v=>typeof v==='string')?parsed as string[]:[];}catch{return [] as string[];}})();
  const legacyFeatured:Record<string,string>={'lec-crm':'lec-crm-web-app','salesfox':'salesfox-website','evolve-training-app':'evolve-training-mobile-app','myyogi-app':'myyogi-mobile-app'};
  const curatedProjects=featuredSlugs.map(slug=>featuredProjects.find(project=>project.slug===slug)||featuredProjects.find(project=>project.slug===legacyFeatured[slug]));
  const capabilities=parseCapabilities(settings.home_capability_groups);const presentation=parsePresentation(settings.home_presentation);
  const homeWhyReasons=parseWhyReasons(settings.home_why_reasons);
  const homeProcess=parseHomepageItems(settings.home_process_steps,defaultProcessSteps,['title','description','deliverable']);
  return (
    <PublicLayout><main data-design-id={designId("app/page.tsx:6069")} id="home" className="homepage-editable-order reference-home" style={{"--hero-top":`${presentation.heroTopPadding}px`,"--hero-bottom":`${presentation.heroBottomPadding}px`,"--reason-header":presentation.reasonHeaderBackground,"--reason-header-text":presentation.reasonHeaderText,"--reason-icon":presentation.reasonIconColor,"--portfolio-quadrant":`${presentation.portfolioImageSize}px`} as CSSProperties}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(brandStructuredData(settings)).replace(/</g,'\\u003c')}}/>

      <section data-design-id={designId("app/page.tsx:6129")} style={sectionStyles('hero')} className="hero-section">
        <div data-design-id={designId("app/page.tsx:6202")} className="hero-grid-glow" />
        <div data-design-id={designId("app/page.tsx:6245")} className="hero-content">
          <div data-design-id={designId("app/page.tsx:6286")} className="eyebrow"><span data-design-id={designId("app/page.tsx:6311")} className="eyebrow-dot" /> {settings.hero_eyebrow}</div>
          <h1 data-design-id={designId("app/page.tsx:6384")}>{settings.hero_headline}</h1>
          <p data-design-id={designId("app/page.tsx:6428")} className="hero-copy">{settings.hero_description}</p>
          <div data-design-id={designId("app/page.tsx:6495")} className="hero-actions"><Link className="button-primary" href="/work">Explore Our Work <ArrowRight size={17} /></Link><Link className="button-secondary" href="/contact">Let&apos;s Talk </Link></div>
          <div data-design-id={designId("app/page.tsx:6736")} className="hero-footnote"><span data-design-id={designId("app/page.tsx:6767")} className="tiny-orbit"><i data-design-id={designId("app/page.tsx:6796")} /></span><span data-design-id={designId("app/page.tsx:6808")}>From first idea to launch — built around your goals.</span></div>
        </div>
        <div data-design-id={designId("app/page.tsx:6903")} className="hero-art" aria-label="Abstract blue and violet 3D technology orb illustration">
          <div data-design-id={designId("app/page.tsx:7009")} className="showcase-product-frame" aria-hidden="true"><div data-design-id={designId("app/page.tsx:7068")} className="showcase-browser"><span data-design-id={designId("app/page.tsx:7102")}/><span data-design-id={designId("app/page.tsx:7109")}/><span data-design-id={designId("app/page.tsx:7116")}/><i data-design-id={designId("app/page.tsx:7123")}>VELAUR / PRODUCT PREVIEW</i></div><div data-design-id={designId("app/page.tsx:7160")} className="showcase-mini-stats"><div data-design-id={designId("app/page.tsx:7197")}><small data-design-id={designId("app/page.tsx:7202")}>INTEGRATIONS</small><strong data-design-id={designId("app/page.tsx:7229")}>Connected</strong></div><div data-design-id={designId("app/page.tsx:7261")}><small data-design-id={designId("app/page.tsx:7266")}>WORKFLOWS</small><strong data-design-id={designId("app/page.tsx:7290")}>Intelligent</strong></div></div><div data-design-id={designId("app/page.tsx:7330")} className="showcase-bars"><i data-design-id={designId("app/page.tsx:7361")}/><i data-design-id={designId("app/page.tsx:7365")}/><i data-design-id={designId("app/page.tsx:7369")}/><i data-design-id={designId("app/page.tsx:7373")}/><i data-design-id={designId("app/page.tsx:7377")}/><i data-design-id={designId("app/page.tsx:7381")}/></div><div data-design-id={designId("app/page.tsx:7391")} className="showcase-footer"><span data-design-id={designId("app/page.tsx:7424")}>AI-powered digital products</span><Code2 size={17}/></div></div><div data-design-id={designId("app/page.tsx:7494")} className="showcase-phone" aria-hidden="true"><div data-design-id={designId("app/page.tsx:7545")} className="showcase-phone-speaker"/><div data-design-id={designId("app/page.tsx:7586")} className="showcase-phone-orb"/><div data-design-id={designId("app/page.tsx:7623")} className="showcase-phone-lines"><i data-design-id={designId("app/page.tsx:7661")}/><i data-design-id={designId("app/page.tsx:7665")}/><i data-design-id={designId("app/page.tsx:7669")}/></div><small data-design-id={designId("app/page.tsx:7679")}>Mobile experiences</small></div><div data-design-id={designId("app/page.tsx:7718")} className="art-orbit orbit-one" /><div data-design-id={designId("app/page.tsx:7757")} className="art-orbit orbit-two" /><div data-design-id={designId("app/page.tsx:7796")} className="art-orbit orbit-three" />
          <div data-design-id={designId("app/page.tsx:7848")} className="art-core"><div data-design-id={designId("app/page.tsx:7874")} className="core-shine" /><div data-design-id={designId("app/page.tsx:7904")} className="core-grid" /><span data-design-id={designId("app/page.tsx:7933")} className="core-cross">✳</span></div>
          <div data-design-id={designId("app/page.tsx:7987")} className="art-chip chip-ai"><BrainCircuit size={16} /><span data-design-id={designId("app/page.tsx:8047")}>Intelligence</span></div>
          <div data-design-id={designId("app/page.tsx:8089")} className="art-chip chip-code"><Code2 size={16} /><span data-design-id={designId("app/page.tsx:8144")}>Engineering</span></div>
          <div data-design-id={designId("app/page.tsx:8185")} className="art-chip chip-flow"><Workflow size={16} /><span data-design-id={designId("app/page.tsx:8243")}>Automation</span></div>
          <div data-design-id={designId("app/page.tsx:8283")} className="art-star star-a">✦</div><div data-design-id={designId("app/page.tsx:8323")} className="art-star star-b">✧</div><div data-design-id={designId("app/page.tsx:8363")} className="art-star star-c">·</div>
        </div>
        <div data-design-id={designId("app/page.tsx:8427")} className="hero-bottom-line"><span data-design-id={designId("app/page.tsx:8461")}>DESIGN WITH INTENTION</span><span data-design-id={designId("app/page.tsx:8495")}>ENGINEER WITH PURPOSE</span><span data-design-id={designId("app/page.tsx:8529")}>BUILD FOR WHAT&apos;S NEXT</span></div>
      </section>

      <section data-design-id={designId("app/page.tsx:8599")} style={sectionStyles('capabilities')} hidden={!sectionVisible('capabilities')} className="trust-strip" aria-label="Our capabilities"><span data-design-id={designId("app/page.tsx:8741")}>BUILT AROUND YOUR BUSINESS</span><div data-design-id={designId("app/page.tsx:8780")}><BrainCircuit /> AI &amp; Software</div><div data-design-id={designId("app/page.tsx:8831")}><Code2 /> Business Development</div><div data-design-id={designId("app/page.tsx:8872")}><Palette /> Digital Marketing</div><div data-design-id={designId("app/page.tsx:8909")}><Workflow /> Growth Solutions</div></section>

      <section data-design-id={designId("app/page.tsx:8973")} style={sectionStyles('services')} hidden={!sectionVisible('services')} className="section services-section" id="services">
        <div data-design-id={designId("app/page.tsx:9113")} className="section-heading"><div data-design-id={designId("app/page.tsx:9146")}><div data-design-id={designId("app/page.tsx:9151")} className="eyebrow">WHAT WE DO</div><h2 data-design-id={designId("app/page.tsx:9192")}>{settings.home_services_title}</h2></div><p data-design-id={designId("app/page.tsx:9237")}>{settings.home_services_intro}</p></div>
        <div className="capability-reference-grid">{capabilities.filter(card=>card.visible).map((card)=>{const Icon=brandIcons[card.icon]||BrainCircuit;return <article className="capability-reference-card" key={card.href} data-design-id={designId('home-capability',card.href)}><div className="capability-card-heading"><span className="capability-reference-icon"><Icon size={26}/></span><h3>{card.title}</h3></div><p>{card.description}</p><Link href={card.href}>Explore services</Link></article>;})}</div>
      </section>

      <section data-design-id={designId("app/page.tsx:9886")} style={sectionStyles('work')} hidden={!sectionVisible('work')} className="work-section" id="work"><div data-design-id={designId("app/page.tsx:9993")} className="section work-inner"><div data-design-id={designId("app/page.tsx:10029")} className="section-heading"><div data-design-id={designId("app/page.tsx:10062")}><div data-design-id={designId("app/page.tsx:10067")} className="eyebrow">SELECTED WORK</div><h2 data-design-id={designId("app/page.tsx:10111")}>{settings.home_work_title}</h2></div><p data-design-id={designId("app/page.tsx:10152")}>{settings.home_work_intro}</p></div>
        <div data-design-id={designId("app/page.tsx:10200")} className="featured-editorial-grid home-featured-grid" aria-label="Featured work">
          {(featuredSlugs.length===4?featuredSlugs:['lec-crm','salesfox','evolve-training-app','myyogi-app']).map((slug,index)=>{
            const project=curatedProjects[index];
            const cover=project?projectCover(project.content):undefined;
            const fallback=[
              {title:'LEC CRM',category:'Web application · CRM',href:'/work/web-applications'},
              {title:'SalesFox',category:'Website · Digital platform',href:'/work/websites'},
              {title:'Evolve Training App',category:'Mobile application',href:'/work/mobile-apps'},
              {title:'MyYogi App',category:'Mobile application',href:'/work/mobile-apps'},
            ][index];
            return project ? <Link className="featured-editorial-card home-featured-project" href={`/work/projects/${project.slug}`} key={`${slug}-${index}`}>
              
              {cover?<span data-design-id={designId("app/page.tsx:11234")} className="home-featured-image"><img data-design-id={designId("app/page.tsx:11272")} src={cover.url} alt={cover.alt||`${project.title} project screenshot`} loading="lazy"/></span>:<span data-design-id={designId("app/page.tsx:11372")} className="featured-card-art" aria-hidden="true"><span data-design-id={designId("app/page.tsx:11427")} className="featured-screen"/><span data-design-id={designId("app/page.tsx:11462")} className="featured-screen-secondary"/></span>}
              <strong data-design-id={designId("app/page.tsx:11530")}>{project.title}</strong><small data-design-id={designId("app/page.tsx:11562")}>{project.category.replaceAll('_',' ')}</small>
              <p className="featured-project-summary">{typeof (project.content as Record<string,unknown>)?.featured_summary==='string'?(project.content as Record<string,string>).featured_summary:project.summary}</p><span data-design-id={designId("app/page.tsx:11630")} className="featured-card-status">View project</span>
            </Link> : <Link className="featured-editorial-card" href={fallback.href} key={`${slug}-${index}`}>
              
              <span data-design-id={designId("app/page.tsx:11903")} className="featured-card-art" aria-hidden="true"><span data-design-id={designId("app/page.tsx:11958")} className="featured-screen"/><span data-design-id={designId("app/page.tsx:11993")} className="featured-screen-secondary"/></span>
              <strong data-design-id={designId("app/page.tsx:12060")}>{fallback.title}</strong><small data-design-id={designId("app/page.tsx:12093")}>{fallback.category}</small>
              <span data-design-id={designId("app/page.tsx:12142")} className="featured-card-status">Explore related work · case study not published</span>
            </Link>;
          })}
        </div>
      </div></section>

      <section data-design-id={designId("app/page.tsx:12440")} style={sectionStyles('process')} hidden={!sectionVisible('process')} className="section process-section" id="process"><div data-design-id={designId("app/page.tsx:12567")} className="section-heading"><div data-design-id={designId("app/page.tsx:12600")}><div data-design-id={designId("app/page.tsx:12605")} className="eyebrow">HOW WE WORK</div><h2 data-design-id={designId("app/page.tsx:12647")}>{settings.home_process_title}</h2></div><p data-design-id={designId("app/page.tsx:12691")}>{settings.home_process_intro}</p></div><ProcessExperience items={homeProcess} details={parseProcessDetails(settings.home_process_details)}/></section>

      <section data-design-id={designId("app/page.tsx:13163")} style={sectionStyles('why')} hidden={!sectionVisible('why')} className="why-section" id="about"><div data-design-id={designId("app/page.tsx:13268")} className="section why-inner"><div data-design-id={designId("app/page.tsx:13303")} className="why-intro"><div data-design-id={designId("app/page.tsx:13330")} className="eyebrow">WHY VELAUR LABS</div><h2 data-design-id={designId("app/page.tsx:13376")}>{settings.home_why_title}</h2><p data-design-id={designId("app/page.tsx:13410")}>{settings.home_why_intro}</p><Link className="text-link" href="/about">Discover our approach</Link><div data-design-id={designId("app/page.tsx:13512")} className="why-orb"><div data-design-id={designId("app/page.tsx:13537")} /><span data-design-id={designId("app/page.tsx:13544")}>V</span></div></div><div data-design-id={designId("app/page.tsx:13570")} className="reasons-grid">{reasons.map(([,,Icon],i) => <article data-design-id={designId("app/page.tsx:13628",i)} className="reason-card" key={i}><div className="reason-header"><span data-design-id={designId("app/page.tsx:13670")} className="reason-icon"><Icon size={20} /></span><h3 data-design-id={designId("app/page.tsx:13725")}>{homeWhyReasons[i].title}</h3></div><p data-design-id={designId("app/page.tsx:13759")}>{homeWhyReasons[i].description}</p></article>)}</div></div></section>

      <section data-design-id={designId("app/page.tsx:13839")} style={sectionStyles('insights')} hidden={!sectionVisible('insights')} className="section blog-section" id="insights"><div data-design-id={designId("app/page.tsx:13966")} className="section-heading"><div data-design-id={designId("app/page.tsx:13999")}><div data-design-id={designId("app/page.tsx:14004")} className="eyebrow">IDEAS & INSIGHTS</div><h2 data-design-id={designId("app/page.tsx:14051")}>{settings.home_blog_title}</h2></div><p data-design-id={designId("app/page.tsx:14092")}>{settings.home_blog_intro}</p></div>{recentArticles.length ? <div data-design-id={designId("app/page.tsx:14182")} className="builder-cards editorial-cards">{recentArticles.slice(0,3).map(article=><article data-design-id={designId("app/page.tsx:14313",article.slug)} key={article.slug} className="builder-card"><div data-design-id={designId("app/page.tsx:14366")} className="editorial-cover">{articleCover(article)&&<img src={articleCover(article)!.url} alt={articleCover(article)!.alt} width="1200" height="690" loading="lazy" decoding="async"/>}</div><span data-design-id={designId("app/page.tsx:14558")} className="project-type">{article.category||'INSIGHTS'}</span><h3 data-design-id={designId("app/page.tsx:14626")}>{article.title}</h3><p data-design-id={designId("app/page.tsx:14650")}>{article.excerpt}</p><Link href={`/blog/${article.slug}`}>Read {article.title}</Link></article>)}</div> : <div data-design-id={designId("app/page.tsx:14750")} className="blog-empty"><div data-design-id={designId("app/page.tsx:14779")} className="blog-empty-icon"><BookIcon /></div><div data-design-id={designId("app/page.tsx:14830")}><h3 data-design-id={designId("app/page.tsx:14835")}>Fresh perspectives are on the way.</h3><p data-design-id={designId("app/page.tsx:14878")}>Our insights will appear here as articles are reviewed and published.</p></div><Link href="/blog" className="text-link">Read Insights <ArrowRight size={15} /></Link></div>}</section>

      <section data-design-id={designId("app/page.tsx:15071")} style={sectionStyles('cta')} hidden={!sectionVisible('cta')} className="final-cta" id="contact"><div data-design-id={designId("app/page.tsx:15176")} className="cta-glow" /><div data-design-id={designId("app/page.tsx:15204")} className="cta-content"><div data-design-id={designId("app/page.tsx:15233")} className="eyebrow"><span data-design-id={designId("app/page.tsx:15258")} className="eyebrow-dot" /> YOUR NEXT CHAPTER STARTS HERE</div><h2 data-design-id={designId("app/page.tsx:15326")}>{settings.home_cta_title}</h2><p data-design-id={designId("app/page.tsx:15360")}>{settings.home_cta_intro}</p><div data-design-id={designId("app/page.tsx:15392")} className="hero-actions"><Link className="button-primary" href="/contact">Let&apos;s Talk <ArrowRight size={17} /></Link><a data-design-id={designId("app/page.tsx:15518")} className="button-secondary" href={settings.calendly_url} target="_blank" rel="noreferrer">Book a Call </a></div><span data-design-id={designId("app/page.tsx:15660")} className="cta-email">{settings.contact_email} · Remote · Worldwide</span></div></section>

      
    </main><PublishedSections slug="home"/></PublicLayout>
  );
}

function BookIcon() { return <Send size={21} />; }

