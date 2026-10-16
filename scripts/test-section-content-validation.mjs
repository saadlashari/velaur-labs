#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let ts;
for(const ref of ['typescript','/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript'])try{ts=require(ref);break}catch{}
if(!ts)throw Error('TypeScript parser not found');
const src=fs.readFileSync(new URL('../lib/section-content-validation.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};
new Function('module','exports',compiled)(mod,mod.exports);
const {isApprovedContentUrl:approved,validateSectionContent:check}=mod.exports;
const bad=['javascript:alert(1)','data:image/svg+xml,x','//evil.com','http://example.com','https://user:pass@example.com','https://example.com\nfoo'];
for(const url of bad)assert.equal(approved(url),false,`accepted ${url}`);
for(const url of ['/work/projects/demo','https://example.com/gallery.png'])assert.equal(approved(url),true);
assert.match(check({section_type:'PROJECTS',content:{items:[{title:'Case study',href:'javascript:alert(1)'}]}}),/invalid link/);
assert.match(check({section_type:'CARDS',content:{items:[{imageUrl:'https://cdn.example.com/photo.png'}]}}),/alt text/);
assert.equal(check({section_type:'CARDS',content:{items:[{imageUrl:'https://cdn.example.com/photo.png',imageAlt:'Screenshot',href:'/work'}]}}),null);
assert.equal(check({section_type:'HERO',content:{href:'/contact',imageUrl:'https://example.com/a.webp',imageAlt:'Product UI'}}),null);
console.log('PASS: URL scheme, credentials, item links, alt text and valid-content tests (12 cases)');
