/** Safe, plain-text blog content stored in the existing blog_posts.body JSONB column. */
import {articleEditorial} from './article-editorial';
import {getLaunchArticle} from './launch-articles';
export type BlogSection = {heading:string;text:string};
export type BlogCover = {url:string;alt:string};
export function articleCover(article:{slug:string;title:string;body?:unknown;image?:unknown}):BlogCover|null{if(typeof article.image==='string')return {url:article.image,alt:article.title+' cover'};const body=article.body&&typeof article.body==='object'?article.body as Record<string,unknown>:{};if('cover' in body)return blogCover(body);const original=getLaunchArticle(article.slug);return original?{url:original.image,alt:original.title+' cover'}:null;}
export function articleWithDefaultCover<T extends {slug:string;title:string;body:unknown}>(article:T):T{const body=article.body&&typeof article.body==='object'&&!Array.isArray(article.body)?article.body as Record<string,unknown>:{};const original=getLaunchArticle(article.slug);return original&&!('cover' in body)?{...article,body:{...body,editorial:articleEditorial(article),cover:{url:original.image,alt:original.title+' cover'}}}:article;}
export function blogCover(body:unknown):BlogCover|null {
  if(!body || typeof body!== 'object' || Array.isArray(body))return null;
  const image=(body as Record<string,unknown>).cover;
  if(!image || typeof image!== 'object' || Array.isArray(image))return null;
  const {url,alt}=image as Record<string,unknown>;
  if(typeof url!=='string'||typeof alt!=='string'||!alt.trim())return null;
  if(!/^\/blog\/[a-z0-9-]+\.svg$/.test(url)){try {const parsed=new URL(url);if(parsed.protocol!=='https:')return null;}catch{return null;}}
  return {url,alt};
}
export function blogSections(body:unknown):BlogSection[] {
  if(!body || typeof body!== 'object' || Array.isArray(body))return [];
  const value=(body as Record<string,unknown>).sections;
  if(!Array.isArray(value))return [];
  return value.slice(0,30).filter((item):item is BlogSection=>Boolean(item)&&typeof item==='object'&&typeof item.heading==='string'&&typeof item.text==='string'&&Boolean(item.heading.trim())&&Boolean(item.text.trim()));
}
