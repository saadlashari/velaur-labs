import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import Module,{createRequire} from 'node:module';
import ts from 'typescript';import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:3000'});
globalThis.window=dom.window;globalThis.document=dom.window.document;Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.HTMLElement=dom.window.HTMLElement;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
globalThis.ResizeObserver=class{observe(){}disconnect(){}};
const require=createRequire(import.meta.url),React=require('react');
const {render,screen,within,cleanup}=require('@testing-library/react');const user=require('@testing-library/user-event').default.setup({document:dom.window.document});
const cache=new Map();
function load(relative){const file=path.resolve(relative);if(cache.has(file))return cache.get(file).exports;const m=new Module(file);cache.set(file,m);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m.require=id=>{
 if(id==='next/image')return function ImageAdapter({priority,fill,...props}){return React.createElement('img',props);};
 if(id==='next/navigation')return {usePathname:()=>'/'};
 if(id==='next/link')return function LinkAdapter({children,...props}){return React.createElement('a',props,children);};
 if(id.startsWith('@/'))return load(resolveSource(id.slice(2)));
 if(id.startsWith('.'))return load(resolveSource(path.resolve(path.dirname(file),id)));
 return require(id);
};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;m._compile(code,file);return m.exports;}
function resolveSource(file){for(const suffix of ['', '.ts','.tsx'])if(fs.existsSync(file+suffix)&&fs.statSync(file+suffix).isFile())return file+suffix;throw Error('Missing '+file);}
let tests=0;function check(actual,expected,label){assert.equal(actual,expected,label);tests++;console.log('PASS '+label);}
const Canvas=load('app/admin/pages/visual-canvas.tsx').default;
let lastSections;
function CanvasHarness(){const [selected,setSelected]=React.useState(null);const [sections,setSections]=React.useState([
 {section_key:'hero',section_type:'HERO',is_visible:true,content:{heading:'Original heading',text:'Original body'},settings:{}},
 {section_key:'text',section_type:'TEXT',is_visible:true,content:{heading:'Second section'},settings:{}},
 {section_key:'hidden',section_type:'TEXT',is_visible:false,content:{heading:'Hidden section'},settings:{}}
]);lastSections=sections;return React.createElement(Canvas,{sections,selected,onSelect:setSelected,onEdit:(i,p)=>setSections(items=>items.map((s,n)=>n===i?{...s,...p}:s)),onMove:(from,to)=>setSections(items=>{const next=[...items];next.splice(to,0,next.splice(from,1)[0]);return next;})});}
render(React.createElement(CanvasHarness));check(screen.queryByRole('heading',{name:'Hidden section'}),null,'hidden sections excluded from canvas');
await user.click(screen.getByRole('heading',{name:'Original heading'}));check(screen.getByLabelText('Heading').value,'Original heading','canvas selection exposes editable fields');
await user.clear(screen.getByLabelText('Heading'));await user.type(screen.getByLabelText('Heading'),'Edited on canvas');check(screen.getByRole('heading',{name:'Edited on canvas'}).textContent,'Edited on canvas','canvas text updates public renderer');
await user.click(screen.getAllByRole('button',{name:'↓'})[0]);check(lastSections[1].section_key,'hero','keyboard-friendly section reorder');cleanup();
const Editor=load('app/admin/pages/block-editor.tsx').default;let lastBlocks;
function BlockHarness(){const [blocks,setBlocks]=React.useState([]);lastBlocks=blocks;return React.createElement(Editor,{blocks,onChange:setBlocks});}
const {container}=render(React.createElement(BlockHarness));
await user.selectOptions(screen.getByLabelText('New block type'),'CONTAINER');await user.click(screen.getByRole('button',{name:'Add block'}));check(lastBlocks[0].type,'CONTAINER','create nested container');
const nested=within(container.querySelectorAll('.block-tree-editor')[1]);await user.selectOptions(nested.getByLabelText('New block type'),'HEADING');await user.click(nested.getByRole('button',{name:'Add block'}));
check(lastBlocks[0].children[0].type,'HEADING','insert heading into container');await user.clear(nested.getByRole('textbox',{name:'Text'}));await user.type(nested.getByRole('textbox',{name:'Text'}),'Nested content');check(lastBlocks[0].children[0].text,'Nested content','edit nested heading');
await user.selectOptions(nested.getByLabelText('New block type'),'BUTTON');await user.click(nested.getByRole('button',{name:'Add block'}));check(lastBlocks[0].children.length,2,'insert nested button');
await user.click(nested.getAllByRole('button',{name:'Move up'})[1]);check(lastBlocks[0].children[0].type,'BUTTON','reorder sibling blocks');
const firstNode=within(container.querySelectorAll('.block-tree-editor')[1].querySelector('.block-tree-node'));
await user.click(firstNode.getByText('Design and breakpoints'));
await user.clear(firstNode.getByRole('spinbutton',{name:'mobile Font Size'}));await user.type(firstNode.getByRole('spinbutton',{name:'mobile Font Size'}),'18');check(lastBlocks[0].children[0].style.mobileFontSize,18,'responsive property edits persist');
await user.click(firstNode.getByRole('button',{name:'Delete',exact:true}));check(lastBlocks[0].children.length,1,'remove nested block without removing container');cleanup();
const {validateBlocks}=load('lib/builder-blocks.ts');
check(validateBlocks(lastBlocks),null,'editor produces a valid layout tree');
check(Boolean(validateBlocks([{id:'a',type:'BUTTON',url:'javascript:alert(1)'}])),true,'reject active block URLs');
check(Boolean(validateBlocks([{id:'a',type:'TEXT',style:{position:'fixed'}}])),true,'reject unsupported arbitrary CSS');
check(Boolean(validateBlocks([{id:'a',type:'TEXT'},{id:'a',type:'TEXT'}])),true,'reject duplicate block IDs');
const Design=load('app/admin/design/page.tsx').default;
const originalFetch=globalThis.fetch;let designPayload;
const initial={hero_headline:'Original design heading',hero_description:'Original intro',footer_description:'Original footer'};
globalThis.fetch=async(url,options)=>{if(options?.method==='POST'){designPayload=JSON.parse(options.body);return new Response(JSON.stringify({ok:true,version:designPayload.mode==='publish'?null:'2026-01-01T00:00:00.000Z',baseFingerprint:'fixture'}));}return new Response(JSON.stringify({settings:initial,version:null,baseFingerprint:'fixture',liveFingerprint:'fixture',projects:[],revisions:[{revision_number:1,created_at:'2026-01-01'}]}));};
render(React.createElement(Design));await screen.findByRole('tab',{name:'Structure'});await user.click(screen.getByRole('tab',{name:'Structure'}));await screen.findByText('Hero headline',{selector:'summary'});await user.click(screen.getByText('Hero headline',{selector:'summary'}));await screen.findByRole('textbox',{name:'Hero headline'});
await user.click(screen.getByRole('checkbox',{name:'Autosave draft'}));
await user.clear(screen.getByRole('textbox',{name:'Hero headline'}));await user.type(screen.getByRole('textbox',{name:'Hero headline'}),'Draft original page');
await user.click(screen.getByRole('button',{name:'Save draft'}));await screen.findByText('Draft saved. Public pages are unchanged.');
check(designPayload.mode,'draft','original-page designer saves draft explicitly');check(designPayload.settings.hero_headline,'Draft original page','original-page designer preserves edited text');
await user.click(screen.getByRole('button',{name:'Mobile',exact:true}));check(document.querySelector('.design-frame').classList.contains('design-frame-mobile'),true,'original-page preview switches to mobile frame');
await user.click(screen.getByRole('button',{name:'Undo',exact:true}));check(screen.getByRole('textbox',{name:'Hero headline'}).value,'Draft original pag','designer undo preserves history');
await user.click(screen.getByRole('button',{name:'Redo',exact:true}));check(screen.getByRole('textbox',{name:'Hero headline'}).value,'Draft original page','designer redo restores history');
await user.click(screen.getByRole('button',{name:'Publish changes'}));await screen.findByText('Changes published.');check(designPayload.mode,'publish','publishing requires a separate explicit action');
await user.click(screen.getByText('Saved design revisions'));await user.click(screen.getByRole('button',{name:'Restore version 1'}));await screen.findByText('Revision loaded as a draft. Review before publishing.');check(screen.getByRole('textbox',{name:'Hero headline'}).value,'Original design heading','designer restores revision into editable draft');cleanup();globalThis.fetch=originalFetch;
console.log(JSON.stringify({suite:'React DOM interactions in jsdom',passed:tests,limitation:'DOM behavior verified; not a browser visual, real iframe or pointer-drag geometry test'}));

for(const name of ['Element','SVGElement','HTMLImageElement','HTMLAnchorElement','MutationObserver'])globalThis[name]=dom.window[name];
const {validateElementDesign,parseElementDesign}=load('lib/element-design.ts');
const selector='.public-site > [data-design-id="d-12345678"]';
check(validateElementDesign({'/':{[selector]:{text:'Escaped <script>',styles:{desktop:{fontSize:30},mobile:{fontSize:18}}}}}),null,'safe element graph accepted');
check(Boolean(validateElementDesign({'/':{'body':{text:'Unsafe'}}})),true,'selectors restricted to public site');
check(Boolean(validateElementDesign({'/':{[selector]:{styles:{desktop:{backgroundImage:'url(https://bad.test)'}}}}})),true,'arbitrary CSS rejected');
check(Boolean(validateElementDesign({'/':{[selector]:{src:'javascript:alert(1)'}}})),true,'active image URLs rejected');
const Overrides=load('app/components/element-overrides.tsx').default;const {act}=React;
const graph={'/':{[selector]:{text:'Literal <script>',styles:{desktop:{fontSize:30},mobile:{fontSize:18}}}}};
function OverrideHarness({raw}){return React.createElement('div',{className:'public-site'},React.createElement('p',{'data-design-id':'d-12345678'},'Original'),React.createElement(Overrides,{raw}));}
Object.defineProperty(window,'innerWidth',{value:1280,writable:true,configurable:true});
const view=render(React.createElement(OverrideHarness,{raw:JSON.stringify(graph)}));const paragraph=view.container.querySelector('p');
check(paragraph.textContent,'Literal <script>','element text escaped as plain text');check(paragraph.style.fontSize,'30px','desktop element style applied');
await act(async()=>{window.innerWidth=390;window.dispatchEvent(new window.Event('resize'));});check(paragraph.style.fontSize,'18px','mobile override selected on resize');
await act(async()=>{paragraph.setAttribute('contenteditable','plaintext-only');paragraph.textContent='Text currently being written';});check(paragraph.textContent,'Text currently being written','mutation observer preserves active inline editing');paragraph.removeAttribute('contenteditable');
view.rerender(React.createElement(OverrideHarness,{raw:'{}'}));check(paragraph.textContent,'Original','reset restores original element text');check(paragraph.style.fontSize,'','reset restores original element style');cleanup();
const Inspector=load('app/admin/design/element-inspector.tsx').default;let selectedRule;
function InspectorHarness(){const [rule,setRule]=React.useState({});selectedRule=rule;return React.createElement(Inspector,{selected:{selector,tag:'p',label:'Paragraph',text:'Original',leaf:true},rule,device:'mobile',onChange:setRule,onRemove:()=>setRule({})});}
render(React.createElement(InspectorHarness));await user.clear(screen.getByRole('textbox',{name:'Element text'}));await user.type(screen.getByRole('textbox',{name:'Element text'}),'Edited element');check(selectedRule.text,'Edited element','element inspector edits text');await user.type(screen.getByRole('spinbutton',{name:'Font size'}),'19');check(selectedRule.styles.mobile.fontSize,19,'element inspector persists breakpoint style');await user.selectOptions(screen.getByRole('combobox',{name:'Text align'}),'left');check(selectedRule.styles.mobile.textAlign,'left','prominent alignment control persists mobile style');check(screen.getByRole('spinbutton',{name:'Font size'}).closest('fieldset').querySelector('legend').textContent,'Text formatting','text formatting is visible without advanced menus');await user.click(screen.getByRole('button',{name:'Reset selected element'}));check(Object.keys(selectedRule).length,0,'element inspector reset');cleanup();
console.log('Element controls included; total '+tests+' assertions passed.');
check(validateElementDesign({'/':{[selector]:{hidden:true,deleted:false,href:'/contact',additions:[{id:'new-block',type:'TEXT',text:'New content'}]}}}),null,'contextual content properties accepted');
check(Boolean(validateElementDesign({'/':{[selector]:{href:'javascript:alert(1)'}}})),true,'active button destinations rejected');
check(Boolean(validateElementDesign({'/':{[selector]:{hidden:'true'}}})),true,'visibility requires boolean');
function ContextHarness({raw}){return React.createElement('div',{className:'public-site'},React.createElement('a',{'data-design-id':'d-12345678',href:'/about'},'Original link'),React.createElement(Overrides,{raw}));}
const context=render(React.createElement(ContextHarness,{raw:JSON.stringify({'/':{[selector]:{hidden:true,href:'/contact',additions:[{id:'context-heading',type:'HEADING',text:'Added heading'},{id:'context-button',type:'BUTTON',text:'New button',url:'/contact'}]}}})}));
const originalLink=context.container.querySelector('a');check(originalLink.style.display,'none','hide removes original element from visual layout');check(originalLink.getAttribute('href'),'/contact','button destination updates');check(screen.getByRole('heading',{name:'Added heading'}).textContent,'Added heading','create content renders beside existing element');check(screen.getByRole('link',{name:'New button'}).getAttribute('href'),'/contact','created button works');
context.rerender(React.createElement(ContextHarness,{raw:JSON.stringify({'/':{[selector]:{deleted:true}}})}));check(originalLink.style.display,'none','soft delete hides selected element');check(context.container.querySelector('.design-added-content'),null,'changing graph cleans inserted content');
context.rerender(React.createElement(ContextHarness,{raw:'{}'}));check(originalLink.style.display,'','show restores original display');check(originalLink.getAttribute('href'),'/about','reset restores original button destination');cleanup();
console.log('Contextual actions included; total '+tests+' assertions passed.');
function OrderHarness({raw}){return React.createElement('div',{className:'public-site'},React.createElement('section',{'data-design-id':'d-12345678'},'First section'),React.createElement('section',{'data-design-id':'d-87654321'},'Second section'),React.createElement(Overrides,{raw}));}
const orderView=render(React.createElement(OrderHarness,{raw:JSON.stringify({'/':{[selector]:{siblingIndex:1},'.public-site > [data-design-id="d-87654321"]':{siblingIndex:0}}})}));check(orderView.container.querySelector('section').textContent,'Second section','original components reorder without replacing their markup');orderView.rerender(React.createElement(OrderHarness,{raw:'{}'}));check(orderView.container.querySelector('section').textContent,'First section','reset restores original component order');cleanup();check(Boolean(validateElementDesign({'/':{[selector]:{siblingIndex:-1}}})),true,'negative component positions rejected');


globalThis.Event=dom.window.Event;
window.matchMedia=query=>({matches:query.includes('max-width'),media:query,addEventListener(){},removeEventListener(){}});
const Header=load('app/components/site-header.tsx').default;
const headerView=render(React.createElement(Header));
await user.click(screen.getByRole('button',{name:'Open navigation'}));check(screen.getByRole('button',{name:'Close navigation'}).getAttribute('aria-expanded'),'true','mobile navigation opens');
await user.keyboard('{Escape}');check(screen.getByRole('button',{name:'Open navigation'}).getAttribute('aria-expanded'),'false','Escape closes navigation');check(document.activeElement,screen.getByRole('button',{name:'Open navigation'}),'Escape returns keyboard focus to menu');
await user.click(screen.getByRole('button',{name:'Open navigation'}));await user.click(within(screen.getByRole('navigation',{name:'Main navigation'})).getByRole('link',{name:'Home',exact:true}));check(screen.getByRole('button',{name:'Open navigation'}).getAttribute('aria-expanded'),'false','current-page link also closes mobile navigation');
await user.click(screen.getByRole('button',{name:'Open navigation'}));await user.click(document.body);check(screen.getByRole('button',{name:'Open navigation'}).getAttribute('aria-expanded'),'false','outside click closes navigation');
const serviceToggle=screen.getByRole('button',{name:'Toggle services menu'});await user.click(serviceToggle);check(serviceToggle.getAttribute('aria-expanded'),'true','service dropdown opens on click');const businessToggle=screen.getByRole('button',{name:'Toggle Business Development',exact:true});await user.click(businessToggle);check(businessToggle.getAttribute('aria-expanded'),'true','mobile service category accordion opens accessibly');check(Boolean(screen.getByRole('link',{name:'B2B Lead Generation',exact:true})),true,'mega menu includes new business development service');await user.click(businessToggle);check(businessToggle.getAttribute('aria-expanded'),'false','service category accordion closes');await user.click(serviceToggle);check(serviceToggle.getAttribute('aria-expanded'),'false','service dropdown closes on second click');
const themes=screen.getAllByRole('button',{name:'Switch to light mode'});await user.click(themes[0]);check(screen.getAllByRole('button',{name:'Switch to dark mode'}).length,2,'menu and desktop appearance controls stay synchronized');
Object.defineProperty(window,'scrollY',{value:200,configurable:true});await act(async()=>window.dispatchEvent(new window.Event('scroll')));check(headerView.container.querySelector('header').classList.contains('is-scrolled'),true,'scroll switches header surface');cleanup();
console.log('Public navigation included; total '+tests+' assertions passed.');


globalThis.FormData=dom.window.FormData;
const Contact=load('app/contact/contact-form.tsx').default;
const contactProps={email:'contact@example.com',whatsapp:'+923000000000',calendly:'https://calendly.com/example',content:{formTitle:'Tell us about it',formIntro:'Share details',sideTitle:'Contact us',sideIntro:'Choose a channel',nextCopy:'Review after submission'}};
const fetchBeforeContact=globalThis.fetch;let requestMode='error';
globalThis.fetch=async(url,options)=>{if(requestMode==='timeout')return new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Error('aborted'))));return new Response(JSON.stringify(requestMode==='success'?{ok:true,reference:'VLR-QA'}:{error:'Service unavailable'}),{status:requestMode==='success'?201:503});};
render(React.createElement(Contact,{...contactProps,initialService:'B2B Lead Generation'}));check(screen.getByRole('combobox',{name:'Service of interest *'}).value,'B2B Lead Generation','service inquiry preselects the originating service');check(Boolean(screen.getByRole('textbox',{name:/Business website/})),true,'real website field is separate from hidden spam field');
async function fillInquiry(){await user.type(screen.getByRole('textbox',{name:'Full name *'}),'QA Test');await user.type(screen.getByRole('textbox',{name:'Work email *'}),'qa@example.com');await user.selectOptions(screen.getByRole('combobox',{name:'Service of interest *'}),'Web Development');await user.type(screen.getByRole('textbox',{name:'Project details *'}),'A complete test inquiry for the local user interface.');await user.click(screen.getByRole('checkbox'));}
await fillInquiry();await user.click(screen.getByRole('button',{name:/Submit inquiry/}));await screen.findByText('Service unavailable');check(screen.getByRole('textbox',{name:'Full name *'}).value,'QA Test','failed inquiry retains entered information');
requestMode='success';await user.click(screen.getByRole('button',{name:/Submit inquiry/}));await screen.findByText('VLR-QA');check(Boolean(screen.getByRole('heading',{name:'Thanks — we received your inquiry.'})),true,'successful inquiry shows server reference');await user.click(screen.getByRole('button',{name:'Send another inquiry'}));check(screen.getByRole('textbox',{name:'Full name *'}).value,'','new inquiry clears the completed form');
requestMode='timeout';await fillInquiry();const realTimeout=globalThis.setTimeout;globalThis.setTimeout=(callback,delay,...args)=>realTimeout(callback,delay===15000?5:delay,...args);await user.click(screen.getByRole('button',{name:/Submit inquiry/}));await screen.findByText('Your request timed out. Please try again or contact us by email.');check(screen.getByRole('textbox',{name:'Full name *'}).value,'QA Test','timeout retains inquiry for retry');globalThis.setTimeout=realTimeout;globalThis.fetch=fetchBeforeContact;cleanup();
console.log('Contact interactions included; total '+tests+' assertions passed.');

const Library=load('app/admin/content/page.tsx').default;const libraryFetch=globalThis.fetch;let libraryRequest;let libraryItems=[{id:'11111111-1111-4111-8111-111111111111',title:'Existing service',slug:'existing-service',status:'PUBLISHED',updated_at:'2026-01-01T00:00:00.000Z'}];
globalThis.fetch=async(url,options)=>{if(!options?.method)return new Response(JSON.stringify({items:libraryItems}));libraryRequest={method:options.method,...JSON.parse(options.body)};if(options.method==='POST'){const item={...libraryRequest,id:'22222222-2222-4222-8222-222222222222',updated_at:'2026-01-02T00:00:00.000Z'};libraryItems=[...libraryItems,item];return new Response(JSON.stringify({item}),{status:201});}libraryItems=libraryItems.map(item=>item.id===libraryRequest.id?{...item,status:options.method==='DELETE'?'ARCHIVED':libraryRequest.data.status}:item);return new Response(JSON.stringify({ok:true}));};
render(React.createElement(Library));await screen.findByText('Existing service');check(screen.queryByRole('textbox',{name:'title'}),null,'library starts with context actions instead of an open form');
await user.click(screen.getByRole('button',{name:'Hide',exact:true}));await screen.findByText('Content hidden from your website.');check(libraryRequest.data.status,'DRAFT','hide requests a private draft');check(libraryRequest.expectedUpdatedAt,'2026-01-01T00:00:00.000Z','visibility changes carry record version');
await user.click(screen.getByRole('button',{name:'Show',exact:true}));await screen.findByText('Content is now visible on your website.');check(libraryRequest.data.status,'PUBLISHED','show explicitly requests publication');
await user.click(screen.getByRole('button',{name:'Delete',exact:true}));await screen.findByText('Content moved to trash. Use Show to restore.');check(libraryRequest.method,'DELETE','delete uses server DELETE permission gate');check(Boolean(screen.getByRole('button',{name:'Show',exact:true})),true,'trash supports restoring content');
await user.click(screen.getAllByRole('button',{name:'Create new',exact:true})[0]);await user.type(screen.getByRole('textbox',{name:'title',exact:true}),'A new service');await user.click(screen.getByRole('button',{name:'Save',exact:true}));await screen.findByText('New draft created.');check(libraryRequest.slug,'a-new-service','new content generates a readable address');check(libraryRequest.status,'DRAFT','new content stays private by default');cleanup();globalThis.fetch=libraryFetch;
console.log('Content library interactions included; total '+tests+' assertions passed.');
libraryItems=[{id:'default:ai-solutions',is_default:true,title:'Default AI service',slug:'ai-solutions',status:'PUBLISHED',category:'AI',summary:'Approved summary',content:{paragraphs:['Approved detail']}}];
globalThis.fetch=async(url,options)=>{if(!options?.method)return new Response(JSON.stringify({items:libraryItems}));libraryRequest={method:options.method,...JSON.parse(options.body)};libraryItems=[{...libraryRequest,id:'33333333-3333-4333-8333-333333333333',is_default:false}];return new Response(JSON.stringify({item:libraryItems[0]}),{status:201});};
render(React.createElement(Library));await screen.findByText('Default AI service');await user.click(screen.getByRole('button',{name:'Hide',exact:true}));await screen.findByText('Content hidden from your website.');check(libraryRequest.method,'POST','hiding an unsaved website default creates its controlling row');check(libraryRequest.slug,'ai-solutions','default visibility preserves its original address');check(libraryRequest.content.paragraphs[0],'Approved detail','hiding a default preserves its approved content');cleanup();
libraryItems=[{id:'default:ai-solutions',is_default:true,title:'Default AI service',slug:'ai-solutions',status:'PUBLISHED',category:'AI',summary:'Approved summary',content:{paragraphs:['Approved detail']}}];
render(React.createElement(Library));await screen.findByText('Default AI service');await user.click(screen.getByRole('button',{name:'Edit',exact:true}));await user.clear(screen.getByRole('textbox',{name:'title',exact:true}));await user.type(screen.getByRole('textbox',{name:'title',exact:true}),'Updated default service');await user.click(screen.getByRole('button',{name:'Save',exact:true}));await screen.findByText('Changes saved.');check(libraryRequest.method,'POST','editing a virtual default never sends an invalid UUID patch');check(libraryRequest.title,'Updated default service','default edits save the actual editor values');cleanup();globalThis.fetch=libraryFetch;
console.log('Default content interactions included; total '+tests+' assertions passed.');
const Profile=load('app/admin/profile/page.tsx').default;
const profileFetch=globalThis.fetch;let uploadCount=0,completeUpload;
globalThis.fetch=async(url,options)=>{
 if(options?.method==='POST'){uploadCount++;return new Promise(resolve=>{completeUpload=resolve;});}
 return Response.json(url.includes('two-factor')?{enabled:true,recoveryRemaining:10}:{profile:{display_name:'Owner',email:'owner@example.test',theme:'dark',role:'SUPER_ADMIN',avatar_url:'https://example.test/old.png'}});
};
render(React.createElement(Profile));await screen.findByDisplayValue('Owner');
const avatarInput=screen.getByLabelText(/Upload a new profile picture/),avatarFile=new dom.window.File(['image'],'avatar.png',{type:'image/png'});
await user.upload(avatarInput,avatarFile);check(avatarInput.disabled,true,'avatar input disabled while uploading');check(Boolean(screen.getByText('Updating profile image…')),true,'avatar upload progress is visible');
await React.act(async()=>completeUpload(Response.json({error:'Cloudinary credentials were rejected.'},{status:503})));
await screen.findByText('Cloudinary credentials were rejected.');check(screen.getByAltText('Your admin profile').getAttribute('src'),'https://example.test/old.png','failed avatar upload retains previous image');check(avatarInput.value,'','failed avatar input resets for same-file retry');check(screen.queryByText('Profile image updated'),null,'failed upload has no success message');
await user.upload(avatarInput,avatarFile);check(uploadCount,2,'same image can be retried');
await React.act(async()=>completeUpload(Response.json({url:'https://example.test/new.png'})));await screen.findByText('Profile image updated');check(screen.getByAltText('Your admin profile').getAttribute('src'),'https://example.test/new.png','successful upload updates preview');check(screen.queryByText('Cloudinary credentials were rejected.'),null,'successful retry clears previous error');
await user.upload(avatarInput,avatarFile);await React.act(async()=>completeUpload(Response.json({ok:true})));await screen.findByText(/did not return a valid image/);check(screen.queryByText('Profile image updated'),null,'incomplete success response never shows success');check(screen.getByAltText('Your admin profile').getAttribute('src'),'https://example.test/new.png','incomplete success preserves preview');
cleanup();globalThis.fetch=profileFetch;
console.log('Profile upload interactions included; total '+tests+' assertions passed.');
dom.window.close();

