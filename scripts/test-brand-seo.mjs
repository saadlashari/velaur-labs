import assert from 'node:assert/strict';
import fs from 'node:fs';
import Module from 'node:module';
import ts from 'typescript';

const compiled=ts.transpileModule(fs.readFileSync('lib/brand-seo.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const testModule=new Module('brand-seo-test');testModule._compile(compiled,'brand-seo-test.cjs');
const changedProfile='https://www.facebook.com/velaurlabs-updated/';
const graph=testModule.exports.brandStructuredData({facebook_url:changedProfile,instagram_url:'https://www.instagram.com/',linkedin_url:'javascript:alert(1)'})['@graph'];
assert.deepEqual(graph[1].sameAs,[changedProfile],'schema follows published admin settings and excludes roots/invalid URLs');
assert.equal(graph[0].name,'VELAUR LABS');
assert.equal(graph[1].logo.url,'https://velaurlabs.com/favicon-512.png');
const checks=[];
const base=process.env.QA_BASE_URL||'http://127.0.0.1:3000';
for(const [path,canonical] of [['/','https://velaurlabs.com/'],['/work','https://velaurlabs.com/work'],['/services/web-development','https://velaurlabs.com/services/web-development']]){
  const response=await fetch(base+path);assert.equal(response.status,200,path);
  const html=await response.text();const renderedCanonical=html.match(/rel="canonical" href="([^"]+)"/)?.[1];assert(renderedCanonical&&new URL(renderedCanonical).href===new URL(canonical).href,path+' canonical');
  assert(html.includes('href="/favicon-512.png"'),path+' stable favicon link');
  if(path==='/'){
    const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match=>JSON.parse(match[1]));
    const brand=schemas.find(item=>item['@graph']?.some(node=>node['@type']==='WebSite'));
    assert(brand,'homepage brand schema');assert(brand['@graph'].some(item=>item['@type']==='Organization'));
    assert(!JSON.stringify(brand).includes('www.youtube.com'),'placeholder excluded');
    assert(!JSON.stringify(brand).includes('www.pinterest.com'),'placeholder excluded');
  }
  if(path==='/work'){
    assert(!html.includes('Explore 8 services'),'ambiguous total removed');
    for(const count of [8,6,7])assert(new RegExp(`<span data-nosnippet="(?:true)?">${count}(?:<!-- -->)? services in this group</span>`).test(html),'group count '+count);
  }
  checks.push({path,status:response.status,canonical,passed:true});
}
const response=await fetch(base+'/favicon-512.png');assert.equal(response.status,200);assert(response.headers.get('content-type').includes('image/png'));
const png=Buffer.from(await response.arrayBuffer());assert.equal(png.readUInt32BE(16),512);assert.equal(png.readUInt32BE(20),512);
checks.push({path:'/favicon-512.png',status:response.status,width:512,height:512,passed:true});
fs.writeFileSync('verification/seo-branding.json',JSON.stringify({completedAt:new Date().toISOString(),passed:true,checks,adminProfilePropagation:true},null,2));
console.log('PASS: brand schema, admin profile propagation, canonical URLs, service group snippets and 512px favicon.');
