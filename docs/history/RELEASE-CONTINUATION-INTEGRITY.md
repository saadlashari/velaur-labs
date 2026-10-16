# VELAUR LABS — export verification update

## Implemented
- Admin > Operations now verifies a selected VELAUR-CONTENT-EXPORT-v2 JSON locally (browser only), checking the nine expected tables, record counts and SHA-256 checksums. The file is not uploaded.
- Dependency-free CLI verifier: `npm run verify:export -- path/to/export.json` or `node scripts/verify-content-export.mjs path/to/export.json`.
- Integrity regression tests: `node scripts/test-export-integrity.mjs`. Four test cases: good export, content tampering, missing table and count mismatch.

## Verified in this environment
- `node scripts/verify-source.mjs`: 80 TS/TSX files parsed, 12 key routes present, no missing relative imports; zero errors.
- `node scripts/test-export-integrity.mjs`: four tests pass.
- ZIP CRC integrity: passed.

## Not verified / release blockers
- `npm install` timed out; no Next.js production build, type-check, actual browser or database integration tests possible here.
- Browser verifier code has not been exercised inside an actual browser.
- Export verification is not a database restore, PostgreSQL physical backup or proof of recoverability. Restore requires a separately designed and tested disaster-recovery process.
- Full visual editing of bespoke pages, final premium design, 37 approved projects and complete QA remain open.

Previous approximate implementation estimates are unchanged: Admin 80%, Website 59%, Overall 65%, Release 20%. These are subjective estimates, not independently validated scores.
