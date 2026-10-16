# VELAUR LABS — Portfolio inventory and release status

## Included in this update
- An idempotent 37-project inventory seeder, organized as **14 WEBSITE, 13 WEB_APPLICATION, and 10 MOBILE_APP** records.
- `npm run portfolio:preview` prints the complete manifest without touching a database.
- `npm run portfolio:seed` requires `DATABASE_URL` and inserts only missing records as **DRAFT**. Existing records are left untouched (`ON CONFLICT (slug) DO NOTHING`).
- Slugs are category-qualified to avoid clashes between MyYogi/Actimus website and mobile entries.
- No fake project metrics, screenshots, URLs, client testimonials, or published claims are inserted.
- The `/work` overview now uses uploaded gallery covers for published projects, matching category pages.

## Verified
- Seeder preview prints 37 distinct records.
- JavaScript syntax check passed for inventory seeder.
- `node scripts/verify-source.mjs`: 81 TS/TSX files, 12 routes, 0 errors.
- `node scripts/test-export-integrity.mjs`: 4 tests passed.

## Not verified
- Live database seeding (requires a configured, accessible Neon database).
- Full Next.js build (npm offline installation returned `ENOTCACHED` for `@eslint/eslintrc`).
- Complete final editorial review, 37 screenshots, real client approvals, production QA, and the bespoke full visual builder.

## Safe next steps
1. Review preview: `npm run portfolio:preview`.
2. Back up the target database and confirm its environment.
3. Seed **drafts only** with `npm run portfolio:seed`.
4. Upload real screenshots, fill case-study fields and links, and publish after independent approval.
5. Run `npm install`, `npm run typecheck`, `npm run build` and browser tests on a network-enabled CI or developer machine.
