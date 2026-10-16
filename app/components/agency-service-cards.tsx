import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import type {PublicService} from '@/lib/public-content';
export default function AgencyServiceCards({services}:{services:PublicService[]}){return <div className="services-grid">{services.map(service=>{const Icon=service.icon;return <article className="service-card" key={service.slug}><div className="service-card-top"><span>{service.n}</span><span className="service-icon"><Icon size={21}/></span></div><h3>{service.slug==='software-testing'?'Software Testing & QA':service.title}</h3><p>{service.desc}</p><Link className="service-detail-link" href={`/services/${service.slug}`}>Explore service <ArrowUpRight size={16}/></Link></article>;})}</div>;}
