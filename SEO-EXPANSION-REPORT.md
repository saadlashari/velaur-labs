# VELAUR LABS — Expanded service SEO verification

16 October 2026. Consolidated source release built on Website Changes (5) and the search-branding update. No production deployment was performed. Remote and international clients remain the primary audience; the existing Multan office is secondary business context.

## Implemented

| Coverage | Pages |
| --- | ---: |
| AI and software services | 8 |
| Business development services | 6 |
| Digital marketing and growth services | 7 |
| Service category overviews | 3 |
| Growth Solutions | 5 |
| Main website and portfolio overview pages | 12 |
| Total pages in the new SEO workspace | 41 |

- 252 phrase placements covering 248 distinct suggested search phrases. These are editorial intent targets, not measured keyword volumes or promised rankings. Full mapping: `verification/seo-keyword-page-map.csv` and `data/seo-pages.json`.
- Explicit coverage for Upwork handling, profile optimization, proposal writing, bidding management, agency support, outsourced business development, B2B prospecting, LinkedIn outreach, cold email, appointment setting, CRM/sales automation and all other published services.
- Unique page titles and descriptions, canonical URLs, Open Graph and Twitter metadata, plus a branded 1200×630 social preview. The homepage title explicitly retains VELAUR LABS.
- Two distinct, visible service-scope and remote-collaboration blocks on each of 21 services, 3 categories and 5 solutions. Existing approved process copy, portfolio layout and original service profiles are preserved. No invented testimonials, certifications, commercial results or ranking guarantees.
- Service structured data with worldwide delivery context on those 29 pages, plus relevant links to published related services and coordinated Growth Solutions. Existing brand schema, stable favicon, breadcrumbs and inquiry CTAs remain in place.
- The keyword list is an admin planning aid. It is not emitted as a meta-keywords tag or a public keyword dump. No duplicate city or synonym doorway pages were created.
- Portfolio and article metadata now read their saved Content library SEO fields and emit canonical/social metadata. New or custom service records still have a title/description fallback.
- Corrected the existing admin light-logo inversion and dark logo background so transparent theme-appropriate assets remain readable.

## Admin: Search & SEO

Open `/admin/seo`, or use Website → Search & SEO in the admin sidebar. Search by service name or phrase. Select a page to edit the SEO title, description, indexing permission, planning phrases and applicable supporting content. Add/remove content blocks, restore defaults, save an SEO draft or publish it. The illustrative preview does not claim to reproduce Google's actual result.

SEO drafts and revision history use separate records from visual-editor drafts. Saves retain prior versions; a version can be loaded into the editor before saving/publishing. Optimistic version checks and live-setting fingerprints reject stale writes. Server-side VIEW, EDIT and PUBLISH permissions and origin checks remain required. The SEO endpoint accepts only the SEO settings key and known public routes. Raw SEO JSON is excluded from the visual editor, which links to this workspace instead.

An explicit Search & SEO override takes precedence over the published Content library SEO fields for an individual service; otherwise Content library overrides remain a fallback ahead of the bundled defaults. Portfolio and article SEO remain in Content library. Turning search visibility off adds noindex/follow and removes the managed URL from the sitemap; it does not remove the public page from the website. Google still needs to recrawl for an indexed result to change.

## Verification

- Production build passed on Next.js 15.5.27, including its type validation. Standalone type check also passed during implementation.
- All 14 automated suites passed on the packaged source. The integration suite includes 146 actual-handler assertions against disposable PostgreSQL-compatible PGlite, including SEO publication, draft isolation, stale-write rejection, unrelated-setting rejection, foreign-origin rejection, metadata/noindex changes, sitemap removal/restoration and permission/anonymous denial.
- Full lint passed with zero errors and 20 existing image/test-adapter warnings. New SEO code also passed targeted lint.
- 83 public routes passed production HTML checks: branding, metadata, canonical URLs, one H1, Open Graph/Twitter images, rendered content and sitemap inclusion. All 41 managed titles/descriptions were distinct. All 29 service/category/solution schemas parsed and identified worldwide service delivery.
- 117 internal destinations across 83 pages passed the existing link checker; the service/category/solution SEO checker passed 31 checks.
- 246 browser cases covered all 41 managed pages at 390px mobile, 820px tablet and 1440px desktop, each in light and dark mode. No horizontal overflow, clipped new content or broken loaded images were detected. The shared 30px layout gap and section top/bottom padding remained intact. These checks inspect rendered layout and loaded images, not every possible scroll state or physical device.
- Eight expanded-admin layout cases covered 320/390/820/1440px in both modes. No horizontal overflow, and the light logo filter/background were corrected. Representative screenshots were visually reviewed.
- Actual admin UI draft save kept the test title/content/noindex private; publication updated local HTML and sitemap; defaults were restored. Revision loading and multiline phrase editing were exercised. The final preview uses a fresh disposable test database with approved defaults.
- The Upwork discovery CTA opened the existing contact form with Upwork Profile & Bidding Management preselected. Form fields, consent and server-side failure behavior remain covered by the existing suites; no actual marketing message was sent.
- Final public/admin browser logs contained no captured errors or warnings during the recorded checks.
- SHA-256 preservation checks confirmed the approved portfolio, original service/solution data, homepage process component/data, database schema and package manifests are unchanged. No Neon schema migration or new dependency is required.

Evidence is in `verification/seo-*.json`, `seo-expansion-build.log`, `seo-expansion-tests.log`, `seo-expansion-lint.log`, `seo-integration-final.log`, `automated-tests.json`, `agency-seo-http.json`, `public-links.json` and the included screenshots. A long browser batch timed out; incomplete in-memory results were discarded and the recorded matrix was completed in checkpointed batches. Older release reports/matrices are historical evidence, not substitutes for this update's checks.

## Production configuration and practical limits

Deploy this source through the existing approved deployment workflow after review, retaining production environment variables and data. This delivery does not contain real credentials, a production database export, dependencies or build caches. Production Neon, Cloudinary, Resend and provider delivery were not exercised with real credentials. The local preview uses a disposable test database and is not connected to production content.

After publication, use the verified Search Console property to inspect the homepage and changed service URLs and submit `https://velaurlabs.com/sitemap.xml`. Search Console ownership, Google indexing requests, actual SERP rendering, traffic, keyword competition/volume and ranking performance were not verified. Genuine case-study expansion, editorial work, business-profile maintenance and relevant earned links remain ongoing marketing work rather than completed outcomes of a source change.

The owner confirmed an office near MDA Chowk in Multan and an existing Google business listing. No precise address, opening hours or coordinates were guessed, no duplicate business listing was created, and no city-heavy homepage/service titles were introduced. Keep the existing profile accurate while presenting the agency as a remote international partner.

This release makes the website technically and editorially clearer for the listed services. It does not guarantee indexing, a specific rank, traffic, leads or revenue. No physical-device, Safari/Firefox, exhaustive accessibility or independent Google Rich Results certification is claimed.

## Primary references

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google spam policies: keyword stuffing and doorway abuse](https://developers.google.com/search/docs/essentials/spam-policies)
- [Google favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [Google site-name structured data](https://developers.google.com/search/docs/appearance/site-names)
- [Google local ranking guidance](https://support.google.com/business/answer/7091)
- [Upwork agency proposals and supported roles](https://support.upwork.com/hc/en-us/articles/360009524274-How-to-manage-your-agency-proposals-and-offers)
