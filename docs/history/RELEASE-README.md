# VELAUR LABS — single release candidate (13 October 2026)

This archive consolidates the prior project plus further fixes. It is **not production-verified**. Do not assume 100% completion based on source-code syntax parsing.

## What's included
- Separate public routes for Home, About, Services overview, eight individual service pages, Our Work, portfolio categories, project details, Blog and individual articles, Contact, legal pages.
- Original supplied logo assets and compact two-column hover Services dropdown, with mobile accordion.
- Server-rendered contact page with a client-only inquiry form (avoids importing an async Server Component inside a Client Component).
- Admin CMS endpoints and views for pages/sections, services/projects/blog, inquiries, approvals, settings and users. Site content fetched from Neon only when published.
- CMS page layouts for Home, About, Services, Work and Blog replace—not duplicate—the curated fallback content once a published page has at least one visible section. Contact always retains its inquiry form.
- Cloudinary-backed media upload endpoint and responsive media browser in `/admin/media`, guarded by admin permissions. JPG/PNG/WebP/AVIF up to 8 MB.
- ESLint package subpath imports updated with `.js` suffix to address the previously observed Netlify module-resolution error.

## Required configuration
1. Provision Neon PostgreSQL and apply `db/schema.sql` to a fresh database. **Back up an existing database before running any schema changes.**
2. Set `DATABASE_URL`, `AUTH_SECRET` (32+ random bytes), `BOOTSTRAP_SECRET` (separate random secret) and `APP_URL` (exact live URL, HTTPS) in Netlify environment variables. **Never paste secrets into chat.**
3. Optional email: `RESEND_API_KEY`, `VERIFIED_SENDER_EMAIL` from a verified domain. Without them, saving an inquiry does not imply notification email delivery.
4. Optional image upload: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Without them, `/admin/media` explains that storage is unconfigured.
5. Netlify should detect Next.js. Build command `npm run build`. **Clear the custom Publish directory in Netlify UI**; don't set it to repository root or `.next` when Next.js runtime plugin manages output. Use `netlify.toml` in this project and remove conflicting UI overrides.
6. Run `npm install`, `npm run typecheck`, `npm run build`, then local smoke tests (see below) before deploying. There is no lockfile in the inherited source: generate and commit package-lock.json after an install succeeds.

## Required end-to-end QA before launch
- Check `/`, `/about`, `/services`, all 8 `/services/<slug>` URLs, `/work` and 3 categories, `/blog`, `/contact` and legal pages.
- Check desktop hover dropdown, keyboard focus + Escape, mobile hamburger accordion at 320/375/768/1024 px, images and no horizontal overflow.
- Bootstrap an admin, enable and verify 2FA, sign out/in; test roles with restricted permission and publishing approvals.
- Create draft pages, services, articles and projects; confirm no draft leaks publicly; publish, reload and confirm content is visible at its dedicated URL.
- Upload a test image (requires Cloudinary configured), use the provided public URL in a CMS image field, confirm site rendering and alt text.
- Submit a test contact inquiry; confirm record in Neon and test delivery/logging of admin/visitor email separately.
- Test rollback and backups externally: automatic backups/restores **are not yet implemented by this source**. Configure verified provider-level Neon backups before business-critical use.
- Verify actual third-party project/live/Figma URLs and get publishing permission; no fake portfolio achievements should be inserted.

## Known limits
- Full browser/device responsiveness, live Neon access, email delivery, Next.js production build, and Netlify deployment could not be verified in this environment due to dependency registry access issues and absent production credentials.
- The page builder supports structured sections and ordering, not fully drag-and-drop freeform editing; its preview is simplified.
- Cloudinary requires separate credentials/account. Media deletion/replacement and recovery aren't implemented.
- Real project case studies, blog content and portfolio media must be populated/approved from your verified materials; they are not fabricated.

## Source integrity checks executed
- All app/lib `.ts` and `.tsx` source files parsed using globally installed TypeScript; zero parsing errors at packaging time.
- The ZIP was checked with archive integrity test after creation.
