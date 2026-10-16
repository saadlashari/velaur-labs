import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const cases={
  about:['about-story','mission-vision-grid','about_principles_title'],
  services:['visibleServices.filter','AgencyServiceCards','services_hero_title'],
  work:['portfolio-category-grid','getPublishedProjects','published-work-overview'],
  blog:['blog-category-tabs','getPublishedArticles','/blog/${post.slug}'],
};
for(const [slug,tokens] of Object.entries(cases)) {
 const content=readFileSync(new URL(`../app/${slug}/page.tsx`,import.meta.url),'utf8');
 assert(!/if\s*\(cms\?\.sections\.length\)\s*return\s*<PublicLayout>/.test(content),`${slug} still replaces bespoke layout`);
 assert(content.includes('{cms?.sections.length ? <SectionsView sections={cms.sections}/> : null}'),`${slug} does not append CMS sections`);
 for(const token of tokens) assert(content.includes(token),`${slug} lost expected bespoke content: ${token}`);
 console.log(`PASS: ${slug} preserves bespoke content and appends optional CMS sections`);
}

