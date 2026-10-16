'use client';
import {designId} from '@/lib/design-ids';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, X } from 'lucide-react';

export type PortfolioBrowserProject = {
  slug: string;
  title: string;
  summary: string;
  category: 'WEBSITE' | 'WEB_APPLICATION' | 'MOBILE_APP';
  cover: { url: string; alt: string; width?:number;height?:number } | null;
};

const filters = [
  { value: 'ALL', label: 'All projects' },
  { value: 'WEBSITE', label: 'Websites' },
  { value: 'WEB_APPLICATION', label: 'Web apps' },
  { value: 'MOBILE_APP', label: 'Mobile apps' },
] as const;
type Filter = (typeof filters)[number]['value'];

export function matchesPortfolioFilter(item: PortfolioBrowserProject, category: Filter, term: string): boolean {
  const normalized = term.trim().toLocaleLowerCase();
  return (category === 'ALL' || category === item.category) &&
    (!normalized || `${item.title} ${item.summary} ${item.category.replaceAll('_', ' ')}`.toLocaleLowerCase().includes(normalized));
}

export default function PortfolioBrowser({ projects }: { projects: PortfolioBrowserProject[] }) {
  const [category, setCategory] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => projects.filter(item => matchesPortfolioFilter(item, category, query)), [projects, category, query]);
  return <div data-design-id={designId("app/components/portfolio-browser.tsx:1318")} className="portfolio-browser">
    <div data-design-id={designId("app/components/portfolio-browser.tsx:1359")} className="portfolio-browser-toolbar">
      <div data-design-id={designId("app/components/portfolio-browser.tsx:1409")} className="portfolio-filter-tabs" role="group" aria-label="Filter projects by category">
        {filters.map(filter => <button data-design-id={designId("app/components/portfolio-browser.tsx:1533",filter.value)} key={filter.value} type="button" aria-pressed={category === filter.value}
          className={category === filter.value ? 'is-active' : ''} onClick={() => setCategory(filter.value)}>{filter.label}</button>)}
      </div>
      <label data-design-id={designId("app/components/portfolio-browser.tsx:1770")} className="portfolio-search"><Search size={17} aria-hidden="true"/><span data-design-id={designId("app/components/portfolio-browser.tsx:1844")} className="sr-only">Search published projects</span>
        <input data-design-id={designId("app/components/portfolio-browser.tsx:1911")} type="search" placeholder="Search projects" value={query} onChange={event => setQuery(event.target.value)}/>
      </label>
    </div>
    <p data-design-id={designId("app/components/portfolio-browser.tsx:2057")} className="portfolio-result-count" role="status" aria-live="polite">Showing {filtered.length} of {projects.length} published projects</p>
    {filtered.length > 0 ? <div data-design-id={designId("app/components/portfolio-browser.tsx:2224")} className="portfolio-project-grid">
      {filtered.map(project => <article data-design-id={designId("app/components/portfolio-browser.tsx:2296",project.slug)} className="portfolio-project-card" key={project.slug}><Link className="portfolio-card-link" href={`/work/projects/${encodeURIComponent(project.slug)}`}>
        {project.cover && <div className="portfolio-cover">
          <img data-design-id={designId("app/components/portfolio-browser.tsx:2492")} loading="lazy" src={project.cover.url} width={project.cover.width} height={project.cover.height} decoding="async" alt={project.cover.alt || `${project.title} project screenshot`}/>
        </div>}
        <span data-design-id={designId("app/components/portfolio-browser.tsx:2628")} className="eyebrow">{project.category.replaceAll('_', ' ')}</span>
        <h2 data-design-id={designId("app/components/portfolio-browser.tsx:2709")}>{project.title}</h2><p data-design-id={designId("app/components/portfolio-browser.tsx:2733")}>{project.summary}</p>
        <span className="text-link">Explore {project.title} <ArrowUpRight size={16}/></span></Link>
      </article>)}
    </div> : <div data-design-id={designId("app/components/portfolio-browser.tsx:2930")} className="blog-empty-state portfolio-no-results">
      <h3 data-design-id={designId("app/components/portfolio-browser.tsx:2993")}>No matching projects</h3><p data-design-id={designId("app/components/portfolio-browser.tsx:3022")}>Try a different search or category.</p>
      <button data-design-id={designId("app/components/portfolio-browser.tsx:3071")} type="button" onClick={() => {setCategory('ALL');setQuery('');}}><X size={15}/> Clear filters</button>
    </div>}
  </div>;
}
