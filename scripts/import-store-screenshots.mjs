// Recover genuine screenshots from the approved apps' primary App Store listings.
import fs from 'node:fs';import {createHash} from 'node:crypto';
const manifest=new URL('../data/portfolio.json',import.meta.url),records=JSON.parse(fs.readFileSync(manifest,'utf8'));
const out=new URL('../public/project-media/',import.meta.url);fs.mkdirSync(out,{recursive:true});
let imported=0;const failures=[];
for(const project of records.filter(p=>p.app_store_url&&!p.content.gallery.length&&!p.app_store_url.includes('/developer/'))){
 try{
  const page=await fetch(project.app_store_url,{signal:AbortSignal.timeout(15000)});if(!page.ok)throw Error('Listing HTTP '+page.status);
  const html=await page.text();const templates=[...html.matchAll(/"screenshot":\{"\$kind":"Artwork","crop":"bb","template":"([^"]+)"/g)].map(m=>m[1]);
  const unique=[...new Set(templates)].slice(0,3);if(!unique.length)throw Error('No screenshot metadata found');
  const gallery=[],sources=[];
  for(const [index,template] of unique.entries()){
   const remote=template.replace('{w}','600').replace('{h}','1200').replace('{c}','bb').replace('{f}','webp');
   if(!/^https:\/\/is\d+-ssl\.mzstatic\.com\/image\/thumb\//.test(remote))throw Error('Unexpected artwork host');
   const image=await fetch(remote,{signal:AbortSignal.timeout(15000)});if(!image.ok||!image.headers.get('content-type')?.startsWith('image/'))throw Error('Screenshot download failed');
   const bytes=Buffer.from(await image.arrayBuffer());if(bytes.length>8*1024*1024)throw Error('Screenshot exceeds asset limit');
   const name=project.slug+'-'+(index+1)+'.webp';fs.writeFileSync(new URL(name,out),bytes);
   gallery.push({url:'/project-media/'+name,alt:project.title+' — App Store screenshot '+(index+1),caption:'App Store screenshot'});
   sources.push({file:name,listing:project.app_store_url,url:remote,sha256:createHash('sha256').update(bytes).digest('hex')});imported++;
  }
  project.content.gallery=gallery;project.media_sources=sources;project.media_status=gallery.length+' genuine App Store screenshots';
 }catch(error){failures.push({project:project.title,error:error.message});}
}
fs.writeFileSync(manifest,JSON.stringify(records,null,2)+'\n');console.log(JSON.stringify({downloadedScreenshots:imported,projectsWithScreenshots:records.filter(p=>p.content.gallery.length).length,failures}));
