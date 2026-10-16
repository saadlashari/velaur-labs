# VELAUR LABS — Public interaction and grid-border fixes

16 October 2026. Consolidated source release, including the premium sharing image/admin controls and earlier approved website changes. No production deployment performed.

## Fixed

- The reported L-shaped line came from the legacy `.services-grid` rule: a top border and a left border with no matching right/bottom border. The owner explicitly approved removing this outer grid border while preserving the individual rounded card borders. That source rule is now `border:0`; every rendered service grid in the responsive matrix had zero outer borders, while individual cards retain their borders.
- Added one shared public interaction stylesheet, loaded after theme/refinement styles. It covers service/scope cards, portfolio categories/projects, homepage capability/featured/reason/article cards, informational panels, primary/secondary actions, navigation, text links, related-service pills, filters, sharing controls and disclosures. Existing colors and layout are reused.
- Stronger light-theme text rules no longer suppress text-link/main-navigation hover colors. Hover feedback uses restrained accent borders, shadows, underline/color changes and small elevation on suitable cards/actions.
- Service-group disclosure labels already used the accent color, so changing only their color produced no visible hover feedback. A subtle underline now makes that state apparent; it was retested in both themes.
- Keyboard focus remains visible, with card `focus-within` feedback and clear disclosure focus styles. Disabled buttons do not elevate or brighten. Touch/no-hover and reduced-motion branches suppress hover movement; informational panels are not given fake click actions.
- Footer social PNGs keep their normal muted appearance and reveal original brand colors on hover/focus. This behavior was specifically checked rather than replaced with a generic link color effect.
- The admin visual editor's public preview loads the same shared styles. No extra content setting, database migration or dependency was needed. Admin-only layout/styles were not redesigned in this change.

## Verification

| Check | Result |
| --- | --- |
| Production build | Passed on Next.js 15.5.27 |
| Standalone type check | Passed |
| Lint | 0 errors, 23 warnings; not warning-free |
| Regression suites | 14/14 passed, including the existing 182-check actual CMS/API integration suite |
| Real pointer feedback | 24 shared component families × light/dark = 48 verified states; each target matched `:hover` and changed at least one visual property |
| Keyboard focus | Visible focus/outline observed in both themes |
| Responsive geometry | 498 cases: all 83 public pages at actual CSS widths 390/820/1440 in light and dark modes |
| Grid borders | Zero outer borders on all rendered service grids; individual card borders preserved |
| Layout preservation | No horizontal overflow, clipped checked text or broken loaded images; shared section gap stayed 30px in all 498 cases |
| Public route/SEO/image regression | 83 routes, internal destinations, optimized project images, canonical/schema checks and premium sharing metadata passed |
| Fresh browser console recheck | All 83 pages visited again with no captured error/warning messages |

Pointer tests used actual browser pointer movement via native input, followed by read-only computed-style observations. Coverage includes service cards and links, scope cards, primary/secondary/header actions, related-service pills, FAQs, service disclosures, category/portfolio cards, filters, article sharing, footer links, social PNGs, homepage capability/featured/reason/article cards and links, mission cards, navigation links and theme controls. Theme-control samples used the visible navigation control. Early samples with off-screen/hidden-target geometry were retried with visible targets; raw attempts are retained. The final deduplicated results are in `verification/hover-pointer-summary.json`.

The responsive viewport dimensions were calibrated against actual `innerWidth`/`innerHeight` because browser zoom affected requested dimensions. These are Chromium viewport checks, not certification on every physical device or browser. Touch/no-hover and reduced-motion fallback rules are implemented, but physical touch devices and an OS reduced-motion session were not separately exercised. Disabled/loading state behavior remains covered by the existing form/CMS suites; not every possible disabled control was physically hovered.

Two messages were captured during the long mixed pointer/viewport session: an animation-property exception and a React #418 hydration message. Neither was reproduced in a fresh complete 83-page console recheck. Their cause was not established, and they are **not claimed fixed** or silently discarded. The original observations are retained in `verification/hover-console.json`; the fresh per-page results are in `verification/hover-fresh-console.json`. React's [official #418 explanation](https://react.dev/errors/418) describes the hydration message; no unrelated hydration suppression was added.

Evidence: `verification/hover-pointer-cases.json`, `hover-pointer-summary.json`, `hover-keyboard-cases.json`, `hover-responsive.json`, `hover-console.json`, `hover-fresh-console.json`, `hover-grid-line-before.png`, `hover-grid-after-light.png`, `hover-grid-after-dark.png`, `hover-preservation.json`, `hover-build.log`, `hover-typecheck.log`, `hover-lint.log`, `hover-tests.log`, `automated-tests.json`, `seo-audit-http.json` and `sharing-image-http.json`.

## Preserved and deployment limits

Approved portfolio/service/solution data, original process content/component, original logos, premium “Your Digital Partner” sharing image, DB schema and package manifests match the previous release hashes. The base stylesheet differs only by the approved outer-grid border removal; interaction rules are isolated in `app/interaction-polish.css`. The 30px section rhythm and image framing were preserved.

The corrected local service page is available at `/services/digital-marketing-growth#category-services`. Review before production deployment through the existing workflow. Keep production credentials/data. This package does not include private database dumps, local test databases, real environment secrets, or a deployment. No Neon schema update is required. Real provider uploads, email delivery, external platform caching, Google rankings and real-device field performance are not newly certified by this CSS change.
