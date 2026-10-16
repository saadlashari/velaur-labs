import fs from 'node:fs';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import sharp from 'sharp';
const base=process.env.VELAUR_TEST_BASE_URL||'http://127.0.0.1:3000';
const pages=JSON.parse(fs.readFileSync('data/seo-pages.json','utf8'));
const records=[];
for(const page of pages){
 const response=await fetch(base+page.path);assert.equal(response.status,200,page.path);
 const dom=new JSDOM(await response.text()),doc=dom.window.document;
 const og=doc.querySelector('meta[property="og:image"]')?.content;
 const twitter=doc.querySelector('meta[name="twitter:image"]')?.content;
 const alt=doc.querySelector('meta[property="og:image:alt"]')?.content;
 assert.equal(og,'https://velaurlabs.com/brand/social-preview-premium.png',page.path+' published default sharing image');
 assert.equal(twitter,og,page.path+' consistent sharing platforms');
 assert(alt.includes('Your Digital Partner'),page.path+' approved wording');
 assert.equal(doc.querySelector('meta[name="twitter:image:alt"]')?.content,alt,page.path+' accessible Twitter image');
 assert.equal(doc.querySelector('meta[property="og:image:width"]')?.content,'1200');
 assert.equal(doc.querySelector('meta[property="og:image:height"]')?.content,'630');
 assert.equal(doc.querySelectorAll('h1').length,1,page.path+' H1 preservation');
 records.push({path:page.path,og,twitter,alt});dom.window.close();
}
const response=await fetch(base+'/brand/social-preview-premium.png');assert.equal(response.status,200);assert(response.headers.get('content-type').includes('image/png'));
const bytes=Buffer.from(await response.arrayBuffer());assert(bytes.equals(fs.readFileSync('public/brand/social-preview-premium.png')));assert(bytes.length<200000);
const meta=await sharp(bytes).metadata();assert.equal(meta.width,1200);assert.equal(meta.height,630);
const result={completedAt:new Date().toISOString(),passed:true,pages:records.length,image:{width:meta.width,height:meta.height,bytes:bytes.length,format:meta.format},records,limits:'Local production metadata and public image delivery checked. No message sent through WhatsApp/LinkedIn; platform cache refresh and production deployment not performed.'};
fs.writeFileSync('verification/sharing-image-http.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,records:undefined}));
