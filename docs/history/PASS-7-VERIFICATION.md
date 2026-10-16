# VELAUR LABS – Pass 7 verification and handover

## Code changes in this pass
- `/work`: category links PLUS actual published-project listing and project detail links. No fabricated items.
- `/blog`: separate blog page with server-side category filtering (`?category=`), standalone published article routes retained.
- `/services/[slug]`: 8 dedicated service URLs now include deliverables/outcomes, FAQs, related services, discovery process and CTA; content and metadata from published CMS records retained.
- Page hero: removed a hardcoded third-party scheduling URL unrelated to global settings; replaced with contact CTA pending verified scheduling config.
- Responsive CSS added for service cards, blog filters, 320px layouts and reduced-motion support.

## Independent routes in source
- `app/about/page.tsx`
- `app/admin/approvals/page.tsx`
- `app/admin/content/page.tsx`
- `app/admin/login/page.tsx`
- `app/admin/page.tsx`
- `app/admin/pages/page.tsx`
- `app/admin/settings/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/blog/page.tsx`
- `app/contact/page.tsx`
- `app/page.tsx`
- `app/pages/[slug]/page.tsx`
- `app/privacy-policy/page.tsx`
- `app/services/[slug]/page.tsx`
- `app/services/page.tsx`
- `app/terms-of-service/page.tsx`
- `app/work/mobile-apps/page.tsx`
- `app/work/page.tsx`
- `app/work/projects/[slug]/page.tsx`
- `app/work/web-applications/page.tsx`
- `app/work/websites/page.tsx`

## Known limitations — not signed off as complete
- Full `next build` and cross-device browser verification are NOT passed (dependencies are not installed in this sandbox).
- Neon authenticated CRUD, email-provider delivery and Netlify deployment are NOT end-to-end tested.
- CMS still does NOT offer a full drag-and-drop visual page builder or complete media/backup system.
- The 3D hero is CSS/decorative, not a verified production-quality interactive scene.
- Published project/blog listings require actual published records in Neon; empty states intentionally do not invent work.
- Existing static public sections coexist with CMS sections; the CMS does not yet replace/reorder all original sections.

## Acceptance rules
Do not mark a feature complete without browser testing at 320/375/768/1024/1440 widths, real authenticated CRUD and publish/revert tests, production build and deployment smoke test. Never expose `.env` or secrets in ZIP.
