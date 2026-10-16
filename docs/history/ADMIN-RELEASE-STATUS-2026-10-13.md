# VELAUR LABS — Admin-focused continuation

## Added in this release
- Self-service authenticator (TOTP) enrollment on `/admin/profile`, for signed-in admins without 2FA.
- Current password checked before creating a 10-minute pending encrypted setup secret.
- Six-digit authenticator confirmation uses a DB transaction and row locks, then enables 2FA on the account.
- Existing login already enforces the code when `two_factor_enabled=TRUE`.
- Origin check and `Cache-Control: private, no-store` on enrollment endpoints.
- Setup secret held in encrypted global_settings pending record; account secret encrypted in admin_users.
- Changes to the website deferred, per request.

## Known gaps / do not declare 100%
- Live Neon integration test, TOTP enrolment/sign-in/recovery test and browser testing not run.
- Authenticator recovery policy and recovery codes are NOT implemented; losing authenticator access currently requires manual authorized recovery.
- Complete Elementor-like builder for every bespoke public page section is not finished.
- Real, restorable, provider-managed PITR backup and DR restore tests absent. JSON content export != DB backup.
- Production build blocked because node_modules/package lock unavailable in this source environment.
- Media crop editor, integrations test, accessibility review still outstanding.

## Verification
- 79 TS/TSX files parsed with TypeScript compiler parser: 0 syntax errors.
- No missing relative imports check and ZIP integrity pass separately in packager.
- No new schema migration needed: global_settings and admin_users existing fields reused.

## Estimated status (not verified completion)
Admin: ~75%; Website: ~58%; Testing/release: ~20%; overall: ~63%.
