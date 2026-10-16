# VELAUR LABS — Page Builder Preview Update

## Implemented in this source update
- Extracted the public CMS section rendering UI into `app/components/section-renderer.tsx` (shared by public pages and admin editor).
- Retained public pages' `PublishedSections`/`SectionsView` import API with a thin server-side data loader.
- Changed `/admin/pages` preview to render the **same** hero, CTA, cards, FAQ and image/text components as public CMS pages, including unsaved in-memory changes.
- Added preview-frame container-query responsive CSS for mobile and tablet widths, instead of a separate fake admin card renderer.
- Hidden sections are excluded from preview, and original save/revisions workflow is unchanged.

## Validation
- Syntax-transpilation check passed for the three changed/created TSX files.
- Full Next.js production build, authenticated Neon save/publish and real-browser QA were not verified here (npm install timed out).

## Still required for the locked scope
- Exact responsiveness across actual browsers, all bespoke/hardcoded components fully managed by the page builder, polished page-by-page redesign, full portfolio media and verified project links, complete controls for header/footer, DB backup/restore, comprehensive E2E and successful Netlify deploy.
- The admin preview uses the public **section components** and simulated viewport widths; it is not an iframe of the actual full public page (header/footer not part of the section canvas).

Do not treat this as a 100% complete production deliverable.
