# VELAUR LABS — Consolidated release gate (13 October 2026)

## This package's actual source change
- Content export now uses **one PostgreSQL repeatable-read, read-only transaction**, through a single pooled connection, for a consistent snapshot across content tables.
- Exports carry format v2 and per-table counts. Export event logging remains outside the read-only transaction.
- Limits remain 5,000 records per table. Personal inquiry data may be included; export must be protected.
- This JSON export is **not** disaster recovery, physical database backup, point-in-time recovery, or a tested import/restore.

## Not completed: Admin
1. Fully editable custom/bespoke sections for every website page; current CMS builder is not a universal visual builder.
2. True database backup/restore runbook, tested PITR and recovery verification.
3. Real Neon, Cloudinary, email, authentication and 2FA integration tests using provisioned test credentials.
4. Production build, browser QA, responsive access, accessibility and security testing.
5. Full image editing beyond crop presets and global layout controls where not supported.

## Not completed: Public website
1. Premium redesign and page-by-page browser QA for Home/About/Services/Work/Blog/Contact.
2. Validation, screenshots and detailed case studies for all 37 approved projects.
3. All eight unique service pages with approved visuals, project links and tested calls-to-action.
4. SEO/performance/accessibility and Netlify production smoke tests.

## Current confidence / percentages
The last conversational estimates were Admin ~79%, Website ~58%, overall ~64%, test/release ~20%. These are subjective implementation estimates, not objective verified completion scores. No percentage increase claimed here because the change is an integrity fix, not a full release milestone.

## Test results in this environment
- TypeScript/TSX parsing: 80 files, no syntax parse errors.
- node_modules absent; a full Next.js production build has not been run here.
- No live Neon/Cloudinary/SMTP or browser test performed.
- Package ZIP integrity to be checked during packaging.
