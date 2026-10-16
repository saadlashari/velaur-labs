# VELAUR LABS — Admin profile & brand controls

Implemented in this package:
- `/admin/profile` self-service display name, email, per-admin theme preference, password change (current password required). Password change invalidates other sessions.
- `/api/admin/profile` authenticated APIs with same-origin write protection and audit logging.
- Added dashboard link to profile.
- Extended existing `global_settings` allowlist with navbar CTA label/URL, footer description/location, and four design tokens; public header/footer consume saved values.
- No new tables: existing `admin_users`, `admin_sessions`, `global_settings` and `audit_logs` reused.

Important remaining gaps: this is NOT an Elementor-grade visual builder. Arbitrary navbar menu items, every footer column, every typographic style or image-size, and fully dynamic drag-and-drop are not yet supported. Profile preference is stored but admin-wide visual theme requires further integration. Production build and database live operations need verification. Do not deploy as fully complete without testing.
