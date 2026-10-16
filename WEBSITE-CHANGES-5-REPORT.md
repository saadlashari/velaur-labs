# VELAUR LABS — Website Changes (5)

16 October 2026. Implemented in the existing Next.js project. No production deployment was performed. This report supersedes earlier release reports for the changes listed below; older evidence remains historical.

## Delivered

1. **30px section gaps:** a shared public content stack applies 30px top/bottom section padding plus one 30px gap between visible sections on the homepage, inner pages and published custom sections. Old global spacing values normalize to 30px. The admin displays this policy and accepts 30px for both spacing fields. Internal card padding stays separate.
2. **Portfolio alignment:** SalesFox and MyYogi retain the original desktop image-quadrant composition, with their headings, category, summary and CTA sharing a left edge in the right-hand text column. Phone layouts retain complete images with `object-fit: contain`. The owner-supplied SalesFox dashboard image remains included.
3. **Easy formatting:** selecting a preview element and clicking Edit exposes Text formatting immediately, with alignment and font size controls for desktop, tablet and mobile. The existing draft, preview, publish, reset and revision workflows remain connected.
4. **Process icons:** each of the five supporting-detail card headings has its relevant phase icon. The original five phase titles, descriptions, deliverables and twenty supporting points remain unchanged. The arc and scroll emphasis remain in place; supporting details work with keyboard Enter.
5. **Why VELAUR:** the V orb moves rightward within its desktop intro column and stays centered on phones.
6. **Social profiles:** Pinterest now has an icon, admin field and HTTPS/domain validation. YouTube remains configurable through the same workflow. Facebook, Instagram and LinkedIn retain the supplied owner URLs. At the owner’s later explicit request, YouTube and Pinterest now use https://www.youtube.com/ and https://www.pinterest.com/ as platform placeholders. They appear in the footer and remain editable in admin. TikTok stays empty/hidden; no account-specific profile URLs were invented.
7. **Original-color PNG hover:** complete transparent brand PNGs use muted grayscale in the normal state and reveal their original colors on hover/focus. The surrounding button background remains neutral in light and dark modes. The PNGs are bundled locally and their sources/licenses are recorded in `public/social-icons/NOTICE.md`. All twelve configured PNG focus cases (six platforms × two themes), normal filters, decoded image sizes and neutral backgrounds were checked; actual pointer-hover states were also verified in both themes.
8. **Card rhythm:** Mission/Vision cards have consistent padding, readable line height and responsive spacing; adjacent sections use the same 30px policy.
9. **Our Work:** four expandable discovery groups expose all 21 current services and five Growth Solutions, alongside the existing project categories and approved portfolio browser. Service names/visibility follow published admin service records. New discovery heading/copy can be selected in the visual editor. No marketing/growth case studies, metrics or testimonials were fabricated.
10. **Transparent branding:** vector-backed transparent PNG wordmarks and V symbol replace opaque rectangles in the navbar, footer and admin. Light mode uses dark lettering while preserving the gradient brand colors. The favicon and Apple icon have transparent backgrounds. Fresh image URLs avoid stale optimized-image caches. Editable vector sources and the local PNG generation script are included.

## Verification

| Check | Result and evidence |
|---|---|
| Production build | Pass, `verification/changes5-production-build.log` |
| TypeScript | Pass, `verification/changes5-typecheck.log` |
| Lint | 0 errors; 20 existing image/test-adapter warnings, `verification/changes5-lint.log` |
| Automated regression tests | 14/14 suites pass; includes process icons, Pinterest/lookalike validation, 30px policy and prominent formatting controls. `verification/automated-tests.json` and `changes5-tests.log` |
| Public HTTP | 89 checks pass: 83 public pages, sitemap/robots, four anonymous admin API denials. `verification/production-http.json` |
| Internal links | 83 pages and 117 unique internal destinations pass. `verification/public-links.json` |
| Service SEO | 31 service/category/solution routes pass unique metadata, canonical, H1, breadcrumb, fragment and sitemap checks. `verification/agency-seo-http.json` |
| Browser layouts | 498 local Chromium route cases: 83 pages × 390, 820 and 1440px × light/dark. No document overflow, missing H1, non-30px top/bottom section padding, non-30px adjacent section gaps or detected failed loaded images. Theme initialization was awaited on every route. `verification/changes5-responsive.json` |
| Admin layouts | 44 local cases: 11 admin pages × phone/desktop × light/dark, with no document overflow. `verification/changes5-admin.json`; owner-requested YouTube/Pinterest placeholders were also published through the actual admin UI on the final build |
| Actual admin publication | Selected SalesFox, set 26px/left, saved draft, verified preview, published and verified the website; then reset and republished. Local disposable data only. `verification/changes5-admin.json`; owner-requested YouTube/Pinterest placeholders were also published through the actual admin UI on the final build |
| Process interaction | Five detail-heading icons, five phase cards, complete mobile images and keyboard open/close verified in the browser; observer/CMS rerender behavior covered in automated tests. |
| PNG transparency | Alpha ranges include 0 and 255 for both wordmarks, V symbol and favicon. `verification/changes5-assets.json` |

Ten additional final homepage cases at 320, 390, 820, 1440 and 1920px, in both themes, verify text-column edges, 30px padding/gaps, uncropped mobile image fit and all seven footer links; see `verification/changes5-final-home.json`. Current screenshots beginning `changes5-proof-` accompany the evidence.

## Configuration and limits

- **No Neon schema migration is required for this update.** Pinterest uses the existing global settings table; no schema or dependency changes were introduced.
- The local browser server uses a disposable PostgreSQL-compatible test fixture. Real Neon connectivity, Cloudinary uploads, Resend delivery, booking completion and hosted backup/restore were not re-certified. Resend is still unconfigured. The existing integration unit/transaction tests passed; these do not establish real provider delivery.
- YouTube and Pinterest currently lead to the platform homepages as explicitly requested placeholders. Replace them with the actual account URLs in admin when available.
- Checks used emulated browser viewports, not physical phones or a full Safari/Firefox/device lab. Full-page image scans identify failed loaded images, not every possible third-party outage. External portfolio/store links retain their earlier verification status and were not newly certified in this update.
- No claim of 100% verification is made. The release ZIP excludes secrets, dependencies, build output and disposable QA server helpers. Historical reports describe earlier checks and must not be read as new live-provider verification.

## Review and run

Website: `/`. Admin: `/admin/login`, with the visual editor at `/admin/design`. Use the existing real environment configuration privately. Run `npm ci`, `npm run dev`, or `npm run build` then `npm start`. On the restricted Windows filesystem, `npm run build:portable` uses the included compatibility shim. `npm test`, `npm run lint` and `npm run typecheck` reproduce the source checks. The local disposable QA account is not shipped as a production account.
