# Featured project controls — continuation

Added global setting `home_featured_project_slugs` (JSON array of four unique slugs) stored in existing `global_settings` JSONB. Admin `/admin/homepage-content` now offers four project slots with suggestions from published project records. Public homepage respects the saved order and only displays records with status PUBLISHED. Missing or unpublished selections never appear as real published project cards. No SQL table migration required.

Note: No real Neon session or full Next.js production build has been verified in this environment. This does not make the rest of the locked scope complete.
