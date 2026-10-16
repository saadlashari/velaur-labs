'use client';
import {serviceCategories,categoryForService,allServiceNavigation,solutionNavigation} from '@/lib/agency-navigation';
import {designId} from '@/lib/design-ids';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './theme-toggle';
import { usePathname } from 'next/navigation';
import {ChevronDown} from 'lucide-react';
import {brandIcons,serviceIconDefaults} from '@/lib/brand-icons';

type MenuItem={label:string;href:string};
type ServiceMenuItem=MenuItem&{icon?:string};
export default function SiteHeader({ctaLabel="Let's Talk",ctaUrl='/contact',menu,serviceMenu,previewPath}:{previewPath?:string;ctaLabel?:string;ctaUrl?:string;menu?:MenuItem[];serviceMenu?:ServiceMenuItem[]}) {
  const navigation=menu??[{label:'Home',href:'/'},{label:'About',href:'/about'},{label:'Services',href:'/services'},{label:'Our Work',href:'/work'},{label:'Blog',href:'/blog'},{label:'Contact',href:'/contact'}];
  const actualServices:ServiceMenuItem[]=serviceMenu??allServiceNavigation.map(({title,slug})=>({label:title,href:`/services/${slug}`}));
  const actualPathname = usePathname();
  const pathname = previewPath || actualPathname;
  const [mobile, setMobile] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [expandedGroup,setExpandedGroup]=useState<string|null>(null);
  const [scrolled, setScrolled] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setMobile(false); setServicesOpen(false); }, [pathname]);
  useEffect(()=>{const query=window.matchMedia('(max-width: 800px)');const reset=()=>{setMobile(false);setServicesOpen(false);};query.addEventListener('change',reset);return()=>query.removeEventListener('change',reset);},[]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setServicesOpen(false); setMobile(false); if(window.matchMedia('(max-width: 800px)').matches)menuButton.current?.focus(); } };
    const onPointer = (event: PointerEvent) => { if (wrap.current && !wrap.current.contains(event.target as Node)) setServicesOpen(false); if(header.current&&!header.current.contains(event.target as Node))setMobile(false); };
    document.addEventListener('keydown', onKey); document.addEventListener('pointerdown', onPointer);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer); };
  }, []);
  return <header ref={header} data-design-id={designId("app/components/site-header.tsx:3339")} className={`site-header${!scrolled ? ' is-transparent' : ' is-scrolled'}`}>
    <div data-design-id={designId("app/components/site-header.tsx:3428")} className="site-header-inner">
      <Link className="brand-logo-link" href="/" aria-label="VELAUR LABS home"><Image src="/velaur-symbol-transparent.png" alt="" width={504} height={302} priority className="brand-logo-symbol-img" /><Image src="/velaur-wordmark-transparent.png" alt="VELAUR LABS — AI, Web, Mobile, Software" width={860} height={198} priority className="brand-logo-img brand-wordmark-dark" /><Image src="/velaur-wordmark-light-transparent.png" alt="VELAUR LABS — AI, Web, Mobile, Software" width={860} height={198} priority className="brand-logo-img brand-wordmark-light" /></Link>
      <button ref={menuButton} data-design-id={designId("app/components/site-header.tsx:5761")} className="mobile-menu-toggle" type="button" aria-label={mobile?'Close navigation':'Open navigation'} aria-controls="site-main-navigation" aria-expanded={mobile} onClick={()=>setMobile(v=>!v)}><span className="hamburger-lines" aria-hidden="true"><i/><i/><i/></span></button>
      <nav id="site-main-navigation" data-design-id={designId("app/components/site-header.tsx:3809")} className={`site-nav${mobile ? ' is-open' : ''}`} aria-label="Main navigation" onClick={event=>{if((event.target as Element).closest('a')){setMobile(false);setServicesOpen(false);}}}>
        {navigation.map(item=>item.href==='/services'?<div data-design-id={designId("app/components/site-header.tsx:3948","services")} key="services" className="nav-menu-item"><div data-design-id={designId("app/components/site-header.tsx:3994")} ref={wrap} className={`nav-dropdown-wrap${servicesOpen ? ' is-open':''}`} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setServicesOpen(false);}}>
          <div data-design-id={designId("app/components/site-header.tsx:4390")} className="nav-services-row"><Link href="/services" className="nav-services-link" aria-current={pathname.startsWith('/services')?'page':undefined} onMouseEnter={()=>{if(window.matchMedia('(min-width: 801px)').matches)setServicesOpen(true);}} onFocus={()=>{if(window.matchMedia('(min-width: 801px)').matches)setServicesOpen(true);}}>Services</Link><button data-design-id={designId("app/components/site-header.tsx:4557")} type="button" className="nav-dropdown-trigger" aria-haspopup="true" aria-controls="services-mega-menu" aria-expanded={servicesOpen} aria-label="Toggle services menu" onClick={() => setServicesOpen(v=>!v)}><ChevronDown size={15}/></button></div>
          <div data-design-id={designId("app/components/site-header.tsx:4820")} id="services-mega-menu" className="nav-dropdown agency-mega-menu" hidden={!servicesOpen}>
            <div className="agency-mega-grid">{[...serviceCategories,{slug:'growth-solutions',title:'Growth Solutions'}].map(group=>{const links=group.slug==='growth-solutions'?solutionNavigation.map(([slug,label])=>({label,href:`/growth-solutions/${slug}`})):actualServices.filter(item=>categoryForService(item.href.split('/').pop()||'')===group.slug);return <section key={group.slug} className="agency-menu-group"><div className="agency-menu-group-heading"><Link href={group.slug==='growth-solutions'?'/growth-solutions':`/services/${group.slug}`}>{group.title}</Link><button type="button" className="agency-group-toggle" aria-label={`Toggle ${group.title}`} aria-expanded={expandedGroup===group.slug} aria-controls={`service-group-${group.slug}`} onClick={()=>setExpandedGroup(value=>value===group.slug?null:group.slug)}><ChevronDown size={18}/></button></div><div id={`service-group-${group.slug}`} className={'agency-menu-links'+(expandedGroup===group.slug?' is-expanded':'')}>{links.map(item=>{const key='icon' in item?String(item.icon||''):'';const Icon=brandIcons[key]||brandIcons[serviceIconDefaults[item.href.split('/').pop()||'']]||brandIcons.brain;return <Link key={item.href} href={item.href}><Icon size={16} aria-hidden="true"/><span>{item.label}</span></Link>;})}</div></section>;})}</div>

          </div>
        </div></div>:<Link key={item.href+item.label} href={item.href} aria-current={pathname===item.href?'page':undefined}>{item.label}</Link>)}
        <Link href={ctaUrl} className="nav-mobile-cta">{ctaLabel}</Link>
        <div className="nav-theme-control"><span>Appearance</span><ThemeToggle/></div>
      </nav>
      <div data-design-id={designId("app/components/site-header.tsx:5658")} className="header-actions"><ThemeToggle/><Link className="nav-cta" href={ctaUrl}>{ctaLabel}</Link></div>
    </div>
  </header>;
}

