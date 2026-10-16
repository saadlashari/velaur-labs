# Current release: Process connectors and card alignment — 17 October 2026

Read `PROCESS-ALIGNMENT-REPORT.md` for the current release. Connected phase lines, linked arc/heading hover, keyboard focus and mobile-width selection are implemented with unchanged process content. Shared card tracks align headings, copy and CTAs. Final build, TypeScript, 14 suites, 20 distinct linked hover cases and 498 responsive page/theme/width cases passed. Lint has zero errors and 23 warnings. No production deployment or database migration performed. Historical reports follow below.

# Current release: Hover and grid-border fixes — 16 October 2026

Read `HOVER-INTERACTION-REPORT.md` for this update and its verification limits. Shared public hover/focus feedback is consistent across cards, actions, links, menus and disclosures. The owner-approved extra top/left service-grid line is removed while card borders remain. Production build, 14 suites, 48 pointer states across 24 component families and 498 responsive cases passed. Two long-session console observations did not recur in a fresh 83-page recheck; they are documented rather than claimed fixed. No production deployment or Neon migration performed. Older release reports below are historical.

# Current release: Premium sharing image — 16 October 2026

Read `PREMIUM-SHARING-REPORT.md` for this update and its verification limits. The original website logo is used in a new sharing card with **Your Digital Partner** wording. Admin → Search & SEO → Link sharing image allows image upload/selection, URL, description, draft/publish and restore. Production build, 14 suites, 182 CMS integration checks and sharing metadata for 83 routes passed. Final browser retest was blocked after an app/browser reset; the report distinguishes completed tests from that limitation. No production deployment or Neon migration performed. Earlier release reports below are historical.

# Current release: SEO audit fixes — 16 October 2026

Read `SEO-AUDIT-FIXES-REPORT.md` for current changes, test evidence and remaining owner/external requirements. Admin → Search & SEO covers 83 pages and 290 editorial search phrases. Portfolio indexing stays enabled, with case-study review warnings. Article/project detail controls remain in Content library. Production build, 14 suites, 153 CMS integration checks and 498 public responsive cases passed. Lint has zero errors and 23 warnings. No production deployment or Neon migration was performed. Preserve live environment variables and data.

All older release headers and reports below are historical.

# Current release: Expanded service SEO — 16 October 2026

Read `SEO-EXPANSION-REPORT.md` for the current implementation, admin workflow, verification evidence and external configuration limits. This release includes Website Changes (5), search branding and the expanded remote-first SEO implementation. Earlier reports below are historical. No production deployment or Neon migration was performed.

Admin → Search & SEO manages 41 pages, with 248 distinct suggested search phrases. Article/project SEO remains in Content library. Preserve production environment variables and existing data when publishing.

# Search branding update — 16 October 2026

Read `SEO-BRANDING-REPORT.md` for the latest local metadata/favicon changes and current tests. The Website Changes (5) visual matrix below is prior-release evidence. No production deployment was performed.

# Current release: Website Changes (5)

16 October 2026. Read `WEBSITE-CHANGES-5-REPORT.md` for the implemented changes, admin controls, exact spacing policy, current test evidence and configuration limits. Earlier release reports are historical. No production deployment was performed.

Sections have 30px top/bottom padding and 30px between sections. Social PNGs match the footer in their normal muted state and reveal their original full colors on hover/focus; their button backgrounds stay neutral. YouTube and Pinterest use platform-homepage placeholders at the owner’s request, editable under Structure → Social links.

# VELAUR LABS — Technology, Business Development & Digital Growth

15 October 2026. Enhanced in place on the existing Next.js 15 application. Not deployed to production. Read `VISUAL-REDESIGN-REPORT.md` for current visual changes and results; `AGENCY-ENHANCEMENT-REPORT.md` records the earlier agency expansion and qualifications; historical reports are in `docs/history`.

## Run

Use Node.js 20.9+ and `npm ci`. Configure `.env.local` privately from `.env.example`. Use `npm run dev`, or `npm run build` then `npm start`. On the restricted Windows filesystem, `npm run build:portable` runs the normal compiler with the included compatibility shim. Netlify continues to use `npm run build` and its existing Next.js plugin.

Configure the existing PostgreSQL database, strong AUTH_SECRET, BOOTSTRAP_SECRET and actual APP_URL. No schema migration was introduced. For a fresh compatible schema, use the documented setup process; never overwrite a working database blindly. Initial owner setup starts at `/admin/login` using “Set up first Super Admin”, followed by authenticator enrollment.

## Agency content and routes

- `/services`: 21 services grouped into three categories, plus linked Growth Solutions.
- `/services/ai-software-development`, `/services/business-development`, `/services/digital-marketing-growth`: category overviews.
- `/services/<service-slug>`: shared service template. All original eight URLs remain unchanged.
- `/growth-solutions`: overview and five `/growth-solutions/<solution-slug>` landing pages.
- `lib/agency-navigation.ts`: lightweight category/menu/inquiry labels.
- `data/agency-services.json` and `data/growth-solutions.json`: centralized editorial content.
- `/admin/content`: services, projects and articles; default content appears without an import. Saved draft/trash rows keep matching public defaults hidden.
- `/admin/design`: original-page visual editing, including the new category and solution routes. Select content, use contextual Edit/Hide/Delete/Create, save a private draft and publish explicitly. Supported nested sections and layout blocks remain in `/admin/pages`.

The contact form preselects the originating service, validates input and only confirms an actually saved inquiry. Business website is stored in the existing inquiry details field. The separate hidden website field remains a spam trap. Real Resend delivery requires a configured account and verified sender. Booking links use existing settings; no appointment is claimed from an inquiry submission.

## Verify

Run `npm run lint`, `npm run typecheck`, `npm test` and the production build. With a local server running, run `node scripts/test-production-http.mjs`, `node scripts/test-public-links.mjs`, then `node scripts/test-agency-http.mjs`. Logs and 498 browser layout measurements are in `verification/`. No new dependency was added. Existing development-tool advisories and live-provider qualification limits are documented in the report.

## Portfolio, security and recovery

The 38-project approved inventory, available real screenshots, security controls, CMS roles/approvals, 2FA, private drafts and recovery tools are preserved. Detailed previous instructions are in `docs/history/README-20261014.md` and its verification report. A content export is not a full database backup. Native backup/restore requires compatible PostgreSQL tools and private configuration; perform a staging recovery drill before relying on it. No external backup upload or production schedule is active.


## Updated visual release

The latest document changes and supplied SalesFox screenshot are implemented. Manage the four homepage capability cards and layout/card colors in Structure → Home of `/admin/settings`. Manage project problem/solution/source notes and galleries in `/admin/content`. Read `VISUAL-REDESIGN-REPORT.md` before staging deployment. No Neon schema migration is required.
