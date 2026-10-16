import fs from 'node:fs';
const file=new URL('../data/portfolio.json',import.meta.url),records=JSON.parse(fs.readFileSync(file,'utf8'));
const results=[];
for(const project of records){
 for(const field of ['live_url','app_store_url','play_store_url']){
  const url=project[field];if(!url)continue;
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(12000)});
   await response.body?.cancel();
   const final=new URL(response.url);
   results.push({project:project.title,field,url,status:response.status,finalOrigin:final.origin,finalPath:final.pathname});
   project.link_checks=project.link_checks||{};project.link_checks[field]={status:response.status};
   if(response.status===404||response.status===410){project.content.unavailable_link_fields=project.content.unavailable_link_fields||[];if(!project.content.unavailable_link_fields.includes(field))project.content.unavailable_link_fields.push(field);}
  }catch(error){results.push({project:project.title,field,url,status:'unverified',error:error.name});}
 }
}
fs.writeFileSync(file,JSON.stringify(records,null,2)+'\n');
fs.writeFileSync(new URL('../data/portfolio-link-verification.json',import.meta.url),JSON.stringify({checkedAt:new Date().toISOString(),results},null,2)+'\n');
console.log(JSON.stringify({checked:results.length,successful:results.filter(x=>x.status>=200&&x.status<400).length,removed:results.filter(x=>[404,410].includes(x.status)).map(x=>({project:x.project,field:x.field})),unverified:results.filter(x=>typeof x.status!=='number'||x.status>=400)}));
