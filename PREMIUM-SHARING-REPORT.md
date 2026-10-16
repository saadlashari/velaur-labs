# VELAUR LABS — Premium sharing image and admin controls

16 October 2026. Current consolidated source release, including the earlier website/admin and SEO changes. No production deployment performed.

## Delivered

- New 1200×630 PNG link-preview image, 158,563 bytes. It uses the original website symbol and original VELAUR LABS wordmark as supplied PNG assets, preserving their colors and proportions. The original logo source files are unchanged.
- Approved wording: **Your Digital Partner**, with “Where Creativity Meets Technology.” and technology/business/digital-growth positioning. The new card uses the existing navy, blue, cyan and violet identity, restrained glass panels and generous spacing.
- Default asset: `public/brand/social-preview-premium.png`. A new image filename distinguishes this card from the prior preview. The older asset remains available for existing URLs.
- Admin → **Search & SEO → Link sharing image** provides a visible preview, existing media-library upload/selection, a public HTTPS image URL, image description and **Restore original sharing image**.
- Use **Save SEO draft** to keep the selection private, then **Publish SEO** to update website metadata. This is a site-wide image; individual page titles and descriptions remain page-specific. Restore resets the image and description without resetting unrelated page SEO edits.
- Published image settings are read by the shared metadata helper for public pages and populate both Open Graph and Twitter image/description fields. Known default dimensions are emitted; arbitrary custom image dimensions are not invented.
- Image URL validation rejects executable/insecure/protocol-relative URLs and URLs containing credentials. Settings use the existing permission-checked, revisioned SEO draft/publish workflow with origin checks, audit logging and optimistic conflict protection. Image settings are kept out of the visual editor's general field list to provide one clear editing location.
- Existing database/settings JSON columns are used. No schema migration or new package dependency is required.

## Verification

| Check | Result |
| --- | --- |
| Production build | Passed on Next.js 15.5.27 |
| Standalone type check | Passed |
| Lint | 0 errors, 23 warnings; not warning-free |
| Regression suites | 14/14 passed |
| Actual CMS/API integration | 182 checks passed using disposable PGlite-compatible storage |
| Public metadata and image delivery | All 83 pages passed: new image URL, approved alt wording, consistent Open Graph/Twitter image, correct default dimensions, one H1 preserved |
| Sitemap/SEO/Open Graph regression | All 83 routes passed the broader SEO checker |
| Admin responsive observations | 320/390/820/1440px, light and dark: 8 observed cases with the image loaded/fitting and no page/panel horizontal overflow |
| Admin interactions observed before reset | Picker opened/closed; a different public HTTPS image loaded in preview; Save SEO draft showed success |
| Original content/branding | Logo source PNGs, portfolio data, service/solution data, process component/copy, DB schema and package manifests unchanged against the prior ZIP |

The actual CMS/API tests verify a custom image stays private as a draft, reloads into the editor, publishes to page metadata, appears in both Open Graph and Twitter fields, preserves its description and restores the original image. Permission/conflict protections remain covered. These are actual handler/database integration tests; they are not represented as a completed final browser publication test.

The app/browser session reset during final browser work. Earlier responsive and interaction observations are recorded in `verification/sharing-image-browser-observations.json`, transcribed from the successful tool responses; its temporary raw file and screenshot were no longer available. A subsequent browser attempt was blocked by the browser URL security policy and was not bypassed. The final production preview was restarted with approved defaults and all 83 sharing-metadata/image HTTP checks were rerun successfully. No temporary demo image is published in the final local preview or bundled defaults.

Evidence: `verification/sharing-image-http.json`, `sharing-image-tests.log`, `sharing-image-build.log`, `sharing-image-typecheck.log`, `sharing-image-lint.log`, `sharing-image-browser-observations.json`, `sharing-image-preservation.json`, `automated-tests.json`, `automated-tests.log` and `seo-expansion-http.json`. Older responsive matrices/reports are prior-release evidence, not a claim of fresh full-site browser coverage for this small update.

## Use after deployment

1. Open Admin → Search & SEO → Link sharing image.
2. Choose/upload an image using the existing media storage, or paste a public HTTPS image URL. A 1200×630 PNG/JPG is recommended. Keep important text and the logo away from the edges.
3. Add a descriptive image description. Save a draft if you want to review it first.
4. Click Publish SEO when ready. Restore original sharing image returns to this premium card in the editor; publish separately to apply the reset.

Real Cloudinary upload/storage was not tested because provider credentials are absent from this isolated preview; the existing authenticated media picker and upload API are reused. Real WhatsApp/LinkedIn message delivery and platform cache refresh were not tested. Platforms decide when to fetch a link again and how to crop/display it. Deploy the source through the existing approved workflow before expecting the live domain's preview to change. No automatic deployment, Search Console submission or external message was performed. Secrets, private backups and local databases are excluded from this ZIP.
