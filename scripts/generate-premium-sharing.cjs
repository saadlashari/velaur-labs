// Composite the exact original website logo assets without redrawing/recoloring them.
const fs=require('node:fs'),sharp=require('sharp');
async function main(){
 const symbol=await sharp('public/velaur-symbol-transparent.png').resize({width:72}).png().toBuffer();
 const wordmark=await sharp('public/velaur-wordmark-transparent.png').resize({width:264}).png().toBuffer();
 const emblem=await sharp('public/velaur-symbol-transparent.png').resize({width:250}).png().toBuffer();
 const canvas=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
 <defs>
  <linearGradient id="bg" x2="1" y2="1"><stop stop-color="#080c17"/><stop offset="1" stop-color="#131d38"/></linearGradient>
  <radialGradient id="glow"><stop stop-color="#4966cf" stop-opacity=".27"/><stop offset="1" stop-color="#4966cf" stop-opacity="0"/></radialGradient>
  <linearGradient id="accent"><stop stop-color="#00d5e7"/><stop offset=".5" stop-color="#5478ff"/><stop offset="1" stop-color="#ba67ed"/></linearGradient>
  <linearGradient id="glass" x2="1" y2="1"><stop stop-color="#263759" stop-opacity=".8"/><stop offset="1" stop-color="#121a2f" stop-opacity=".7"/></linearGradient>
 </defs>
 <rect width="1200" height="630" fill="url(#bg)"/><ellipse cx="970" cy="280" rx="370" ry="340" fill="url(#glow)"/>
 <rect x="24.5" y="24.5" width="1151" height="581" rx="20" stroke="#b6c8fa" stroke-opacity=".13" fill="none"/>
 <path d="M690 80v385M780 80v385M870 80v385M960 80v385M1050 80v385M690 140h430M690 230h430M690 320h430M690 410h430" stroke="#9aafff" stroke-opacity=".045"/>
 <text x="1128" y="84" text-anchor="end" font-family="Arial,sans-serif" font-size="11" letter-spacing="2.2" fill="#b9c5df">YOUR DIGITAL PARTNER</text>
 <circle cx="1013" cy="108" r="3" fill="#42d5c3"/><text x="1128" y="112" text-anchor="end" font-family="Arial,sans-serif" font-size="11" letter-spacing="1.3" fill="#899abf">WORLDWIDE</text>
 <rect x="72" y="182" width="46" height="3" rx="1.5" fill="url(#accent)"/>
 <text x="72" y="272" font-family="Arial,sans-serif" font-size="65" font-weight="700" letter-spacing="-2.1" fill="#f6f8ff">Where Creativity</text>
 <text x="72" y="350" font-family="Arial,sans-serif" font-size="65" font-weight="700" letter-spacing="-2.1" fill="#f6f8ff">Meets Technology.</text>
 <text x="75" y="402" font-family="Arial,sans-serif" font-size="21" fill="#aab9d6">Technology, business development and digital growth.</text>
 <text x="75" y="435" font-family="Arial,sans-serif" font-size="21" fill="#aab9d6">One connected team. Built around your business.</text>
 <g transform="rotate(-9 930 300)"><rect x="773" y="178" width="326" height="262" rx="29" stroke="#7f99ed" stroke-opacity=".14" fill="#0b1225"/><rect x="750" y="158" width="326" height="262" rx="29" stroke="#b9cafa" stroke-opacity=".26" fill="url(#glass)"/><path d="M777 185h75" stroke="url(#accent)" stroke-width="3" stroke-linecap="round"/><circle cx="1048" cy="186" r="3" fill="#8aa2e0"/></g>
 <path d="M72 502h1056" stroke="#879bc4" stroke-opacity=".22"/>
 <text x="74" y="551" font-family="Arial,sans-serif" font-size="11" letter-spacing="1.7" fill="#899abf">BUILD WITH INTENTION</text>
 <text x="74" y="578" font-family="Arial,sans-serif" font-size="15" fill="#e4eafa">Technology · Business · Growth</text>
 <text x="1128" y="569" text-anchor="end" font-family="Arial,sans-serif" font-size="21" fill="#e4eafa">velaurlabs.com</text>
 </svg>`);
 const output='public/brand/social-preview-premium.png';
 await sharp(canvas).composite([{input:symbol,left:72,top:77},{input:wordmark,left:164,top:68},{input:emblem,left:802,top:218}]).png({compressionLevel:9}).toFile(output);
 const meta=await sharp(output).metadata();console.log(JSON.stringify({output,width:meta.width,height:meta.height,bytes:fs.statSync(output).size,logoSources:['velaur-symbol-transparent.png','velaur-wordmark-transparent.png']}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
