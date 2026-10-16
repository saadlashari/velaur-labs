# Featured Work implementation

- Homepage renders four curated feature slots in saved order.
- When a selected slug belongs to a published project, the page uses the first validated HTTPS gallery image from `projects.content.gallery` as the cover.
- Each published project links to its real case-study route.
- Missing or unpublished project slots are clearly labelled as unpublished and point only to the related category; no fabricated case studies or screenshots.
- Images use lazy-loading, alt text fallback and contain/cover responsive sizing.

Verification: `node scripts/verify-source.mjs`, `node scripts/test-bespoke-page-preservation.mjs`, `node scripts/test-section-content-validation.mjs` passed. Full Next.js build and Neon integration NOT verified.

Outstanding: user-approved media for all portfolio projects, full bespoke visual editing and design polish, production build and E2E tests. Estimates held unchanged: Admin 83%, Website 63%, Overall 67%, Release QA 20%.
