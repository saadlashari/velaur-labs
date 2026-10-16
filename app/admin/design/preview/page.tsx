import GrowthOverview from '@/app/growth-solutions/page';import GrowthSolution from '@/app/growth-solutions/[slug]/page';
import {cloneElement,isValidElement,type ReactElement} from 'react';
import {notFound} from 'next/navigation';import {getCurrentAdmin,can} from '@/lib/auth';import {db} from '@/lib/db';
import {getSiteSettings,type SiteSettings} from '@/lib/site-settings';import {designPreviewContext} from '@/lib/design-preview-context';
import Home from '@/app/page';import About from '@/app/about/page';import Services from '@/app/services/page';import Work from '@/app/work/page';import Blog from '@/app/blog/page';import Contact from '@/app/contact/page';
import Privacy from '@/app/privacy-policy/page';import Terms from '@/app/terms-of-service/page';import Service from '@/app/services/[slug]/page';import Project from '@/app/work/projects/[slug]/page';import Article from '@/app/blog/[slug]/page';
import Websites from '@/app/work/websites/page';import WebApps from '@/app/work/web-applications/page';import Mobile from '@/app/work/mobile-apps/page';
import PreviewBridge from '../preview-bridge';
export const dynamic='force-dynamic';
export default async function DesignPreview({searchParams}:{searchParams:Promise<{path?:string}>}){
 const user=await getCurrentAdmin();if(!user||!can(user,'settings','VIEW'))notFound();
 const requested=(await searchParams).path||'/';
 const draft=await db.query('SELECT setting_value FROM global_settings WHERE setting_key=$1',['admin_design_'+user.id]);
 const settings={...await getSiteSettings(),...draft.rows[0]?.setting_value?.settings} as SiteSettings;
 const page=await designPreviewContext.run(settings,async()=>{
  switch(requested){case '/':return Home();case '/about':return About();case '/services':return Services();case '/growth-solutions':return GrowthOverview();case '/work':return Work();case '/blog':return Blog({searchParams:Promise.resolve({})});case '/contact':return Contact();case '/privacy-policy':return Privacy();case '/terms-of-service':return Terms();case '/work/websites':return Websites();case '/work/web-applications':return WebApps();case '/work/mobile-apps':return Mobile();}
  const service=requested.match(/^\/services\/([a-z0-9-]+)$/);if(service)return Service({params:Promise.resolve({slug:service[1]})});
  const growth=requested.match(/^\/growth-solutions\/([a-z0-9-]+)$/);if(growth)return GrowthSolution({params:Promise.resolve({slug:growth[1]})});
  const project=requested.match(/^\/work\/projects\/([a-z0-9-]+)$/);if(project)return Project({params:Promise.resolve({slug:project[1]})});
  const article=requested.match(/^\/blog\/([a-z0-9-]+)$/);if(article)return Article({params:Promise.resolve({slug:article[1]})});
  notFound();
 });
 if(!isValidElement(page))notFound();
 return <>{cloneElement(page as ReactElement<{previewSettings?:SiteSettings;previewPath?:string}>,{previewSettings:settings,previewPath:requested})}<PreviewBridge settings={settings}/></>;
}
