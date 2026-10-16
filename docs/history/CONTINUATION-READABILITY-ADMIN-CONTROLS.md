# VELAUR LABS — Verified source update

## Implemented in this update
- Global admin settings for public body text size (14–22px)
- Footer text size control (12–19px), with improved minimum sizes
- Section vertical spacing control (36–130px)
- Navbar height control (58–110px desktop)
- Content max width control (880–1600px)
- Server validation for all five new properties
- Public layout CSS variable wiring; no new database tables required (global_settings JSONB reused)
- Better defaults for overly small navigation and footer typography

## Evidence / limitations
- TypeScript/TSX source syntax transpilation checked.
- npm dependency install did not finish in this environment; full Next.js production build was not performed.
- No authenticated Neon save/load tests, browser visual regression tests, or live Netlify test performed.
- Locked scope is NOT complete: accurate full visual builder, all bespoke component controls, portfolio publication, robust media/backup workflows, and responsive E2E QA remain.

## Release caution
Stage this ZIP separately before production. Keep existing Neon data. Do not publish unverified case studies.
