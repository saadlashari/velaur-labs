import {articleEditorial} from './article-editorial';
import {getServiceProfile} from './agency-catalog';
import {serviceData} from './service-catalog';
import {launchArticles} from './launch-articles';
import catalog from '@/data/portfolio.json';
export function defaultContent(module:string):Record<string,unknown>[]{
 if(module==='projects')return catalog;
 if(module==='services')return serviceData.map((item,index)=>({slug:item.slug,title:item.title,summary:item.desc,category:item.group==='AI & Intelligent Solutions'?'AI':item.group==='Design & Quality'?'DESIGN':'SOFTWARE',content:{paragraphs:[item.detail],deliverables:item.deliverables,process:getServiceProfile(item.slug)?.process,faqs:getServiceProfile(item.slug)?.faqs},status:'PUBLISHED',position:index,seo_title:'',meta_description:''}));
 if(module==='blog')return launchArticles.map(item=>({slug:item.slug,title:item.title,category:item.category,excerpt:item.excerpt,body:{cover:{url:item.image,alt:item.title+' cover'},sections:item.sections,editorial:articleEditorial(item)},status:'PUBLISHED',seo_title:'',meta_description:''}));
 return [];
}
