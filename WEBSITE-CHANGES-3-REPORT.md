# VELAUR LABS — Website Changes (3)

15 October 2026. Implemented in the existing application following the user's approval of Website Changes (3).docx. This is the current release report; previous reports and screenshots are historical. No production deployment or 100% certification is claimed.

## Delivered changes

1. Restored the original four-card, 2×2 portfolio composition with a central circle made from four image quadrants on desktop. Added a blue border around image frames including LEC CRM, readable project summaries and clear View project buttons. Mobile uses stacked cards and complete images fitted inside rectangular frames, without circular cropping. The supplied SalesFox dashboard image is retained. No private dashboard or performance proof was fabricated.
2. Homepage capability cards place each icon beside its heading, with consistent shaped containers and spacing. All four agency groups remain connected to their overview pages.
3. Replaced process tabs and playback with five alternating illustration/content scenes. Scrolling emphasizes the most visible stage through an intersection observer; there is no timer, Play/Pause control or scroll interception. All five original process titles, descriptions and deliverables are unchanged. Four supporting points per phase are separately editable. All stages remain readable without animation, and reduced-motion styles disable decorative motion.
4. Footer uses recognizable branded social icons. Facebook, Instagram and LinkedIn use the URLs supplied by the owner; email and WhatsApp retain their existing destinations. TikTok and YouTube are deliberately blank and hidden until configured in admin. HTTPS platform-domain validation prevents unrelated destinations in these fields. Availability of external social profiles is not certified.
5. Footer navigation now organizes all 21 services and five Growth Solutions into their four agency groups, alongside Explore. Group labels, order and visibility are editable.
6. About and other inner pages receive relevant, reusable brand illustrations and subtle decorative motion, with a shared admin enable/disable control. Visuals use native markup and the existing icon family. They contain no invented client statistics or product screenshots.
7. Improved spacing between cards and groups and expanded default Home/About/footer copy and metadata to reflect technology, business development and digital growth. Existing saved copy remains authoritative. Original Why VELAUR and article definitions are preserved.

## Admin connection and controls

Open Visual editor (`/admin/design`) or Site settings (`/admin/settings`) and use Structure:

- Home → Process phase points: expand the named phase, then a point to edit it. Home process steps controls the original titles, descriptions, deliverables and phase order. Reordering steps also remaps their supporting points; the separate phase-points editor cannot independently move whole phases.
- Home → Homepage capability cards / Homepage layout & card colors: manage capability content and presentation. Featured project selection remains connected to the public portfolio.
- Footer → Footer service groups: set group labels, visibility and order. The older limited footer-services field is retained for compatibility and removed from the current designer controls.
- Social links: manage LinkedIn, Instagram, Facebook, TikTok and YouTube. Leave unavailable platforms empty.
- Page visuals → Inner page hero illustrations: turn inner-page artwork on or off. Disabled artwork also removes the empty visual column.

Save draft and Publish changes retain existing publication permissions, revisions and approval behavior. Original inline content controls, page builder, hide/show, restore and content library remain. The local browser test published a phase point and illustration toggle, verified public output, then restored approved values. Integration tests also exercise publication of the new footer/social/phase settings.

## Verification results

| Check | Result |
|---|---|
| Automated tests | 14/14 suites pass on the final source, covering settings validation/publication, process observer activation/cleanup and CMS updates, builder editing, exports/recovery, security checks and public rendering |
| Production build | Pass using the existing Windows portable build wrapper |
| TypeScript | Pass |
| Lint | 0 errors, 21 warnings; image optimization and test-adapter warnings remain |
| Public HTTP | 89 checks pass: 83 public routes, sitemap, robots and four anonymous admin API denials |
| Internal destinations | 83 pages / 117 internal destinations checked; pass |
| Agency SEO | 31 metadata/canonical checks pass |
| Responsive public routes | 498 browser cases: 83 routes × 390/820/1440 viewport widths × light/dark; one H1, no document overflow, clipped checked text or broken loaded images |
| Inner-page visuals | Present on all 82 inner routes in the six viewport/theme combinations |
| Process scrolling | All five stages activate after native anchor scrolling at each viewport/theme combination: 30 state checks. Manual page scrolling was also inspected; there are no phase-selection controls |
| Admin responsive themes | Final designer checked at 390 and 1440 widths in light/dark; no document overflow. Actual publish/public-output/restore flow verified using disposable local data |
| Portfolio images | Four mobile featured images loaded with contain fitting; complete frames inspected in screenshots. Desktop original quadrant composition inspected |
| Content preservation | Original process/Why definitions, articles, service catalogs, approved portfolio JSON, SalesFox asset, schema, lockfile and Netlify configuration preserved against the previous ZIP |
| Media integrity | 58 gallery assets across 36 of 38 approved project records retain verified hashes. RootPointers and Trader Metrix remain artwork-only |
| ZIP | Reopened and CRC-tested; every included file verified against a SHA-256 manifest |

Evidence for this release uses `changes3-*` in `verification/`, with current `automated-tests.*`, `production-http.json`, `public-links.json`, `agency-seo-http.json` and `media-integrity.json`. Full-page captures and clearly named crops show portfolio and page context. The final change after the 498-case public sweep only prevents independent phase-array reordering in the admin; the final build, all suites, HTTP checks and designer phone/desktop checks were rerun afterward.

These are local Chromium viewport checks, not physical-device, Safari/Firefox or complete accessibility certification. The browser console checked during the final home/process journey had no captured application errors. Loaded-image checks do not certify every remote media source.

## Existing installation and provider configuration

No Neon schema migration or database reset is needed. Keep the working database and private environment configuration. New settings have defaults in the existing settings store; custom saved text and settings are not overwritten. If an older installation already saved empty social values or older agency copy, update those fields through admin and publish. The three supplied social URLs are included as source defaults; TikTok and YouTube stay empty as requested.

Hosted Neon connectivity, Cloudinary uploads, real Resend delivery, actual calendar bookings and native hosted database restore still require staging verification with the working environment. Resend needs the account and verified sender discussed earlier. A saved local inquiry is not proof of email delivery or a confirmed booking. Existing security and backup features are retained; no external backup transmission, new schedule or production mutation was performed. Earlier dependency-audit qualifications remain: the unchanged lockfile had five high development-tool advisories in the ESLint chain; no fresh online audit is claimed.

## Running and reviewing

Use Node.js 20.9+ and `npm ci`, then configure `.env.local` privately from `.env.example`. Use `npm run dev`, or `npm run build` followed by `npm start`. Restricted Windows filesystems can use `npm run build:portable`. Reproduce checks with `npm run lint`, `npm run typecheck` and `npm test`; HTTP checks need a running local production preview.

The ZIP includes the complete updated website/admin source, assets, schema, dependency lock, reports and verification evidence. It excludes node_modules, build output, private environment files, private backups and disposable QA accounts/server helpers. Review the local changes before staging or production deployment.
