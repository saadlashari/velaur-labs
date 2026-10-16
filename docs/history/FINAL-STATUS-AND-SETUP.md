# VELAUR LABS — Consolidated source work and verification

This source includes the original logo assets, independent Home/About/Services/Work/Blog/Contact routes, eight individual service slugs, dynamic project and article URLs, responsive public navigation, CMS pages/sections/content APIs, permissions, approvals, and inquiry intake. These are source-code implementations, NOT confirmed production behavior.

## Improvements made in this batch
- Replaced the previous misleading sample-data admin landing with `/admin` reading live `/api/admin/overview` metrics and real audit entries. Database unavailable shows an explicit error instead of invented values.
- Added a usable `/admin/inquiries` workspace to search/filter real enquiries, read details, change status/priority, and save internal notes and follow-up dates through existing protected PATCH endpoint.
- Added `/admin/users` workspace for sub-admin creation and module/action permissions using the existing protected users API; supports disabling users and revoking sessions.
- Fixed API authorization action mismatch (`READ`→`VIEW`, `UPDATE`→`EDIT`) so custom sub-admin permissions apply consistently; added missing `projects` to configurable user permissions.
- Added independent responsive admin dashboard/mobile drawer, inquiry editor and permissions styling.
- Added `robots.ts` and published-content-aware `sitemap.ts`.

## Not complete / cannot truthfully be marked 100% verified
- No valid production DATABASE_URL/auth secrets, email-provider credentials, media storage access, or Netlify account session in this execution environment. These must be configured/verified by authorized account owner. Do not paste secrets into a chat.
- `npm install` failed because registry.npmjs.org returned DNS `EAI_AGAIN`. Consequently Next.js build, lint/typecheck, browser functional tests and live production deployment could not be completed here. TypeScript **syntax parse only** was validated; it is not a semantic typecheck or build.
- Media upload/provider configuration, backup-and-restore, end-to-end email delivery, real drag-drop layout editor, published-preview isolation, production QA, accessible responsive device QA and security review remain incomplete.
- Some page content remains generic. User project URLs were mentioned previously, but live ownership/links and content permissions must be checked before inserting client case studies; no fake published work has been added.
- Original logo header asset is `public/velaur-symbol.png` and `public/velaur-wordmark.png`, derived from supplied `Logo.jpeg` in previous passes. Verify both in browser before publishing.

## Deployment prerequisites
1. Install Node 22 and `npm ci` (or `npm install` if no lockfile) with network connectivity.
2. Set `DATABASE_URL`, `AUTH_SECRET`, `BOOTSTRAP_SECRET`, and `APP_URL` in Netlify securely. `APP_URL` must equal the actual deployed origin; do not use localhost on production.
3. Apply `db/schema.sql` in Neon (check compatibility with existing database).
4. Run `npm run typecheck`, `npm run lint`, `npm run build`; fix any errors.
5. Use Netlify Next.js runtime/plugin; do not set the Netlify publish directory to the site root. Remove contradictory UI publish overrides.
6. Check all routes, publish/edit/approval flows with real role accounts, forms/email via real provider, mobile widths 320/375/390/768/1024px, keyboard navigation, dark/light mode and backups.
7. Only mark as complete when production tests pass.
