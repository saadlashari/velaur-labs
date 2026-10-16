# Admin-only continuation — 2FA recovery codes

## Implemented
- Ten strong, one-time recovery codes created on successful self-service 2FA enrollment.
- Only HMAC-SHA256 hashes (keyed using AUTH_SECRET) are persisted in existing global_settings; plaintext codes only returned once.
- Login accepts either a valid TOTP code or a one-time recovery code. Recovery consumption runs under PostgreSQL row lock in a transaction to prevent code reuse under concurrent sign-ins.
- Admin Profile displays new codes once, provides a local text download, shows remaining count, and allows rotation with current password plus TOTP confirmation. Rotation invalidates previous codes.
- Audit events emitted for recovery use and rotation.

## Known remaining blockers
- Initial bootstrap Super Admin 2FA setup does not yet issue recovery codes; enrollment for that path requires separate work. Existing Super Admin can rotate codes after signing in with authenticator.
- Recovery codes are bearer secrets: store offline securely; downloaded text files must be protected.
- Database-managed point-in-time recovery is not replaced by JSON content export. Disaster recovery restore remains unimplemented.
- Full visual editing for every bespoke section remains incomplete, as do media crop UI and comprehensive browser/accessibility/security tests.
- Next.js production build and real Neon login flows remain UNVERIFIED due to missing local npm dependencies.

## Verification
- 80 TS/TSX files passed TypeScript syntax parsing (not full type-check).
- ZIP integrity checked by packaging process.

## Progress estimate
- Admin implementation: 77% (previous: 75%).
- Public website: 58% (unchanged).
- Testing and release readiness: 20% (unchanged).
- Overall: 63% approximate (previous: 62%).

No SQL schema migration required for the new recovery-code settings (existing global_settings table).
