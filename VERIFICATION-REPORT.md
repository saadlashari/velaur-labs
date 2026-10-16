# Process connectors, linked hover and card alignment — 17 October 2026

The requested connector lines remain in the delivery diagram. Instead of disconnected, fixed-angle CSS strokes, a responsive SVG layer now measures each phase heading and its matching segment. Elbow paths and endpoint dots stay outside the content bounds. A ResizeObserver updates their positions when labels wrap, fonts/layout change, or the viewport resizes. Desktop labels use a consistent heading area; tablet/mobile cards align their heading, deliverable and paragraph tracks.

Hovering any of the five arc segments highlights the matching segment, phase heading and connector. Hovering the text phase highlights the same trio. Pointer leave restores the scroll-selected phase, or current keyboard focus. Keyboard focus takes precedence over a stationary previous hover. Selecting a segment also changes the active phase for mobile-width use. The existing scroll observer remains active. Original content, supporting detail lists, admin design IDs and CMS inputs remain in place.

Shared CSS subgrid tracks align headings, descriptions and CTA endpoints within card rows: service cards, capability cards, reasons, article previews, category cards, growth/related service cards, portfolio project cards, delivery detail cards and featured projects. The original featured portfolio image quadrants remain; their text uses a consistent left or right column. No copy is shortened, no line clamping is added, and the 30px section gap is preserved. Existing layouts remain the fallback on browsers without CSS subgrid support; that fallback is not claimed to have identical row alignment.

## Verified

- Final production build and standalone TypeScript check passed.
- Lint: zero errors, 23 existing warnings.
- Full regression suite: 14/14 passed. Process/CMS regression suite now has 46 checks, including hover in both directions, scroll restoration, keyboard focus overriding a stationary pointer, original copy preservation, and CMS copy updates.
- Browser layout matrix: all 83 public routes at actual CSS widths 390, 820 and 1440px, in light and dark themes: 498 cases. No horizontal overflow or measured row-alignment failures. Across these cases, 500 multi-card rows were compared for heading/copy/CTA alignment. Text overflow and section-gap checks were additionally recorded for the mobile/tablet cases.
- Real pointer: all five arc segments and all five text phases in both themes, 20 distinct cases; matching arc, heading state and connector agreed. Screenshots are retained alongside the raw measurements.
- Connector routing: five paths at actual desktop widths 1102, 1280, 1440 and 1920px, in both themes; sampled segments crossed no phase text bounds. The first requested size rounded to 1102px because of browser zoom. Paths retain visible normal and highlighted strokes.
- Mobile-width selection: selecting stage four at 390px activated its matching phase in both themes; no overflow. Long desktop leader lines remain hidden in the existing compact mobile/tablet layout.
- Real keyboard Tab check: visible focus on phase two and matching arc/heading state on the final build.
- No warning/error console entries captured in the final process/layout QA tab.
- Preserved data hashes: original process copy/details, approved portfolio/service/solution data, sharing image, schema and dependency manifests match the previous release.

Evidence is in `verification/process-*.json`, `process-alignment-*.log`, `process-desktop-*.png`, `process-mobile-*.png`, `cards-desktop-light.png` and the current `automated-tests.json`/`.log`. Browser zoom was accounted for in actual CSS viewport sizes and screenshot coordinate scaling.

31 initial navigation samples were read before the public root/theme was present. Those incomplete samples were repeated after network idle and replaced with complete measurements, marked `recheckedAfterLoad` in the final matrix. The final coverage assertion requires all 83 routes in each requested width/theme combination.

## Limits and local preview

These are Chromium viewport and pointer/keyboard checks, plus React component/CMS/API regression tests. Mobile selection was exercised through browser input at a mobile viewport; a physical touch device and other browser engines were not separately certified. Arbitrary future CMS content may require a new layout review. No production deployment, real provider email/upload, real Neon access, or external social sharing-cache test was performed. The existing database-backed settings and admin preview use the same shared component/styles; no new database migration or content field was required. Local QA uses disposable data and contains no production credentials.

Open `http://127.0.0.1:3000/#process` for live review. The consolidated ZIP includes earlier approved updates. GitHub source is synchronized separately after package verification. Older reports and evidence remain as history; their dates and limitations still apply to their original releases.
