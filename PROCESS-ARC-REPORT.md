# VELAUR LABS — How We Work arc update

15 October 2026. The homepage process now follows the supplied semicircle reference, using native SVG and the existing website typography and theme tokens. This report supersedes the process presentation described in WEBSITE-CHANGES-3-REPORT.md. Earlier reports/screenshots remain historical evidence.

## What changed

- Five blue-to-purple segments, relevant line icons, phase numbers and the central Our Delivery Approach hub form a scalable semicircle. Desktop places the five process summaries around the arc with fine connector lines.
- At tablet sizes the arc sits above two-column phase cards; phones use a single readable column. Text is HTML rather than text embedded in a screenshot. Light mode has a pale surface, white hub, deep readable copy and restrained shadows; dark mode uses the existing navy palette.
- Original phase titles, descriptions, deliverables and twenty supporting points remain. Supporting points are under the keyboard-accessible Explore the delivery details disclosure. Scroll visibility continues to emphasize the associated segment without timers or scroll interception. Decorative transitions respect reduced-motion preferences.
- Existing admin process fields and inline design identifiers remain connected. Structure → Home → Home process steps edits the five phase summaries; Process phase points edits supporting points. Saved drafts update the original-page preview. Published settings use the same existing publication workflow.

## Tests for this update

| Check | Result |
|---|---|
| Production build / TypeScript | Pass |
| Existing automated tests | 14/14 suites pass, including arc rendering, disclosure open/close, observer cleanup and CMS-fed process rerendering |
| Lint | 0 errors; 20 image/test-adapter warnings remain |
| Responsive section | 24 local Chromium cases: 320, 360, 390, 430, 768, 820, 1024, 1100, 1101, 1280, 1440 and 1920px, each in light/dark. Five phase articles and segments, no horizontal overflow, clipped checked copy or overlapping stage-label boxes |
| Keyboard details | Enter opens/closes supporting details in both themes; all twenty points retained |
| Admin saved-draft preview | Description changed in a disposable draft, reflected in the arc preview, then approved copy restored and saved. No production content was edited |
| Public HTTP | 89 checks pass on the final build: 83 routes, sitemap/robots and four anonymous admin API denials |
| Archive | CRC and SHA-256 manifest checked after packaging |

Evidence uses process-arc-* in verification/. Full-page screenshots and section crops include light/dark desktop plus phone views. These checks use browser viewport emulation, not physical-device or all-browser certification. The prior 498-route layout sweep is historical and was not repeated for this scoped section update.

No schema/dependency change or Neon migration is required. The local preview uses disposable review data. Live Neon, Cloudinary, Resend, actual calendar bookings and native hosted backup recovery retain the staging qualifications in the preceding release report. No production deployment was performed.

The consolidated archive contains current source/assets/reports, excluding dependencies, build output, secrets, private backups and disposable QA helpers. Existing run/configuration instructions remain in README.md.
