import fs from 'node:fs';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const catalog=JSON.parse(fs.readFileSync('data/seo-pages.json','utf8'));
const projects=JSON.parse(fs.readFileSync('data/portfolio.json','utf8'));
const articles=[...fs.readFileSync('lib/launch-articles.ts','utf8').matchAll(/"slug":\s*"([^"]+)"/g)].map(match=>'/blog/'+match[1]);
const base=process.env.VELAUR_TEST_BASE_URL||'http://127.0.0.1:3000';
const routes=[...new Set([...catalog.map(page=>page.path),...projects.map(project=>'/work/projects/'+project.slug),...articles])];
assert.equal(catalog.length,83);assert.equal(new Set(catalog.map(page=>page.path)).size,83);
const titles=new Set(),descriptions=new Set(),checks=[],internal=new Set();
const sitemap=await (await fetch(base+'/sitemap.xml')).text();
for(const path of routes){
 const response=await fetch(base+path);assert.equal(response.status,200,path);
 const html=await response.text(),dom=new JSDOM(html),doc=dom.window.document;
 const title=doc.title,description=doc.querySelector('meta[name="description"]')?.content;
 const canonical=doc.querySelector('link[rel="canonical"]')?.href;
 assert(title&&description,path+' metadata');assert(title.includes('VELAUR LABS'),path+' title branding');assert.equal(new URL(canonical).href,new URL('https://velaurlabs.com'+path).href,path+' canonical');
 assert.equal(doc.querySelectorAll('h1').length,1,path+' single H1');
 assert.equal(doc.documentElement.lang,'en');assert(!doc.querySelector('meta[name="keywords"]'),'no obsolete keyword stuffing tag');
 assert(doc.querySelector('meta[property="og:title"]')?.content,path+' Open Graph title');
 assert(doc.querySelector('meta[property="og:image"]')?.content.endsWith('/brand/social-preview-premium.png'),path+' brand image');
 assert.equal(doc.querySelector('meta[name="twitter:card"]')?.content,'summary_large_image');
 assert(sitemap.includes(new URL('https://velaurlabs.com'+(path==='/'?'':path)).href.replace(/\/$/,'')+'</loc>')||sitemap.includes('https://velaurlabs.com'+path+'</loc>'),path+' sitemap');
 const entry=catalog.find(page=>page.path===path);
 if(entry){assert(!titles.has(title),path+' duplicate managed title');assert(!descriptions.has(description),path+' duplicate managed description');titles.add(title);descriptions.add(description);assert.equal(description,entry.description,path+' catalogue description');
  for(const section of entry.sections){assert([...doc.querySelectorAll('h2')].some(heading=>heading.textContent===section.heading),path+' scope heading');assert(doc.body.textContent.includes(section.body),path+' visible scope content');}
  if(entry.sections.length){const schemas=[...doc.querySelectorAll('script[type="application/ld+json"]')].map(script=>JSON.parse(script.textContent));const schema=schemas.find(item=>item['@type']==='Service');assert(schema,path+' Service schema');assert.equal(schema.areaServed.name,'Worldwide');assert.equal(schema.provider.name,'VELAUR LABS');assert.equal(schema.url,'https://velaurlabs.com'+path);}
 }
 for(const link of doc.querySelectorAll('a[href^="/"]'))internal.add(new URL(link.getAttribute('href'),base).pathname);
 checks.push({path,status:response.status,title,description,canonical,contentBlocks:entry?.sections.length||0});dom.window.close();
}
for(const path of internal){const response=await fetch(base+path,{redirect:'follow'});assert.equal(response.status,200,'internal link '+path);}
assert.equal((await fetch(base+'/api/admin/seo')).status,401,'anonymous SEO API rejected');
const image=await fetch(base+'/brand/social-preview-premium.png');assert.equal(image.status,200);const png=Buffer.from(await image.arrayBuffer());assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
const result={completedAt:new Date().toISOString(),passed:true,managedPages:catalog.length,distinctSearchPhrases:new Set(catalog.flatMap(page=>page.keywords.map(term=>term.toLowerCase()))).size,publicRoutes:checks.length,internalDestinations:internal.size,results:checks,limits:'Rendered local production HTML and HTTP checks. Search volume, ranking, Google recrawling and external account configuration were not tested.'};
fs.writeFileSync('verification/seo-expansion-http.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,results:undefined}));
