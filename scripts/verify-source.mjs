#!/usr/bin/env node
// Dependency-free static verification; does NOT replace Next.js build or integration tests.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const root=process.cwd();
const issues=[];const files=[];
function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.next','.git'].includes(d.name))continue;const p=path.join(dir,d.name);if(d.isDirectory())walk(p);else if(/\.(ts|tsx)$/.test(p))files.push(p)}}
for(const dir of ['app','lib'])if(fs.existsSync(path.join(root,dir)))walk(path.join(root,dir));
const require=createRequire(import.meta.url);
let ts;
for(const ref of ['typescript','/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript'])try{ts=require(ref);break}catch{}
if(!ts)issues.push('TypeScript parser unavailable (install dependencies to run full verification)');
for(const file of files){const code=fs.readFileSync(file,'utf8');
 // Client Component directives must precede imports and other statements.
 if(/['"]use client['"]/.test(code)){
   const leading=code.replace(/^\uFEFF/, '').replace(/^(?:\s|\/\*[\s\S]*?\*\/|\/\/[^\n]*\n)*/, '');
   if(!/^['"]use client['"];?/.test(leading))issues.push(`${path.relative(root,file)}: use client directive must appear before imports`);
 }
 if(ts){const source=ts.createSourceFile(file,code,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);for(const e of source.parseDiagnostics)issues.push(`${path.relative(root,file)}: ${ts.flattenDiagnosticMessageText(e.messageText,' ')}`)}
 for(const m of code.matchAll(/(?:from\s*|import\s*\(|require\s*\()\s*['"](\.{1,2}\/[^'"]+)['"]/g)){
  const target=path.resolve(path.dirname(file),m[1]);const possibilities=[target,target+'.ts',target+'.tsx',target+'.js',target+'.jsx',path.join(target,'index.ts'),path.join(target,'index.tsx'),path.join(target,'index.js')];if(!possibilities.some(p=>fs.existsSync(p)))issues.push(`${path.relative(root,file)}: missing relative import ${m[1]}`);
 }
}
// Full public-page preview is a same-origin iframe, so DENY would break it.
const nextConfig=fs.readFileSync(path.join(root,'next.config.mjs'),'utf8');
if(/X-Frame-Options['"],\s*value:\s*['"]DENY/.test(nextConfig))issues.push('next.config.ts: DENY prevents same-origin admin full-page preview');
const pageEditor=fs.readFileSync(path.join(root,'app/admin/pages/page.tsx'),'utf8');
if(!pageEditor.includes('<iframe'))issues.push('Admin published-page preview iframe not found');
const needed=['app/admin/page.tsx','app/admin/pages/page.tsx','app/admin/profile/page.tsx','app/admin/operations/page.tsx','app/api/admin/backups/route.ts','app/api/admin/pages/[id]/save/route.ts','app/page.tsx','app/about/page.tsx','app/services/page.tsx','app/work/page.tsx','app/blog/page.tsx','app/contact/page.tsx'];
for(const p of needed)if(!fs.existsSync(path.join(root,p)))issues.push(`Missing required route: ${p}`);
console.log(JSON.stringify({filesInspected:files.length,requiredRoutesChecked:needed.length,errors:issues},null,2));
process.exitCode=issues.length?1:0;
