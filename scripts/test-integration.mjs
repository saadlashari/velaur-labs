import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module,{createRequire} from 'node:module';
import ts from 'typescript';
import {PGlite} from '@electric-sql/pglite';
const require=createRequire(import.meta.url);
const root=process.cwd(), engine=new PGlite();
await engine.exec(fs.readFileSync('db/schema.sql','utf8').replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;',''));
const query=async(sql,args=[])=>{const r=await engine.query(sql,args);return {...r,rowCount:r.rows.length||r.affectedRows||0};};
const database={query,connect:async()=>({query,release(){}})};
const jar=new Map();
const cookies=async()=>({get:key=>jar.has(key)?{value:jar.get(key)}:undefined,set:(key,value)=>jar.set(key,value)});
const cache=new Map();
function load(relative){
 const file=path.resolve(root,relative);if(cache.has(file))return cache.get(file).exports;
 const m=new Module(file);cache.set(file,m);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));
 m.require=id=>{
  if(id==='@/lib/db'||(id==='./db'&&file.includes(path.sep+'lib'+path.sep)))return {db:database,isDatabaseConfigured:()=>true};
  if(id==='next/headers')return {cookies};
  if(id.startsWith('@/'))return id.endsWith('.json')?require(path.resolve(root,id.slice(2))):load(id.slice(2)+(fs.existsSync(path.resolve(root,id.slice(2)+'.ts'))?'.ts':'.tsx'));
  if(id.startsWith('.')){const target=path.resolve(path.dirname(file),id);if(fs.existsSync(target+'.ts'))return load(target+'.ts');if(fs.existsSync(target+'.tsx'))return load(target+'.tsx');}
  return require(id);
 };
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 m._compile(code,file);return m.exports;
}
const {NextRequest}=require('next/server');
process.env.APP_URL='http://localhost:3000';process.env.AUTH_SECRET='test-only-auth-secret-'.repeat(4);process.env.BOOTSTRAP_SECRET='test-only-bootstrap';
const req=(url,method='POST',body={},origin='http://localhost:3000')=>new NextRequest('http://localhost:3000'+url,{method,headers:{origin,'Content-Type':'application/json','x-bootstrap-secret':process.env.BOOTSTRAP_SECRET},...(method==='GET'?{}:{body:JSON.stringify(body)})});
let tests=0;const check=(actual,expected,label)=>{assert.equal(actual,expected,label);tests++;console.log('PASS '+label);};
try{
 const auth=load('lib/auth.ts');
 const password='Local-test-password-123!';
 const bootstrap=load('app/api/auth/bootstrap/route.ts');
 const created=await bootstrap.POST(req('/api/auth/bootstrap','POST',{email:'owner@example.test',displayName:'Owner',password}));
 check(created.status,201,'initial administrator bootstrap');const setup=await created.json();
 check((await bootstrap.POST(req('/api/auth/bootstrap','POST',{email:'other@example.test',displayName:'Other',password}))).status,409,'bootstrap cannot create a second administrator');
 const login=load('app/api/auth/login/route.ts');
 const originGuard=load('lib/request-security.ts');
 const localAppUrl=process.env.APP_URL;
 try {
  const aliases=['https://velaurlabs.com','https://www.velaurlabs.com','https://velaurlabs.netlify.app'];
  for(const primary of aliases){
   process.env.APP_URL=primary;
   for(const origin of aliases){
    const request=new NextRequest(origin+'/api/auth/login',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:'{}'});
    check((await login.POST(request)).status,400,`same-app alias reaches login validation: ${primary} -> ${origin}`);
   }
  }
  process.env.APP_URL='https://velaurlabs.netlify.app';
  for(const origin of ['https://foreign.example','https://velaurlabs.com.evil.test','https://evil.velaurlabs.com','https://other.netlify.app','https://deploy-preview-1--velaurlabs.netlify.app','http://velaurlabs.com','https://velaurlabs.com:444','https://user@velaurlabs.com','https://velaurlabs.com/path','https://velaurlabs.com?query=1','https://velaurlabs.com#fragment','null','javascript:alert(1)','not-a-url','https://velaurlabs.com, https://foreign.example']){
   const request=new NextRequest('https://velaurlabs.com/api/auth/login',{method:'POST',headers:{origin,host:'velaurlabs.com','x-forwarded-host':'velaurlabs.com','x-forwarded-proto':'https'},body:'{}'});
   check((await login.POST(request)).status,403,`untrusted/malformed origin remains blocked: ${origin}`);
  }
  check(originGuard.hasValidOrigin(new NextRequest('https://velaurlabs.com/api/auth/login',{method:'POST'})),false,'missing Origin remains blocked');
  delete process.env.APP_URL;
  check(originGuard.hasValidOrigin(req('/api/auth/login','POST',{},'https://velaurlabs.com')),false,'missing APP_URL fails closed even for known aliases');
  process.env.APP_URL='not-a-url';
  check(originGuard.hasValidOrigin(req('/api/auth/login','POST',{},'https://velaurlabs.com')),false,'invalid APP_URL fails closed');
  process.env.APP_URL='https://unrelated.example';
  check(originGuard.hasValidOrigin(req('/api/auth/login','POST',{},'https://velaurlabs.com')),false,'VELAUR aliases are disabled for a different deployment');
  check(originGuard.hasValidOrigin(req('/api/auth/login','POST',{},'https://unrelated.example')),true,'other deployments retain their exact configured origin');
  process.env.APP_URL=localAppUrl;
  check(originGuard.hasValidOrigin(req('/api/auth/login','POST',{},'https://velaurlabs.com')),false,'localhost does not implicitly trust production origins');
 } finally { process.env.APP_URL=localAppUrl; }
 check((await login.POST(req('/api/auth/login','POST',{email:'owner@example.test',password}))).status,403,'super admin cannot bypass 2FA enrollment');
 const twoFactor=load('app/api/auth/setup-2fa/route.ts');
 // Discover the current six-digit TOTP using the same RFC counter encoding, independently from verifyTotp.
 const {createHmac}=await import('node:crypto');
 const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits='';for(const c of setup.totpSecret)bits+=chars.indexOf(c).toString(2).padStart(5,'0');
 const secret=Buffer.from(bits.match(/.{8}/g).map(x=>parseInt(x,2)));
 const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));
 const digest=createHmac('sha1',secret).update(counter).digest();const offset=digest[19]&15;const code=String((digest.readUInt32BE(offset)&0x7fffffff)%1000000).padStart(6,'0');
 const enabled=await twoFactor.POST(req('/api/auth/setup-2fa','POST',{email:'owner@example.test',code}));
 check(enabled.status,200,'TOTP enrollment transaction');const recovery=await enabled.json();check(recovery.recoveryCodes.length,10,'ten recovery codes returned once');
 check((await login.POST(req('/api/auth/login','POST',{email:'owner@example.test',password,code},'https://foreign.example'))).status,403,'foreign-origin login rejected');
 check((await login.POST(req('/api/auth/login','POST',{email:{bad:true},password}))).status,400,'malformed login fields rejected');
 check((await login.POST(req('/api/auth/login','POST',{email:'owner@example.test',password,code}))).status,200,'password and TOTP sign-in');
 check((await login.POST(req('/api/auth/login','POST',{email:'owner@example.test',password,code}))).status,401,'TOTP replay rejected');
 check((await login.POST(req('/api/auth/login','POST',{email:'owner@example.test',password,code:recovery.recoveryCodes[0]}))).status,200,'recovery-code sign-in');
 check((await login.POST(req('/api/auth/login','POST',{email:'owner@example.test',password,code:recovery.recoveryCodes[0]}))).status,401,'recovery code cannot be reused');
 try {
  process.env.APP_URL='https://velaurlabs.netlify.app';
  const customLogin=new NextRequest('https://velaurlabs.com/api/auth/login',{method:'POST',headers:{origin:'https://velaurlabs.com','Content-Type':'application/json'},body:JSON.stringify({email:'owner@example.test',password,code:recovery.recoveryCodes[1]})});
  check((await login.POST(customLogin)).status,200,'custom-domain password and recovery-code sign-in works with Netlify APP_URL');
  const customPages=load('app/api/admin/pages/route.ts');
  check((await customPages.POST(req('/api/admin/pages','POST',{},'https://velaurlabs.com'))).status,400,'authenticated custom-domain CMS request reaches field validation');
  check((await customPages.POST(req('/api/admin/pages','POST',{},'https://foreign.example'))).status,403,'authenticated foreign-origin CMS request remains blocked');
 } finally { process.env.APP_URL=localAppUrl; }
 const pages=load('app/api/admin/pages/route.ts');
 const pageResponse=await pages.POST(req('/api/admin/pages','POST',{title:'Integration test',slug:'integration-test'}));check(pageResponse.status,201,'page creation');
 let page=(await pageResponse.json()).item;page.updated_at=new Date(page.updated_at).toISOString();
 const save=load('app/api/admin/pages/[id]/save/route.ts');const params={params:Promise.resolve({id:page.id})};
 const section={section_key:'hero',section_type:'HERO',is_visible:true,content:{heading:'Published heading',text:'Public content'},settings:{}};
 let result=await save.PUT(req('/api/admin/pages/'+page.id+'/save','PUT',{page:{...page,status:'PUBLISHED'},sections:[section]}),params);
 check(result.status,200,'atomic page publication');const version=(await result.json()).updated_at;page={...page,status:'PUBLISHED',updated_at:version};
 result=await save.PUT(req('/api/admin/pages/'+page.id+'/save','PUT',{page,sections:[{...section,content:{heading:'Private draft'}}],mode:'draft'}),params);
 check(result.status,200,'isolated draft save');page.updated_at=(await result.json()).updated_at;
 const publicPage=load('lib/page-builder.ts');check((await publicPage.getPublicPage('integration-test')).sections[0].content.heading,'Published heading','autosave leaves public content unchanged');
 check((await save.PUT(req('/api/admin/pages/'+page.id+'/save','PUT',{page:{...page,updated_at:version},sections:[section],mode:'draft'}),params)).status,409,'stale save conflicts instead of overwriting');
 check((await save.PUT(req('/api/admin/pages/'+page.id+'/save','PUT',{page,sections:[section,section]}),params)).status,400,'duplicate section keys rejected');
 check((await save.PUT(req('/api/admin/pages/'+page.id+'/save','PUT',{page,sections:[{...section,content:{href:'javascript:alert(1)'}}]}),params)).status,400,'unsafe links rejected');
 const backups=load('app/api/admin/backups/route.ts');const exported=await backups.POST(req('/api/admin/backups','POST',{confirmation:'EXPORT'}));check(exported.status,200,'snapshot content export');
 const document=await exported.json();check(document.tables.global_settings.some(row=>row.setting_key.startsWith('admin_2fa_')||row.setting_key.startsWith('security_')),false,'security settings excluded from content export');
 const {validateExport}=await import('./verify-content-export.mjs');check(validateExport(document).valid,true,'export checksums and counts verified');
 const restore=load('app/api/admin/pages/[id]/revisions/restore/route.ts');
 check((await restore.POST(req('/api/admin/pages/'+page.id+'/revisions/restore','POST',{revision_number:2}),params)).status,200,'restore creates a draft');
 check((await publicPage.getPublicPage('integration-test')).sections[0].content.heading,'Published heading','restoring a revision leaves live content unchanged');
 page.updated_at=new Date((await query('SELECT updated_at FROM pages WHERE id=$1',[page.id])).rows[0].updated_at).toISOString();
 const reviewSection={...section,content:{heading:'Reviewed heading'}};
 result=await save.PUT(req('/api/admin/pages/'+page.id+'/save','PUT',{page:{...page,status:'IN_REVIEW'},sections:[reviewSection],mode:'draft'}),params);
 check(result.status,200,'prepare isolated draft for review');page.updated_at=(await result.json()).updated_at;
 const approvals=load('app/api/admin/approvals/route.ts');
 check((await approvals.POST(req('/api/admin/approvals','POST',{entity_type:'pages',entity_id:page.id}))).status,201,'submit isolated page draft for approval');
 let approval=(await query("SELECT id FROM content_approvals WHERE status='PENDING'")).rows[0].id;
 result=await save.PUT(req('/api/admin/pages/'+page.id+'/save','PUT',{page:{...page,status:'IN_REVIEW'},sections:[reviewSection],mode:'draft'}),params);page.updated_at=(await result.json()).updated_at;
 check((await approvals.PATCH(req('/api/admin/approvals','PATCH',{id:approval,decision:'APPROVED',note:'Review'}))).status,409,'review cannot publish changes made after submission');
 check((await approvals.POST(req('/api/admin/approvals','POST',{entity_type:'pages',entity_id:page.id}))).status,201,'stale review can be resubmitted');
 approval=(await query("SELECT id FROM content_approvals WHERE status='PENDING'")).rows[0].id;
 check((await approvals.PATCH(req('/api/admin/approvals','PATCH',{id:approval,decision:'APPROVED',note:'Review'}))).status,200,'approval publishes the reviewed draft atomically');
 check((await publicPage.getPublicPage('integration-test')).sections[0].content.heading,'Reviewed heading','approved draft becomes public');
 page.updated_at=new Date((await query('SELECT updated_at FROM pages WHERE id=$1',[page.id])).rows[0].updated_at).toISOString();
 const inquiries=load('app/api/inquiries/route.ts');
 const inquiry={name:'Test Visitor',email:'visitor@example.test',service:'Web Development',details:'Test inquiry from integration suite',consent:true};
 check((await inquiries.POST(req('/api/inquiries','POST',inquiry))).status,201,'contact inquiry is saved with no email provider');
 check((await query("SELECT * FROM email_logs WHERE status='FAILED'")).rows.length,2,'unconfigured email delivery is recorded without losing inquiry');
 const options=load('lib/agency-navigation.ts').inquiryServiceOptions;
 for(const service of options){await query("DELETE FROM global_settings WHERE setting_key LIKE 'security_rate_inquiry-%'");check((await inquiries.POST(req('/api/inquiries','POST',{...inquiry,service,companyWebsite:'https://business.example.test'}))).status,201,'inquiry accepts '+service);}
 check((await query("SELECT details FROM inquiries WHERE service='B2B Lead Generation' LIMIT 1")).rows[0].details.includes('https://business.example.test'),true,'business website persists in inquiry details without a schema change');
 check((await inquiries.POST(req('/api/inquiries','POST',{...inquiry,companyWebsite:'javascript:alert(1)'}))).status,400,'unsafe business website rejected');
 check((await inquiries.POST(req('/api/inquiries','POST',{...inquiry,website:'spam'}))).status,400,'honeypot does not report false success');
 check((await inquiries.POST(req('/api/inquiries','POST',{...inquiry,consent:false}))).status,400,'contact requires consent');
 check((await inquiries.POST(req('/api/inquiries','POST',inquiry,'https://foreign.example'))).status,403,'foreign-origin contact rejected');
 const blocks=load('lib/builder-blocks.ts');
 check(blocks.validateBlocks([{id:'row',type:'CONTAINER',children:[{id:'text',type:'TEXT',text:'Safe text'}],style:{columns:2,mobileColumns:1}}]),null,'nested layout validates');
 check(Boolean(blocks.validateBlocks([{id:'image',type:'IMAGE',url:'https://example.test/image.png'}])),true,'layout images require alt text');
 const image=load('lib/image-validation.ts');
 check(await image.isRasterImage(new File(['<svg></svg>'],'disguised.png',{type:'image/png'})),false,'SVG disguised as PNG rejected');
 check(await image.isRasterImage(new File([new Uint8Array([137,80,78,71,13,10,26,10])],'header.png',{type:'image/png'})),true,'PNG signature recognized');
 // Exercise the real upload handlers, persistence and failure handling without real credentials.
 const profileUpload=load('app/api/admin/profile/route.ts'),mediaUpload=load('app/api/admin/media/route.ts');
 const savedFetch=globalThis.fetch,storageKeys=['CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET'];
 const savedStorage=storageKeys.map(key=>process.env[key]);
 const png=new File([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')],'avatar.png',{type:'image/png'});
 const uploadReq=(file=png,origin='http://localhost:3000')=>{const body=new FormData();body.set('file',file);body.set('alt_text','Test image');return new NextRequest('http://localhost:3000/api/admin/profile',{method:'POST',headers:{origin},body});};
 let providerCalls=0;
 try{
  process.env.CLOUDINARY_CLOUD_NAME=' test-cloud \n';process.env.CLOUDINARY_API_KEY=' test-key \n';process.env.CLOUDINARY_API_SECRET=' test-secret \n';
  const {createHash}=await import('node:crypto');
  globalThis.fetch=async(url,options)=>{providerCalls++;check(url,'https://api.cloudinary.com/v1_1/test-cloud/image/upload','storage cloud name trimmed');const form=options.body;check(form.get('api_key'),'test-key','storage API key trimmed');check(form.get('signature'),createHash('sha256').update(`folder=${form.get('folder')}&timestamp=${form.get('timestamp')}test-secret`).digest('hex'),'exact sorted SHA-256 signature uses trimmed secret');check(form.has('api_secret'),false,'storage secret never transmitted');return Response.json({secure_url:'https://res.cloudinary.com/test-cloud/image/upload/test.png',public_id:'test-image'});};
  check((await profileUpload.POST(uploadReq())).status,200,'profile image saves after provider success');
  const avatar=(await (await profileUpload.GET(req('/api/admin/profile','GET'))).json()).profile.avatar_url;
  check(avatar,'https://res.cloudinary.com/test-cloud/image/upload/test.png','uploaded profile URL persists');
  check((await mediaUpload.POST(uploadReq())).status,201,'media library uses shared signed upload');
  const mediaCount=(await query('SELECT count(*)::int AS count FROM media_assets')).rows[0].count;
  const rejections=[[401,'Invalid API key test-key',503,'STORAGE_CREDENTIALS_REJECTED'],[400,'Invalid Signature test-secret',503,'STORAGE_SIGNATURE_REJECTED'],[403,'Not allowed',503,'STORAGE_ACCESS_DENIED'],[429,'Rate limit',503,'STORAGE_LIMIT_REACHED'],[413,'File size too large',400,'STORAGE_FILE_TOO_LARGE'],[400,'Invalid image file',400,'STORAGE_IMAGE_REJECTED'],[500,'Internal error test-secret',502,'STORAGE_UPLOAD_FAILED']];
  for(const [status,message,expected,code] of rejections){globalThis.fetch=async()=>{providerCalls++;return Response.json({error:{message}},{status});};const response=await profileUpload.POST(uploadReq()),body=await response.json();check(response.status,expected,'provider rejection HTTP status '+code);check(body.code,code,'provider rejection safe code '+code);check(JSON.stringify(body).includes('test-secret')||JSON.stringify(body).includes('test-key'),false,'provider details remain private '+code);}
  for(const data of [{},{secure_url:'http://unsafe.test/image',public_id:'test'},{secure_url:'https://user:pass@unsafe.test/image',public_id:'test'}]){globalThis.fetch=async()=>Response.json(data);check((await profileUpload.POST(uploadReq())).status,502,'incomplete or unsafe storage success rejected');}
  globalThis.fetch=async()=>new Response('not JSON',{status:502});check((await profileUpload.POST(uploadReq())).status,502,'non-JSON provider failure handled');
  for(const [name,status,code] of [['TimeoutError',504,'STORAGE_TIMEOUT'],['TypeError',502,'STORAGE_UNREACHABLE']]){globalThis.fetch=async()=>{const error=new Error('private transport detail');error.name=name;throw error;};const response=await profileUpload.POST(uploadReq());check(response.status,status,'transport failure status '+name);check((await response.json()).code,code,'transport failure safe code '+name);}
  globalThis.fetch=async()=>{providerCalls++;return Response.json({error:{message:'Invalid Signature'}},{status:401});};
  check((await mediaUpload.POST(uploadReq())).status,503,'media provider rejection does not report success');check((await query('SELECT count(*)::int AS count FROM media_assets')).rows[0].count,mediaCount,'failed media upload never creates database asset');
  const before=providerCalls;
  check((await profileUpload.POST(uploadReq(png,'https://foreign.example'))).status,403,'foreign-origin profile upload blocked');
  check((await profileUpload.POST(uploadReq(new File(['<svg/>'],'fake.png',{type:'image/png'})))).status,400,'disguised avatar rejected before storage');
  check((await profileUpload.POST(uploadReq(new File([new Uint8Array(3*1024*1024+1)],'large.png',{type:'image/png'})))).status,400,'oversized avatar rejected before storage');
  delete process.env.CLOUDINARY_API_SECRET;check((await profileUpload.POST(uploadReq())).status,503,'missing storage configuration handled');
  check(providerCalls,before,'invalid requests never reach Cloudinary');
  check((await (await profileUpload.GET(req('/api/admin/profile','GET'))).json()).profile.avatar_url,avatar,'all rejected uploads preserve saved avatar');
 }finally{globalThis.fetch=savedFetch;storageKeys.forEach((key,index)=>{if(savedStorage[index]===undefined)delete process.env[key];else process.env[key]=savedStorage[index];});}
 const catalog=require(path.resolve('data/portfolio.json'));
 check(catalog.length,38,'approved catalog has exactly 38 entries');check(new Set(catalog.map(x=>x.slug)).size,38,'approved project URLs are unique');
 const portfolio=load('lib/public-content.ts');check((await portfolio.getPublishedProjects()).length,38,'approved catalog renders without seeded database projects');
 await query("INSERT INTO projects(slug,title,category,status) VALUES($1,$2,$3,'DRAFT')",[catalog[0].slug,catalog[0].title,catalog[0].category]);
 check(await portfolio.getPublishedProject(catalog[0].slug),null,'CMS draft overrides approved fallback and stays private');
 check((await portfolio.getPublishedProjects()).length,37,'draft override is excluded from public listing');
 const hiddenProjects=[catalog[0],catalog.find(item=>item.category==='WEB_APPLICATION'),catalog.find(item=>item.category==='MOBILE_APP')];
 for(const item of hiddenProjects.slice(1))await query("INSERT INTO projects(slug,title,category,status) VALUES($1,$2,$3,'ARCHIVED')",[item.slug,item.title,item.category]);
 const projectDetail=load('app/work/projects/[slug]/page.tsx').default;
 const liveSitemap=await load('app/sitemap.ts').default();
 for(const item of hiddenProjects){
  check((await portfolio.getPublishedProjects(item.category)).some(project=>project.slug===item.slug),false,'hidden project excluded from its public category: '+item.slug);
  await assert.rejects(()=>projectDetail({params:Promise.resolve({slug:item.slug})}));tests++;console.log('PASS hidden direct project page stays unavailable: '+item.slug);
  check(liveSitemap.some(entry=>entry.url.endsWith('/work/projects/'+item.slug)),false,'hidden project excluded from sitemap: '+item.slug);
 }
 for(const item of hiddenProjects.slice(1))await query('DELETE FROM projects WHERE slug=$1',[item.slug]);
 const overviewData=await (await load('app/api/admin/overview/route.ts').GET()).json();
 check(overviewData.projects,(await portfolio.getPublishedProjects()).length,'overview counts the same visible portfolio as the public website');
 check(overviewData.blogPosts,(await portfolio.getPublicArticles()).length,'overview includes visible original articles as well as saved articles');
 const contentApi=load('app/api/admin/content/[module]/route.ts'),defaults=load('lib/default-content.ts').defaultContent;
 const moduleParams=module=>({params:Promise.resolve({module})});
 const defaultServices=await (await contentApi.GET(req('/api/admin/content/services','GET'),moduleParams('services'))).json();check(defaultServices.items.filter(item=>item.is_default).length,21,'all existing and new service defaults appear in content library');
 let hiddenService=await contentApi.POST(req('/api/admin/content/services','POST',{...defaults('services')[0],status:'DRAFT'}),moduleParams('services'));check(hiddenService.status,201,'owner can hide original service without prior seeding');
 check((await portfolio.getPublicServices()).some(item=>item.slug==='ai-development'),false,'hidden default service stays hidden');
 const serviceDetail=load('app/services/[slug]/page.tsx').default;await assert.rejects(()=>serviceDetail({params:Promise.resolve({slug:'ai-development'})}));tests++;console.log('PASS hidden service detail cannot resurface fallback');
 const customService=await contentApi.POST(req('/api/admin/content/services','POST',{slug:'custom-support',title:'Custom Support',summary:'A custom published service.',category:'SOFTWARE',status:'PUBLISHED',content:{paragraphs:['Custom service content.']}}),moduleParams('services'));check(customService.status,201,'custom service creation');check((await portfolio.getPublicServices()).some(item=>item.slug==='custom-support'),true,'new service appears in public service listing');check(Boolean(await serviceDetail({params:Promise.resolve({slug:'custom-support'})})),true,'new custom service has a working detail page');
 const articleDefaults=defaults('blog');let hiddenArticle=await contentApi.POST(req('/api/admin/content/blog','POST',{...articleDefaults[0],status:'DRAFT'}),moduleParams('blog'));check(hiddenArticle.status,201,'owner can hide original article with its bundled image');const storedArticle=await hiddenArticle.json();check(await portfolio.getPublicArticle(articleDefaults[0].slug),null,'draft article overrides static fallback');check((await portfolio.getPublicArticles()).some(item=>item.slug===articleDefaults[0].slug),false,'hidden original article absent from public listing');
 let restoredArticle=await contentApi.PATCH(req('/api/admin/content/blog','PATCH',{id:storedArticle.item.id,expectedUpdatedAt:storedArticle.item.updated_at,data:{status:'PUBLISHED'}}),moduleParams('blog'));check(restoredArticle.status,200,'original article can be shown again');check(Boolean(await portfolio.getPublicArticle(articleDefaults[0].slug)),true,'restored original article is public');check((await contentApi.DELETE(req('/api/admin/content/blog','DELETE',{id:storedArticle.item.id}),moduleParams('blog'))).status,200,'original article moves to trash');check(await portfolio.getPublicArticle(articleDefaults[0].slug),null,'deleted original article does not reappear from fallback');
 const editorial=load('lib/article-editorial.ts');
 const approvedEditorial=editorial.articleEditorial({slug:articleDefaults[2].slug});
 check(editorial.validArticleEditorial(approvedEditorial),true,'bundled editorial notes validate');
 check((await contentApi.POST(req('/api/admin/content/blog','POST',{slug:'unsafe-editorial-source',title:'Rejected source',body:{editorial:{...approvedEditorial,sources:[{label:'Unsafe',url:'javascript:alert(1)'}]}}}),moduleParams('blog'))).status,400,'article source executable URL rejected');
 const editorialPost=await contentApi.POST(req('/api/admin/content/blog','POST',{slug:'editorial-publication-test',title:'Editorial publication test',excerpt:'Local test content',category:'Testing',status:'PUBLISHED',body:{sections:[{heading:'A real saved heading',text:'Actual persisted article body.'}],editorial:{...approvedEditorial,summary:'Owner-reviewed summary from the content editor.'}}}),moduleParams('blog'));
 check(editorialPost.status,201,'approved editorial content publishes through actual content API');
 const savedEditorial=await portfolio.getPublicArticle('editorial-publication-test');
 check(editorial.articleEditorial(savedEditorial).summary,'Owner-reviewed summary from the content editor.','public article reads saved editorial text rather than bundled defaults');
 check(editorial.articleEditorial(savedEditorial).sources[0].url,approvedEditorial.sources[0].url,'primary source survives database round trip');
 const backup=await engine.dumpDataDir();const restored=await PGlite.create({loadDataDir:backup});
 try{check((await restored.query('SELECT * FROM pages')).rows.length,1,'disposable PostgreSQL filesystem backup restores page data');check((await restored.query('SELECT * FROM admin_users')).rows.length,1,'disposable PostgreSQL backup restores authentication data');}finally{await restored.close();}
 const limiter=load('lib/request-security.ts');await Promise.all(Array.from({length:10},()=>limiter.consumeAttempt('test','account',10,900)));check((await limiter.consumeAttempt('test','account',10,900)).allowed,false,'database limiter rejects attempt eleven');
 const seoApi=load('app/api/admin/seo/route.ts');
 let seoState=await (await seoApi.GET(req('/api/admin/seo','GET'))).json();
 const seoSettings=load('lib/site-settings.ts');const seoResolver=load('lib/seo-catalog.ts');
 const seoOverride={'/services/upwork-profile-bidding-management':{title:'Upwork proposal support for remote agencies',description:'A verified test description for scoped Upwork profile and proposal support.',noIndex:true,headline:'Owner-approved Upwork support',answer:'A saved opening answer from the SEO workspace.',definition:'An approved definition.',takeaways:['A saved takeaway'],sections:[{heading:'Remote proposal review',body:'Owner-approved profile and proposal support with a clear remote review process.'}]}};
 const seoBody={settings:{seo_pages:JSON.stringify(seoOverride)},baseFingerprint:seoState.baseFingerprint,version:seoState.version,mode:'draft'};
 let seoResult=await seoApi.POST(req('/api/admin/seo','POST',seoBody));check(seoResult.status,200,'SEO draft saves independently');const seoVersion=(await seoResult.json()).version;
 check((await seoSettings.getSiteSettings()).seo_pages,'{}','SEO draft does not leak to public settings');
 check((await seoApi.POST(req('/api/admin/seo','POST',seoBody))).status,409,'SEO stale draft rejected');
 check((await seoApi.POST(req('/api/admin/seo','POST',{...seoBody,settings:{header_enabled:'false'}}))).status,400,'SEO endpoint cannot alter unrelated site settings');
 check((await seoApi.POST(req('/api/admin/seo','POST',{...seoBody,settings:{seo_pages:'{"/admin":{"title":"Wrong path"}}'}}))).status,400,'SEO endpoint rejects unknown routes');
 check((await seoApi.POST(req('/api/admin/seo','POST',seoBody,'https://foreign.example'))).status,403,'SEO foreign-origin save rejected');
 seoResult=await seoApi.POST(req('/api/admin/seo','POST',{...seoBody,version:seoVersion,mode:'publish'}));check(seoResult.status,200,'SEO publication succeeds atomically');
 check(seoResolver.resolveSeoPage('/services/upwork-profile-bidding-management',(await seoSettings.getSiteSettings()).seo_pages).title,seoOverride['/services/upwork-profile-bidding-management'].title,'published SEO title follows saved settings');
 check((await load('lib/seo.ts').getSeoPage('/services/upwork-profile-bidding-management')).headline,'Owner-approved Upwork support','published H1 follows SEO workspace');check((await load('lib/seo.ts').getSeoPage('/services/upwork-profile-bidding-management')).takeaways[0],'A saved takeaway','published takeaway survives draft and publish');
 const seoMeta=await load('lib/seo.ts').metadataForPath('/services/upwork-profile-bidding-management');check(seoMeta.robots.index,false,'SEO noindex applied to public metadata');
 check((await load('app/sitemap.ts').default()).some(item=>item.url.endsWith('/services/upwork-profile-bidding-management')),false,'SEO noindex removes URL from sitemap');
 seoState=await (await seoApi.GET(req('/api/admin/seo','GET'))).json();
 check((await seoApi.POST(req('/api/admin/seo','POST',{settings:{seo_pages:'{}'},baseFingerprint:seoState.baseFingerprint,version:seoState.version,mode:'publish'}))).status,200,'SEO defaults restored without changing original content');
 const sharingHelpers=load('lib/sharing-image.ts');
 check(sharingHelpers.validSharingImageUrl('javascript:alert(1)'),false,'sharing image rejects executable URL');
 check(sharingHelpers.validSharingImageUrl('http://images.example.test/card.png'),false,'sharing image requires HTTPS');
 check(sharingHelpers.validSharingImageUrl('https://user:secret@images.example.test/card.png'),false,'sharing image rejects URL credentials');
 check(sharingHelpers.validSharingImageUrl('//images.example.test/card.png'),false,'sharing image rejects protocol-relative URLs');
 check(sharingHelpers.sharingImage({social_image_url:'invalid'}).url,sharingHelpers.DEFAULT_SHARING_IMAGE,'invalid legacy image falls back to original premium card');
 seoState=await (await seoApi.GET(req('/api/admin/seo','GET'))).json();
 check(seoState.settings.social_image_url,sharingHelpers.DEFAULT_SHARING_IMAGE,'SEO editor receives published default sharing image');
 const originalAlt=seoState.settings.social_image_alt;
 const shareSettings={seo_pages:'{}',social_image_url:'https://images.example.test/approved-share.png',social_image_alt:'Approved custom sharing image'};
 check((await seoApi.POST(req('/api/admin/seo','POST',{mode:'draft',settings:{social_image_url:'http://bad.example/image.png'},baseFingerprint:seoState.baseFingerprint,version:seoState.version}))).status,400,'SEO API rejects insecure sharing image');
 let shareSave=await seoApi.POST(req('/api/admin/seo','POST',{mode:'draft',settings:shareSettings,baseFingerprint:seoState.baseFingerprint,version:seoState.version}));
 check(shareSave.status,200,'sharing image draft saves');const shareVersion=(await shareSave.json()).version;
 check((await seoSettings.getSiteSettings()).social_image_url,sharingHelpers.DEFAULT_SHARING_IMAGE,'image draft stays private');
 check((await (await seoApi.GET(req('/api/admin/seo','GET'))).json()).settings.social_image_url,shareSettings.social_image_url,'image draft reloads into editor');
 shareSave=await seoApi.POST(req('/api/admin/seo','POST',{mode:'publish',settings:shareSettings,baseFingerprint:seoState.baseFingerprint,version:shareVersion}));
 check(shareSave.status,200,'sharing image publishes through permission-checked API');
 for(const path of ['/','/services/upwork-profile-bidding-management','/work/projects/salesfox-website','/blog/ai-agents-vs-traditional-chatbots']){
  const meta=await load('lib/seo.ts').metadataForPath(path);
  check(meta.openGraph.images[0].url,shareSettings.social_image_url,'published Open Graph image '+path);
  check(meta.openGraph.images[0].alt,shareSettings.social_image_alt,'published image alt '+path);
  check(meta.twitter.images[0].url,shareSettings.social_image_url,'published Twitter image '+path);
  check(meta.openGraph.images[0].width,undefined,'custom image dimensions not invented '+path);
 }
 seoState=await (await seoApi.GET(req('/api/admin/seo','GET'))).json();
 check((await seoApi.POST(req('/api/admin/seo','POST',{mode:'publish',settings:{seo_pages:'{}',social_image_url:sharingHelpers.DEFAULT_SHARING_IMAGE,social_image_alt:originalAlt},baseFingerprint:seoState.baseFingerprint,version:seoState.version}))).status,200,'original premium sharing image restored');
 check((await load('lib/seo.ts').metadataForPath('/')).openGraph.images[0].width,1200,'original sharing image has verified width');
 const design=load('app/api/admin/design/route.ts');let designState=await (await design.GET(req('/api/admin/design','GET'))).json();
 const originalSettings=load('lib/site-settings.ts');const originalHeadline=(await originalSettings.getSiteSettings()).hero_headline;
 const elementGraph=JSON.stringify({'/':{'.public-site > [data-design-id="d-12345678"]':{text:'Private element',hidden:true,deleted:false,href:'/contact',additions:[{id:'new-heading',type:'HEADING',text:'New content'}],styles:{mobile:{fontSize:18}}}}});
 const newPresentation={...JSON.parse(designState.settings.home_presentation),reasonHeaderBackground:'#183355',heroTopPadding:16}; const newCards=JSON.parse(designState.settings.home_capability_groups).map((card,i)=>({...card,title:i===0?'Edited capability':card.title,visible:i!==3}));
 const phasePoints=JSON.parse(designState.settings.home_process_details);phasePoints[0][0]='Saved process phase detail'; const footerGroups=JSON.parse(designState.settings.footer_service_groups);footerGroups[0].label='Engineering capabilities';
 const designDraft={...designState.settings,home_process_details:JSON.stringify(phasePoints),footer_service_groups:JSON.stringify(footerGroups),instagram_url:'https://instagram.com/velaur.local.qa',inner_hero_visuals_enabled:'false',home_presentation:JSON.stringify(newPresentation),home_capability_groups:JSON.stringify(newCards),header_enabled:'false',footer_enabled:'false',topbar_enabled:'true',topbar_text:'Local preview announcement',topbar_url:'/contact',hero_headline:'Private original page draft',element_overrides:elementGraph};
 let designSave=await design.POST(req('/api/admin/design','POST',{settings:designDraft,version:designState.version,baseFingerprint:designState.baseFingerprint,mode:'draft'}));check(designSave.status,200,'original-page design draft accepts complete settings');
 let designVersion=(await designSave.json()).version;
 check((await originalSettings.getSiteSettings()).hero_headline,originalHeadline,'original-page draft is isolated from public settings');
 check((await originalSettings.getSiteSettings()).element_overrides,'{}','element overrides stay private in draft');
 check((await design.POST(req('/api/admin/design','POST',{settings:{element_overrides:'{"/":{"body":{"text":"invalid"}}}}'},baseFingerprint:designState.baseFingerprint,mode:'draft'}))).status,400,'designer API rejects unsafe selectors');
 const context=load('lib/design-preview-context.ts').designPreviewContext;
 check((await context.run(designDraft,()=>originalSettings.getSiteSettings())).hero_headline,'Private original page draft','original-page preview reads scoped draft settings');
 check((await originalSettings.getSiteSettings()).hero_headline,originalHeadline,'preview context cannot leak into public requests');
 const preview=load('app/admin/design/preview/page.tsx').default;
 check(Boolean(await preview({searchParams:Promise.resolve({path:'/services/business-development'})})),true,'category pages remain available in authenticated designer');
 check(Boolean(await preview({searchParams:Promise.resolve({path:'/growth-solutions/b2b-client-acquisition-system'})})),true,'growth solution pages remain available in authenticated designer');
 const previewElement=await preview({searchParams:Promise.resolve({path:'/'})});
 check(previewElement.props.children[0].props.previewSettings.hero_headline,'Private original page draft','authenticated preview receives unsaved original-page settings');
 check((await design.POST(req('/api/admin/design','POST',{settings:designDraft,version:null,baseFingerprint:designState.baseFingerprint,mode:'draft'}))).status,409,'original-page draft detects another editor save');
 designSave=await design.POST(req('/api/admin/design','POST',{settings:designDraft,version:designVersion,baseFingerprint:designState.baseFingerprint,mode:'publish'}));check(designSave.status,200,'original-page design publishes atomically');
 check((await originalSettings.getSiteSettings()).hero_headline,'Private original page draft','published original-page settings become public');
 check((await originalSettings.getSiteSettings()).home_process_details,JSON.stringify(phasePoints),'new scroll process detail fields publish');check((await originalSettings.getSiteSettings()).footer_service_groups,JSON.stringify(footerGroups),'footer grouping publishes');check((await originalSettings.getSiteSettings()).instagram_url,'https://instagram.com/velaur.local.qa','configured social URL publishes');
 check((await originalSettings.getSiteSettings()).home_presentation,JSON.stringify(newPresentation),'new homepage colors and spacing publish through actual CMS API');
 check((await originalSettings.getSiteSettings()).home_capability_groups,JSON.stringify(newCards),'capability title and visibility publish through actual CMS API');
 check((await originalSettings.getSiteSettings()).element_overrides,elementGraph,'approved element graph publishes with settings transaction');
 check((await originalSettings.getSiteSettings()).topbar_enabled,'true','optional topbar publishes with site structure');
 check((await originalSettings.getSiteSettings()).header_enabled,'false','header visibility publishes');
 check((await originalSettings.getSiteSettings()).footer_enabled,'false','footer visibility publishes');
 check((await design.POST(req('/api/admin/design','POST',{settings:{topbar_url:'javascript:alert(1)'},baseFingerprint:designState.baseFingerprint,mode:'draft'}))).status,400,'structure links reject script URLs');
 const previousDesign=await (await design.GET(req('/api/admin/design?revision=1','GET'))).json();check(previousDesign.settings.hero_headline,originalHeadline,'original-page revision exposes prior content only to owner');
 designSave=await design.POST(req('/api/admin/design','POST',{settings:previousDesign.settings,version:previousDesign.version,baseFingerprint:previousDesign.baseFingerprint,mode:'draft'}));designVersion=(await designSave.json()).version;
 check((await originalSettings.getSiteSettings()).hero_headline,'Private original page draft','loading old original-page design leaves publication unchanged');
 const settingsApi=load('app/api/admin/settings/route.ts');check((await settingsApi.PUT(req('/api/admin/settings','PUT',{hero_headline:'Changed by another editor'}))).status,200,'live settings write uses shared publish lock');
 check((await design.POST(req('/api/admin/design','POST',{settings:previousDesign.settings,version:designVersion,baseFingerprint:previousDesign.baseFingerprint,mode:'publish'}))).status,409,'designer cannot overwrite later live settings changes');
 const users=load('app/api/admin/users/route.ts');
 const subResponse=await users.POST(req('/api/admin/users','POST',{email:'editor@example.test',displayName:'Editor',password,permissions:{settings:['VIEW'],media:['CREATE'],approvals:['CREATE'],backups:['VIEW']}}));
 check(subResponse.status,201,'sub-admin supports all modules exposed by permissions UI');const sub=(await subResponse.json()).user;
 check(sub.role,'SUB_ADMIN','creation cannot grant super-admin role');
 await query('INSERT INTO admin_sessions(user_id,token_hash,expires_at) VALUES($1,$2,NOW()+INTERVAL \'1 day\')',[sub.id,'fixture-token']);
 check((await users.PATCH(req('/api/admin/users','PATCH',{id:sub.id,isActive:false}))).status,200,'super admin can disable sub-admin');
 check((await query('SELECT * FROM admin_sessions WHERE user_id=$1',[sub.id])).rows.length,0,'disabling sub-admin revokes sessions');
 const owner=await auth.getCurrentAdmin();await query("UPDATE admin_users SET role='SUB_ADMIN',permissions=$1::jsonb WHERE id=$2",[JSON.stringify({pages:['VIEW','EDIT'],services:['CREATE'],blog:['CREATE'],projects:['CREATE']}),owner.id]);
 check((await contentApi.POST(req('/api/admin/content/services','POST',{...defaults('services')[1],status:'DRAFT'}),moduleParams('services'))).status,403,'creator cannot hide default service without publishing permission');
 check((await contentApi.POST(req('/api/admin/content/blog','POST',{...articleDefaults[1],status:'DRAFT'}),moduleParams('blog'))).status,403,'creator cannot shadow original article without publishing permission');
 check((await contentApi.POST(req('/api/admin/content/projects','POST',{slug:catalog[1].slug,title:'Unauthorized replacement',category:'WEBSITE',status:'DRAFT'}),moduleParams('projects'))).status,403,'creator cannot shadow approved portfolio without publishing permission');
 check((await backups.POST(req('/api/admin/backups','POST',{confirmation:'EXPORT'}))).status,403,'sub admin cannot export sensitive data');
 result=await save.PUT(req('/api/admin/pages/'+page.id+'/save','PUT',{page,sections:[section]}),params);check(result.status,403,'sub admin cannot publish');
 result=await save.PUT(req('/api/admin/pages/'+page.id+'/save','PUT',{page,sections:[section],mode:'draft'}),params);check(result.status,200,'editor can prepare draft of published page');
 check((await seoApi.GET(req('/api/admin/seo','GET'))).status,403,'SEO view requires settings permission');
 const logout=load('app/api/auth/logout/route.ts');check((await logout.POST(req('/api/auth/logout'))).status,200,'logout revokes session');
 check(await auth.getCurrentAdmin(),null,'revoked session cannot authenticate');
 check((await seoApi.GET(req('/api/admin/seo','GET'))).status,401,'SEO anonymous read rejected');
 await assert.rejects(()=>preview({searchParams:Promise.resolve({path:'/'})}));tests++;console.log('PASS anonymous original-page draft preview rejected');
 console.log(JSON.stringify({suite:'actual API handlers with disposable PGlite PostgreSQL',passed:tests,limitations:['pgcrypto extension unavailable in PGlite; built-in gen_random_uuid used','Next cookie store adapted in memory','No hosted provider calls or browser session covered']}));
}finally{await engine.close();}


