# VELAUR LABS — consolidated admin release audit (13 October 2026)

## Existing admin modules in this release
- Dashboard: live counts and activity queries (database connection required)
- Profile: display name, email, password, avatar upload/remove (Cloudinary required)
- Users & roles: sub-admin management and module permissions; added `settings`, `media`, `approvals`, `backups` permissions to role editor/API
- Pages: sections, visual responsive preview, revisions, undo/redo, atomic save and conflict protection
- Homepage: content, featured slots, layout visibility and order
- Content: services, portfolio projects/case studies/gallery, blog
- Media: asset list, picker and inline uploads
- Approval queue, inquiries and settings/navigation/footer/theme/floating-button controls

## New admin operations module — `/admin/operations`
1. Active session list and revoke-other-device actions for authenticated admins; current session protected from accidental device revocation.
2. Paginated audit log read API (audit VIEW permission), recent events UI.
3. Content JSON export for Super Admin only, with explicit confirmation, export audit, export history, and 5,000-row/table guard. Excludes admin users, session tokens, passwords, and other authentication secrets. Includes inquiries: handle downloaded data securely.
4. UI clarifies export is **not** full PostgreSQL backup or point-in-time recovery.
5. Dashboard links and profile shortcut to operations.

## Consolidated admin TODO / NOT VERIFIED — do not claim 100%
- Live Neon CRUD, conflict/revision concurrency, permissions, audit and export integration tested with real configured environment
- Cloudinary avatar/media upload end-to-end in configured environment
- Full Next.js production build and Netlify staging/deploy; npm dependencies unavailable in runner and package-lock missing
- 2FA enrollment and recovery for all admins (current bootstrap flow primarily Super Admin setup)
- Production-managed point-in-time database backups and tested disaster recovery restore
- Truly complete Elementor-like visual editing of every bespoke page component, not only CMS sections
- Crop/resize UI for avatars/media and full accessibility/keyboard/mobile browser QA
- Scheduled content backups, image retention/cleanup, reliable email delivery verified with real provider

## Validation performed
- TypeScript parser validation on 78 TS/TSX files (zero syntax errors)
- Source import/asset and ZIP integrity audit; not a substitute for TypeScript typecheck or Next.js build
- No new SQL tables in this pass: existing admin_sessions, audit_logs and backup_events reused

## Deployment prerequisites
`DATABASE_URL`, `AUTH_SECRET`, `APP_URL`, Bootstrap setup and existing `db/schema.sql`. Cloudinary/email provider variables required for those workflows. Configure recurring Neon-managed PITR backups separately; exporting JSON is not sufficient disaster recovery.
