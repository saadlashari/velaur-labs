// Capture public landing pages only. No authentication, cookies or private database data is sent.
import fs from 'node:fs';import {createHash} from 'node:crypto';
const catalog=JSON.parse(fs.readFileSync(new URL('../data/portfolio.json',import.meta.url),'utf8'));
const directory=new URL('../../website-screenshots/',import.meta.url);fs.mkdirSync(directory,{recursive:true});
const pending=[];const captured=[];let next=0;
const projects=catalog.filter(p=>p.live_url);
async function worker(){while(next<projects.length){const project=projects[next++];try{
 const url='https://s.wordpress.com/mshots/v1/'+encodeURIComponent(project.live_url)+'?w=1280&h=900';
 const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
 if(!response.ok||response.url.includes('/default')||!response.headers.get('content-type')?.startsWith('image/')){pending.push({slug:project.slug,status:response.status,state:'not ready'});await response.body?.cancel();continue;}
 const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>8*1024*1024)throw Error('Image exceeds limit');
 const extension=response.headers.get('content-type').includes('png')?'png':response.headers.get('content-type').includes('webp')?'webp':'jpg';const filename=project.slug+'.'+extension;
 fs.writeFileSync(new URL(filename,directory),bytes);captured.push({slug:project.slug,title:project.title,file:filename,source:project.live_url,screenshotProvider:'Automattic mShots',sha256:createHash('sha256').update(bytes).digest('hex')});
 }catch(error){pending.push({slug:project.slug,state:error.name});}}}
await Promise.all([worker(),worker(),worker()]);
fs.writeFileSync(new URL('capture-results.json',directory),JSON.stringify({captured,pending},null,2));console.log(JSON.stringify({captured:captured.length,pending}));
