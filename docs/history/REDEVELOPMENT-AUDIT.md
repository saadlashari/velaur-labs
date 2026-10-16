# VELAUR LABS — Redevelopment status

## Finalized requirements (baseline)
- [x] Preserve user's ORIGINAL uploaded VELAUR LABS logo (cropped assets derived directly from `Logo.jpeg`, original full image in `public/velaur-logo.jpeg`).
- [x] Separate public routes: `/`, `/about`, `/services`, `/work`, `/blog`, `/contact`, policy pages.
- [x] Separate 8 service detail routes, linked through the navbar.
- [x] Desktop compact two-column services card menu, icon + title + description, desktop hover/focus and mobile accordion.
- [x] Sticky transparent-to-glass navigation; Escape and outside-click close handling.
- [x] Portfolio category routes `/work/websites`, `/work/web-applications`, `/work/mobile-apps`, plus individual project detail route.
- [x] Blog listing and individual published article routes.
- [x] Additional content editor route `/admin/content` for Services, Projects, Blog.
- [x] Database CRUD API for those three modules with authentication, server-side permission checking, publication controls, audit trail and soft archive.
- [x] Public service details use published service overrides in Neon when present; fall back to previously supplied service content otherwise.
- [x] Published project / article pages load from Neon when configured; unpublished content excluded.
- [x] Add responsive CSS rules for navbar, mega menu and content editor.
- [x] Changed TS/TSX files pass TypeScript syntax/transpilation verification.

## Not completed or not independently verified — do not label these ready
- [ ] Full CMS for Pages, global sections, visual page builder with drag/reorder, reusable blocks, draft preview and revision rollback.
- [ ] Media uploading, storage configuration, asset management.
- [ ] Full approvals workflow, notifications, email provider setup, mail delivery/receipt testing.
- [ ] Full admin permission matrix, 2FA end-to-end, backups/restore.
- [ ] Actual published content and real case-study screenshots for portfolio: user verification required before inclusion.
- [ ] Original-final premium hero 3D product showcases and all detailed visual layouts.
- [ ] Comprehensive light-mode redesign for PUBLIC site.
- [ ] Test at mobile 320/375/390/768 and desktop 1280/1440 widths in a real browser.
- [ ] Full dependency-resolved TypeScript typecheck/Next production build: npm installation timed out in current environment.
- [ ] Database end-to-end test: no Neon credentials in current runtime.
- [ ] Netlify deployment: requires site access; no production deployment attempted.

## Important configuration
- `APP_URL` must EXACTLY match the deployed origin so authenticated mutations pass origin validation. Set the other required secrets and DATABASE_URL in Netlify; do not commit them.
- Apply included database schema to Neon if not already applied.
- Admin CMS `/admin/content` is behind the existing session gate and its API routes enforce permissions server-side.
- Content body editor supports plain paragraphs stored as JSONB; this is not the previously planned visual page builder.
- This is a DEVELOPMENT PASS, NOT the complete finished website.

## User approval gates and quality
- Zero fake client/project results. No invented review data.
- Every public nav path must resolve to a distinct route.
- Every admin action must have a real backend, or be labeled unavailable.
- Complete only after mobile/accessibility/security/build/DB tests are recorded.
