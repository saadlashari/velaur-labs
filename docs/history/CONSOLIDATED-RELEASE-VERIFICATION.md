# VELAUR LABS — Consolidated source verification

This build retains the latest combined website/admin source and adds:

1. `npm run verify:source`: dependency-free Node static source audit for TS/TSX syntax (when a TypeScript parser is available), internal relative imports and twelve critical website/admin routes.
2. The Admin content export now includes `checksums` with SHA-256 digest for each exported table's JSON rows and the existing row count metadata, in one repeatable-read snapshot. These hashes support *file-integrity comparisons* only; they do not authenticate an export and do not replace database-level backup, encryption, or a tested restore.

## Verification on this machine
- `node scripts/verify-source.mjs`: PASS, 80 TS/TSX files, 12 required routes, zero reported errors.
- Full `npm run build`: NOT RUN — npm dependencies are unavailable in the local environment.
- Neon, Cloudinary and email integration: NOT VERIFIED — no live credentials or staging service access used.
- Browser/device QA: NOT VERIFIED.
- All locked public pages and 37 cases with approved image assets: NOT COMPLETE.
- Full Elementor-like editability of all bespoke website sections and database restore: NOT COMPLETE.

## Progress (estimates, unchanged pending milestone verification)
- Admin 79% code coverage estimate
- Website 58% implementation estimate
- Overall 64% implementation estimate
- Release verification 20%

Do not treat this ZIP as a production-ready final release.
