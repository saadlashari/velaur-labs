import fs from 'node:fs';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {JSDOM} from 'jsdom';
const base=process.env.VELAUR_TEST_BASE_URL||'http://127.0.0.1:3000';
const pages=JSON.parse(fs.readFileSync('data/seo-pages.json','utf8')),manifest=JSON.parse(fs.readFileSync('data/optimized-media.json','utf8'));
const records=[],titles=new Set(),descriptions=new Set(),links=new Set(),warnings=[];
for(const page of pages){
 const response=await fetch(base+page.path,{redirect:'manual'});assert.equal(response.status,200,page.path);
 const dom=new JSDOM(await response.text()),doc=dom.window.document;
 const title=doc.title,description=doc.querySelector('meta[name="description"]')?.content;
 assert(title.length>=50&&title.length<=60,page.path+' title length '+title.length);
 assert(description.length>=140&&description.length<=160,page.path+' description length '+description.length);
 assert(!titles.has(title),page.path+' duplicate title');assert(!descriptions.has(description),page.path+' duplicate description');titles.add(title);descriptions.add(description);
 assert.equal(doc.querySelectorAll('h1').length,1,page.path+' single H1');
 assert.equal(new URL(doc.querySelector('link[rel="canonical"]').href).pathname,page.path,page.path+' canonical');
 const schemas=[...doc.querySelectorAll('script[type="application/ld+json"]')].map(s=>JSON.parse(s.textContent));
 if(page.path!=='/')assert(schemas.some(s=>s['@type']==='BreadcrumbList'),page.path+' breadcrumb schema');
 for(const schema of schemas.filter(s=>s['@type']==='FAQPage')){
  for(const faq of schema.mainEntity){assert(doc.body.textContent.includes(faq.name),page.path+' FAQ question visible');assert(doc.body.textContent.includes(faq.acceptedAnswer.text),page.path+' FAQ answer visible');}
 }
 if(page.path.startsWith('/work/projects/')){
  assert(!doc.querySelector('meta[name="robots"]').content.includes('noindex'),page.path+' owner keeps portfolio indexed');
  for(const img of doc.querySelectorAll('.project-gallery img')){assert.equal(img.loading||img.getAttribute('loading'),'lazy');if(img.src.startsWith('/project-media/'))assert(img.src.endsWith('-optimized.webp'),page.path+' optimized screenshot');}
 }
 if(page.path.startsWith('/blog/')){
  assert(schemas.some(s=>s['@type']==='BlogPosting'),page.path+' Article schema');
  assert(doc.querySelector('[rel="author"]'),page.path+' attribution');
  assert(doc.querySelector('.page-sharing'),page.path+' share controls');
  assert(doc.querySelector('.editorial-sources a'),page.path+' primary citations');
 }
 const anchors=[...doc.querySelectorAll('a[href]')];assert(anchors.length<150,page.path+' link count '+anchors.length);
 for(const a of anchors){const href=a.getAttribute('href');if(href.startsWith('/'))links.add(new URL(href,base).pathname);}
 const headings=[...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')];let previous=0;
 for(const h of headings){const level=Number(h.tagName[1]);if(previous&&level>previous+1)warnings.push({path:page.path,from:previous,to:level,text:h.textContent});previous=level;}
 const record={path:page.path,title,titleLength:title.length,descriptionLength:description.length,links:anchors.length,schemas:schemas.map(s=>s['@type']||'@graph'),h1:doc.querySelectorAll('h1').length};records.push(record);dom.window.close();
}
for(const slug of ['home','index','about','contact','work','blog','services','privacy-policy','terms-of-service']){
 const response=await fetch(base+'/pages/'+slug,{redirect:'manual'});assert.equal(response.status,308,'built-in alias '+slug);const expected=['home','index'].includes(slug)?'/':'/'+slug;assert.equal(new URL(response.headers.get('location'),base).pathname,expected);
}
for(const path of links){const response=await fetch(base+path,{redirect:'manual'});assert.equal(response.status,200,'internal destination without redirect '+path);}
for(const variant of Object.values(manifest)){const image=fs.readFileSync('public'+variant.url);assert(image.length<=50000,variant.url+' size');const meta=await sharp(image).metadata();assert.equal(meta.format,'webp');assert.equal(meta.width,variant.width);assert.equal(meta.height,variant.height);const response=await fetch(base+variant.url);assert.equal(response.status,200,variant.url+' served');assert(response.headers.get('content-type').includes('image/webp'));assert.equal((await response.arrayBuffer()).byteLength,image.length);}
assert.equal((await fetch(base+'/api/admin/seo')).status,401);
const result={completedAt:new Date().toISOString(),passed:true,pages:records.length,uniqueTitles:titles.size,uniqueDescriptions:descriptions.size,internalDestinations:links.size,aliasRedirects:9,optimizedImages:Object.keys(manifest).length,headingWarnings:warnings,records,limits:'Local production HTML and asset checks. Not Google Rich Results validation, external indexing, SERP averages or ranking verification.'};
fs.writeFileSync('verification/seo-audit-http.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,records:undefined}));
