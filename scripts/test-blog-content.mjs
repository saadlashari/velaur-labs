import fs from 'node:fs';
import assert from 'node:assert/strict';
const editor=fs.readFileSync('app/admin/content/page.tsx','utf8');
const api=fs.readFileSync('app/api/admin/content/[module]/route.ts','utf8');
const detail=fs.readFileSync('app/blog/[slug]/page.tsx','utf8');
const index=fs.readFileSync('app/blog/page.tsx','utf8');
const homepage=fs.readFileSync('app/page.tsx','utf8');
assert.match(editor,/Article cover and structured content/);
assert.match(editor,/MediaPicker onSelect=\{asset=>editBlogField\('cover'/);
assert.match(editor,/blogSections\.length>=30/);
assert.match(api,/Blog cover requires a valid image URL and alt text/);
assert.match(api,/Blog sections must include headings and text/);
assert.match(detail,/blogSections\(a\.body\)/);
assert.match(detail,/articleCover\(a\)/);
assert.match(index,/articleCover\(post\)/);
assert.match(homepage,/articleCover\(article\)/);
console.log('PASS: blog editor, cover, sections, API validation, list/detail/home wiring');

