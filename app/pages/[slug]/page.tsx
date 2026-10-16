import {notFound,permanentRedirect} from 'next/navigation';
import type {Metadata} from 'next';
import {getPublicPage} from '@/lib/page-builder';
import {publicPagePath} from '@/lib/page-path';
import {metadataForPath} from '@/lib/seo';
import {SectionsView} from '@/app/components/published-sections';
import {PublicLayout} from '@/app/components/site-chrome';
import PageHero from '@/app/components/page-hero';
import {Breadcrumbs} from '@/app/components/agency-sections';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const path=publicPagePath(slug);const page=await getPublicPage(slug);const meta=await metadataForPath(path,{title:page?.seo_title||page?.title,description:page?.meta_description});return {...meta,robots:!page||page.no_index?{index:false,follow:true}:meta.robots};}
export default async function CustomPublicPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const path=publicPagePath(slug);if(!path.startsWith('/pages/'))permanentRedirect(path);const page=await getPublicPage(slug);if(!page)notFound();return <PublicLayout><Breadcrumbs items={[{label:'Home',href:'/'},{label:page.title}]}/><PageHero title={page.title} eyebrow="VELAUR LABS" copy={page.meta_description||''}/><SectionsView sections={page.sections}/></PublicLayout>;}
