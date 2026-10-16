import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import Module,{createRequire} from 'node:module';import ts from 'typescript';
const require=createRequire(import.meta.url),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const cache=new Map();let pathname='/';
function resolve(file){for(const ext of ['','.ts','.tsx','.json'])if(fs.existsSync(file+ext)&&fs.statSync(file+ext).isFile())return file+ext;throw Error('Cannot resolve '+file);}
function load(relative){const file=path.resolve(relative);if(file.endsWith('.json'))return require(file);if(cache.has(file))return cache.get(file).exports;const m=new Module(file);cache.set(file,m);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m.require=id=>{
 if(id==='@/lib/db'||id==='./db')return {db:{query:async()=>({rows:[],rowCount:0})},isDatabaseConfigured:()=>false};
 if(id==='next/link')return function LinkAdapter({children,...props}){return React.createElement('a',props,children);};
 if(id==='next/image')return function ImageAdapter({priority,fill,unoptimized,children,...props}){return React.createElement('img',props,children);};
 if(id==='next/navigation')return {usePathname:()=>pathname,useRouter:()=>({replace(){}}),notFound:()=>{throw Error('NOT_FOUND');}};
 if(id.startsWith('@/'))return load(resolve(id.slice(2)));
 if(id.startsWith('.'))return load(resolve(path.resolve(path.dirname(file),id)));
 return require(id);
};m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);return m.exports;}
async function expand(node){if(node==null||typeof node!=='object')return node;if(Array.isArray(node))return Promise.all(node.map(async(child,index)=>{const expanded=await expand(child);return React.isValidElement(expanded)&&expanded.key==null?React.cloneElement(expanded,{key:'ssr-'+index}):expanded;}));if(!React.isValidElement(node))return node;
 if(typeof node.type==='function'&&node.type.constructor.name==='AsyncFunction')return expand(await node.type(node.props));
 if(node.props.children!==undefined)return React.cloneElement(node,{},await expand(node.props.children));return node;
}
let passed=0;
const crumbs=renderToStaticMarkup(React.createElement(load('app/components/agency-sections.tsx').Breadcrumbs,{items:[{label:'<Example>',href:'/services'}]}));const crumbJson=crumbs.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];assert(!crumbJson.includes('<Example>'));assert.equal(JSON.parse(crumbJson).itemListElement[0].name,'<Example>');passed++;
async function page(file,url,props={},expected){pathname=url;const component=load(file).default;const tree=await expand(await component(props));const html=renderToStaticMarkup(tree);assert(html.includes('VELAUR LABS'),url+' lost brand');assert(!html.includes('[object Object]'),url+' renders invalid object');if(expected)assert(html.includes(expected),url+' missing expected content');passed++;return html;}
const homeHtml=await page('app/page.tsx','/',{},'Where Creativity Meets Technology.');assert(!homeHtml.includes('mega-menu-head'),'redundant mega menu heading removed');assert(!homeHtml.includes('featured-card-number')&&!homeHtml.includes('Only approved project records'),'decorative project numbering and internal portfolio note removed');passed+=2;
await page('app/about/page.tsx','/about');await page('app/services/page.tsx','/services');
const work=await page('app/work/page.tsx','/work');assert(work.includes('Showing 38 of 38'));passed++;
for(const category of ['websites','web-applications','mobile-apps'])await page('app/work/'+category+'/page.tsx','/work/'+category);
await page('app/blog/page.tsx','/blog',{searchParams:Promise.resolve({})});await page('app/contact/page.tsx','/contact');
await page('app/privacy-policy/page.tsx','/privacy-policy');await page('app/terms-of-service/page.tsx','/terms-of-service');
const {allServiceNavigation,serviceCategories,solutionNavigation}=load('lib/agency-navigation.ts');const services=allServiceNavigation.map(item=>item.slug);const metadataTitles=new Set(),headlines=new Set();
for(const slug of services){const html=await page('app/services/[slug]/page.tsx','/services/'+slug,{params:Promise.resolve({slug})});assert.equal((html.match(/<h1[ >]/g)||[]).length,1,slug+' one H1');const h1=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1];assert(!headlines.has(h1),slug+' unique H1');headlines.add(h1);assert(html.includes('Book a Discovery Call')&&html.includes('Explore Related Services')&&html.includes('WHO IT IS FOR')&&html.includes('PROBLEMS WE ADDRESS'));const meta=await load('app/services/[slug]/page.tsx').generateMetadata({params:Promise.resolve({slug})});assert(meta.description&&meta.alternates.canonical==='/services/'+slug);assert(!metadataTitles.has(meta.title));metadataTitles.add(meta.title);passed++;if(slug==='web-development'){assert(html.includes('Cakes and Bakes'));assert(!html.includes('TopMusic'));passed++;}if(slug==='mobile-app-development'){assert(html.includes('TopMusic'));assert(!html.includes('Cakes and Bakes'));passed++;}}
for(const category of serviceCategories)await page('app/services/[slug]/page.tsx','/services/'+category.slug,{params:Promise.resolve({slug:category.slug})});
await page('app/growth-solutions/page.tsx','/growth-solutions');for(const [slug,title] of solutionNavigation)await page('app/growth-solutions/[slug]/page.tsx','/growth-solutions/'+slug,{params:Promise.resolve({slug})},title.replaceAll('&','&amp;'));
const catalog=require(path.resolve('data/portfolio.json'));
for(const project of catalog)await page('app/work/projects/[slug]/page.tsx','/work/projects/'+project.slug,{params:Promise.resolve({slug:project.slug})},project.title.replaceAll('&','&amp;').replaceAll("'",'&#x27;'));
const {launchArticles}=load('lib/launch-articles.ts');for(const article of launchArticles)await page('app/blog/[slug]/page.tsx','/blog/'+article.slug,{params:Promise.resolve({slug:article.slug})});
await assert.rejects(page('app/work/projects/[slug]/page.tsx','/work/projects/missing',{params:Promise.resolve({slug:'missing'})}),/NOT_FOUND/);passed++;
console.log(JSON.stringify({suite:'Public route components rendered with real React SSR',passed,routes:11+services.length+serviceCategories.length+1+solutionNavigation.length+38+launchArticles.length,limitations:['Next Link/Image/navigation adapters used','No HTTP transport, hydration or browser geometry checked','Database-independent approved catalog checked']}));
