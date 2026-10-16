# VELAUR LABS — Locked scope progress (October 2026)

## Implemented in this consolidated source update
- Home: exactly 3 featured service cards (AI/Web/Mobile).
- Home: 4 category-linked project highlight cards (LEC CRM, SalesFox, Evolve Training, MyYogi) when no verified published project records exist; these are **not** claimed as finished case studies.
- Home: vertical five-step How We Work.
- Blog: 4 original long-form launch articles with distinct local SVG cover art; individual SEO-addressable URLs and category filters. If published CMS blog records exist, those are preferred.
- Navbar: compact 2-column services menu with no View All link inside the hover panel.
- Floating WhatsApp: call-style icon with compact single ring.
- Favicon: derives from existing user-supplied symbol asset.
- Readability, hero spacing, mobile card layouts and editorial styles improved.

## Existing source functionality requiring deployment QA
- Public separate routes for Home, About, Services, eight service details, Work categories, project details, Blog, articles and Contact.
- Admin routes for Pages & Sections, Services/Projects/Blog CMS, Media, Users, Profile, Approvals, Inquiries, Settings.
- Existing security, database and integrations must be tested with real Neon credentials before considering production ready.

## Critical NOT yet verified/implemented to requested 100% level
- No end-to-end Netlify production build or browser QA completed in this environment.
- Existing static homepage components remain outside the full drag-and-drop builder; published CMS layouts can replace the page, but this is not universal inline editing.
- Site-wide every-property editable navbar/footer/floating-button builder is not complete.
- Verified screenshots, complete case-study claims and exact app-store URLs for all 37 portfolio entries have not been established; do not invent.
- Admin workflows, 2FA, secure SVG upload, email delivery and automated backup/restore require complete end-to-end tests.

## Deployment
1. Do not reset Neon tables.
2. Configure DATABASE_URL, AUTH_SECRET, BOOTSTRAP_SECRET, APP_URL as appropriate. Never expose secrets.
3. Netlify build command: npm run build. Use Next.js runtime and avoid setting publish to site root.
4. Verify npm run build, contact, auth, CRUD, desktop/mobile pages, both themes and email/media integrations on staging before production.

## Additional work in this build
- Floating contact widget: configurable action (WhatsApp/call/email/custom URL), icon, trusted HTTPS SVG URL, size, side, offsets, colors, border radius, glow, tooltip and page visibility. Settings are saved to existing global_settings JSONB entries. Arbitrary pasted SVG source is not accepted.
- Admin profile: separate avatar upload/remove API using configured Cloudinary storage, avatar shown in admin dashboard sidebar, logout stays server-side. Uses existing global_settings key per admin ID; no schema migration.
- Blog launch content: 4 original articles render when no published CMS articles exist. These are code-based fallback articles, not automatically editable in Blog CMS until imported as CMS records.
- When the Projects table has published content, it is prioritized over the four illustrative featured-category fallback cards; the latter intentionally do not link to unverified project detail pages.

## Build attempts
- TypeScript/TSX syntax transpilation: 63 files parsed with 0 syntax errors.
- `npm install` blocked by DNS EAI_AGAIN for registry.npmjs.org in this runtime. No full Next.js production build has been completed; Netlify must run `npm run build` to expose any type/lint/runtime issues.
