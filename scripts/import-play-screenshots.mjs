import fs from 'node:fs';import {createHash} from 'node:crypto';
const file=new URL('../data/portfolio.json',import.meta.url),records=JSON.parse(fs.readFileSync(file,'utf8'));
const out=new URL('../public/project-media/',import.meta.url);fs.mkdirSync(out,{recursive:true});let count=0;const failures=[];
for(const project of records.filter(p=>p.play_store_url&&!p.content.gallery.length)){
 try{
  const page=await fetch(project.play_store_url+'&hl=en',{signal:AbortSignal.timeout(15000)});if(!page.ok)throw Error('Listing HTTP '+page.status);
  const html=await page.text();const tags=[...html.matchAll(/<img\b[^>]*alt="Screenshot image"[^>]*>/g)].map(x=>x[0]);
  const urls=[...new Set(tags.map(tag=>tag.match(/src="([^"]+)"/)?.[1]).filter(Boolean))].slice(0,3);
  if(!urls.length)throw Error('No screenshot markup found');
  for(const [index,url] of urls.entries()){
   if(!url.startsWith('https://play-lh.googleusercontent.com/'))throw Error('Unexpected media host');
   const response=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw Error('Image unavailable');
   const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>8*1024*1024)throw Error('Image too large');
   const mime=response.headers.get('content-type');const extension=mime.includes('png')?'png':mime.includes('webp')?'webp':'jpg';const name=project.slug+'-play-'+(index+1)+'.'+extension;
   fs.writeFileSync(new URL(name,out),bytes);project.content.gallery.push({url:'/project-media/'+name,alt:project.title+' — Google Play screenshot '+(index+1),caption:'Google Play screenshot'});
   project.media_sources=project.media_sources||[];project.media_sources.push({file:name,listing:project.play_store_url,url,sha256:createHash('sha256').update(bytes).digest('hex')});count++;
  }project.media_status=project.content.gallery.length+' genuine Google Play screenshots';
 }catch(error){failures.push({project:project.title,error:error.message});}
}
fs.writeFileSync(file,JSON.stringify(records,null,2)+'\n');console.log(JSON.stringify({screenshotsAdded:count,projectsWithScreenshots:records.filter(p=>p.content.gallery.length).length,failures}));
