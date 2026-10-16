# Blog and Legal Content CMS Pass

- Admin Global Settings now exposes ten validated text controls for the blog and legal pages.
- Published blog listing and existing blog filters remain intact; legal templates and legal-review draft disclosures remain intact.
- Existing `global_settings` JSONB table is reused, no migration required.
- Automated source checks validate default -> API allowlist -> UI -> public page references.

## Critical limitations
Legal text remains a DRAFT pending an actual legal review. Full Next.js production build and Neon/browser integration tests still need to be completed. Approved 37 case studies and the complete bespoke visual editor are unfinished. This is **not a production-ready release**.
