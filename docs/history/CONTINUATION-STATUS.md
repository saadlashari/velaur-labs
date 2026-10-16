# VELAUR LABS — Continuation update

## Implemented in this update

- Atomic page + section save endpoint `PUT /api/admin/pages/[id]/save` uses a single PostgreSQL transaction.
- Every atomic page save records a prior state snapshot in the existing `content_revisions` table.
- Admin-authenticated page revision list endpoint `GET /api/admin/pages/[id]/revisions`.
- Authorized revision rollback endpoint `POST /api/admin/pages/[id]/revisions/restore`; writes a safety snapshot and restores into **DRAFT** status, not directly to production.
- Page editor uses the atomic endpoint and exposes revision history and restore controls.
- Responsive styles for revision controls.

## Requirements and limitations

- Existing `pages`, `page_sections`, `content_revisions`, and `audit_logs` Neon tables are reused; no schema change is introduced.
- Production Next.js build, database access, role/approval integration, and mobile/browser tests are not verified in this environment. Passing transpilation is **not** a production build.
- This is an incremental update, not completion of the locked full website and admin scope.
- Revision rollback is scoped to pages and their sections. It does not currently restore all related media, services, blog posts, or global settings.
- For release, test page save and restore with the actual Neon database and an authenticated admin account on staging first.
