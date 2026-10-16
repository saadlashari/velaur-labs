// Render the repository-native brand vector; no external image service required.
const fs=require('node:fs');const sharp=require('sharp');
async function main(){
 const icon=await sharp(fs.readFileSync('public/brand/symbol.svg')).resize(240,180,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
 const canvas=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#080c17"/><stop offset="1" stop-color="#162650"/></linearGradient></defs><rect width="1200" height="630" fill="url(#bg)"/><rect x="70" y="510" width="1060" height="2" fill="#5478ff" opacity=".5"/><text x="350" y="190" fill="#f5f7fc" font-family="Arial,sans-serif" font-size="66" font-weight="700" letter-spacing="5">VELAUR LABS</text><text x="90" y="330" fill="#ffffff" font-family="Arial,sans-serif" font-size="44" font-weight="600">Technology. Business. Digital Growth.</text><text x="90" y="404" fill="#bac7e6" font-family="Arial,sans-serif" font-size="28">Your remote partner for products, outreach &amp; marketing.</text><text x="90" y="560" fill="#a4b9ff" font-family="Arial,sans-serif" font-size="25">velaurlabs.com</text></svg>');
 await sharp(canvas).composite([{input:icon,left:80,top:70}]).png().toFile('public/brand/social-preview.png');
 console.log('Generated 1200x630 brand social preview.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
