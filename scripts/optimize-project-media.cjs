// Keep originals for rollback and existing saved URLs; render smaller WebP variants via a manifest.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
async function main(){
 const dir='public/project-media',manifest={},files=fs.readdirSync(dir).filter(name=>/\.(png|jpe?g|webp)$/i.test(name)&&!name.endsWith('-optimized.webp'));
 for(const name of files){
  const source=path.join(dir,name),output=name.replace(/\.[^.]+$/,'')+'-optimized.webp';
  const original=await sharp(source).metadata();let width=Math.min(original.width,1600),quality=80,buffer;
  for(let attempt=0;attempt<15;attempt++){
   buffer=await sharp(source).rotate().resize({width,withoutEnlargement:true}).webp({quality,effort:6}).toBuffer();
   if(buffer.length<=50000)break;
   if(quality>58)quality-=6;else width=Math.round(width*.85);
  }
  const meta=await sharp(buffer).metadata();fs.writeFileSync(path.join(dir,output),buffer);
  manifest['/project-media/'+name]={url:'/project-media/'+output,width:meta.width,height:meta.height,bytes:buffer.length,originalBytes:fs.statSync(source).size};
 }
 fs.writeFileSync('data/optimized-media.json',JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify({images:Object.keys(manifest).length,originalBytes:Object.values(manifest).reduce((s,v)=>s+v.originalBytes,0),optimizedBytes:Object.values(manifest).reduce((s,v)=>s+v.bytes,0),maxBytes:Math.max(...Object.values(manifest).map(v=>v.bytes))}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
