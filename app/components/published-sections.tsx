import { getPublicPage } from '@/lib/page-builder';
import { SectionsView } from './section-renderer';
export { SectionsView } from './section-renderer';
export default async function PublishedSections({slug}:{slug:string}) {
 const page = await getPublicPage(slug);
 return page ? <SectionsView sections={page.sections}/> : null;
}
