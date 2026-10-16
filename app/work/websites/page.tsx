import {metadataForPath} from '@/lib/seo';
export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import CategoryPage from '../../components/portfolio-category';
export async function generateMetadata():Promise<Metadata>{return metadataForPath('/work/websites');}
export default function Page(){ return <CategoryPage categorySlug="websites"/>; }
