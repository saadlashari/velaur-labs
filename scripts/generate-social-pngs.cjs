const fs=require('node:fs/promises');const sharp=require('sharp');
const root='public/social-icons/';
async function main(){
 for(const name of ['instagram','whatsapp'])await sharp(await fs.readFile(root+name+'-full.svg')).resize(96,96,{fit:'contain',background:'#00000000'}).png().toFile(root+name+'.png');
 const colors={facebook:'#0866ff',linkedin:'#0a66c2',youtube:'#ff0000',pinterest:'#e60023',tiktok:'#000000'};
 for(const [name,color] of Object.entries(colors)){
  const raw=await fs.readFile(root+name+'.svg','utf8');const view=raw.match(/viewBox="([^"]+)"/)[1];const path=raw.slice(raw.indexOf('>')+1,raw.lastIndexOf('</svg>'));
  const underlay=name==='linkedin'?'<rect x="0" y="0" width="16" height="16" rx="2" fill="white"/>':name==='youtube'?'<rect x="8" y="8" width="8" height="8" fill="white"/>':name==='tiktok'?'':'<circle cx="12" cy="12" r="11.8" fill="white"/>';
  const art=name==='tiktok'?`<g fill="#25f4ee" transform="translate(-.7,-.5)">${path}</g><g fill="#fe2c55" transform="translate(.7,.5)">${path}</g><g fill="${color}">${path}</g>`:`${underlay}<g fill="${color}">${path}</g>`;
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" width="96" height="96">${art}</svg>`)).png().toFile(root+name+'.png');
 }
 console.log('Seven full-color transparent brand PNGs generated at 96px.');
}main().catch(error=>{console.error(error);process.exitCode=1;});
