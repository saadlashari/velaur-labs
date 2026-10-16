import HeroVisual from './hero-visual';

import {designId} from '@/lib/design-ids';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {getSiteSettings} from '@/lib/site-settings';
export default async function PageHero({ eyebrow, title, highlight, copy,showActions=true }: { eyebrow: string; title: string; highlight?: string; copy: string;showActions?:boolean }) {
  const settings=await getSiteSettings();
  return <section data-design-id={designId("app/components/page-hero.tsx:223")} className={`inner-hero${settings.inner_hero_visuals_enabled!=='false'?' has-topic-visual':''}`}><div className="inner-hero-content"><div data-design-id={designId("app/components/page-hero.tsx:256")} className="inner-hero-glow" /><div data-design-id={designId("app/components/page-hero.tsx:291")} className="eyebrow"><span data-design-id={designId("app/components/page-hero.tsx:316")} className="eyebrow-dot" />{eyebrow}</div><h1 data-design-id={designId("app/components/page-hero.tsx:363")}>{title}{highlight && <> <span data-design-id={designId("app/components/page-hero.tsx:391")}>{highlight}</span></>}</h1><p data-design-id={designId("app/components/page-hero.tsx:424")}>{copy}</p>{showActions&&<div data-design-id={designId("app/components/page-hero.tsx:437")} className="hero-actions"><Link className="button-primary" href="/contact">Let&apos;s Talk <ArrowRight size={16} /></Link><a className="button-secondary" href={settings?.calendly_url||"/contact"} target={settings?.calendly_url?"_blank":undefined} rel="noopener noreferrer">Book a Call</a></div>}</div>{settings.inner_hero_visuals_enabled!=='false'&&<HeroVisual text={`${eyebrow} ${title} ${highlight||''}`}/>}</section>;
}
