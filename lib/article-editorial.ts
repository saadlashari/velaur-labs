import defaults from '@/data/article-editorial.json';
export type ArticleEditorial={summary:string;definition:string;takeaways:string[];sections:{heading:string;text:string}[];faqs:{question:string;answer:string}[];sources:{label:string;url:string}[];relatedServices:string[];reviewedAt:string};
export function validArticleEditorial(value:unknown):value is ArticleEditorial{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const v=value as Record<string,unknown>,text=(s:unknown,max:number)=>typeof s==='string'&&s.length<=max&&!/[<>\u0000-\u0008]/.test(s);
 return text(v.summary,900)&&text(v.definition,500)&&typeof v.reviewedAt==='string'&&(v.reviewedAt===''||(/^\d{4}-\d{2}-\d{2}$/.test(v.reviewedAt)&&Number.isFinite(Date.parse(v.reviewedAt))))&&Array.isArray(v.takeaways)&&v.takeaways.length<=6&&v.takeaways.every(s=>text(s,250))&&Array.isArray(v.sections)&&v.sections.length<=10&&v.sections.every(s=>s&&text(s.heading,180)&&text(s.text,6000))&&Array.isArray(v.faqs)&&v.faqs.length<=12&&v.faqs.every(s=>s&&text(s.question,200)&&text(s.answer,1200))&&Array.isArray(v.sources)&&v.sources.length<=12&&v.sources.every(s=>s&&text(s.label,200)&&typeof s.url==='string'&&s.url.length<=2048&&/^https:\/\/[^\s]+$/i.test(s.url))&&Array.isArray(v.relatedServices)&&v.relatedServices.length<=8&&v.relatedServices.every(s=>typeof s==='string'&&/^[a-z0-9-]+$/.test(s));
}
export function articleEditorial(article:{slug:string;body?:unknown}):ArticleEditorial{
 const body=article.body&&typeof article.body==='object'?article.body as Record<string,unknown>:{};
 if(validArticleEditorial(body.editorial))return body.editorial;
 return (defaults as Record<string,ArticleEditorial>)[article.slug]||{summary:'',definition:'',takeaways:[],sections:[],faqs:[],sources:[],relatedServices:[],reviewedAt:''};
}
