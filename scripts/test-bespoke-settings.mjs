import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const settings=read('lib/site-settings.ts');const route=read('app/api/admin/settings/route.ts');const designer=read('app/admin/design/workspace.tsx');const editor=read('app/admin/settings/page.tsx');
const keys=['blog_hero_eyebrow','blog_hero_title','blog_hero_highlight','blog_hero_copy','blog_empty_title','blog_empty_copy','privacy_hero_copy','privacy_contact_copy','terms_hero_copy','terms_contact_copy'];
assert(editor.includes('DesignWorkspace'),'Settings must use the shared visual editor');
assert(designer.includes('Object.keys(settings)')&&designer.includes('edit(key,'),'Shared editor must expose loaded settings and editable values');
for (const key of keys){assert(settings.includes(key),`${key} missing defaults`);assert(route.includes(key),`${key} missing API allowlist`);}
for (const [page,fields] of [['app/blog/page.tsx',keys.slice(0,6)],['app/privacy-policy/page.tsx',keys.slice(6,8)],['app/terms-of-service/page.tsx',keys.slice(8)]]){const src=read(page);assert(src.includes('getSiteSettings'));for(const field of fields)assert(src.includes(`settings.${field}`),`${page} missing ${field}`);}
console.log(`PASS: ${keys.length} settings across API, admin UI and three public pages`);

