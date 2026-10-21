# VELAUR LABS — Admin login and image upload changes

Verified locally on 21 October 2026. This consolidated source retains the previous approved website/admin work and adds the changes below. No production deployment or database migration was performed.

## Custom-domain login

The existing live custom-domain login returned `Invalid request origin.` while the Netlify alias reached field validation. The shared request guard now accepts only the three exact HTTPS origins velaurlabs.com, www.velaurlabs.com and velaurlabs.netlify.app when APP_URL identifies this VELAUR deployment. A valid APP_URL remains required. Foreign/lookalike origins, other Netlify sites, preview URLs and proxy-header spoofing remain blocked. Password checks, 2FA, recovery codes, permissions and rate limiting remain enforced.

## Profile and media uploads

Both endpoints now share a server-only signed upload helper with trimmed configuration, SHA-256 signing, timeout handling, safe provider error categories and validation of the successful storage response. API secrets and raw provider errors are never returned to the browser. Existing authentication, origin checks, MIME/magic-byte validation and size limits remain. Storage failures do not create media records or replace a saved avatar.

The profile screen shows progress, blocks duplicate submissions, preserves the old image on rejected uploads, clears stale messages and resets the file input so the same image can be retried. Success requires a successful response containing an HTTPS image URL.

These are tested implementation changes, not proof that the screenshot's production storage rejection has disappeared. SHA-1 is supported by Cloudinary by default; changing to SHA-256 is not itself evidence that SHA-1 caused the issue.

## Signed-in dashboard findings and verification limit

The configured cloud name, active API key and secret pair matched between Netlify and Cloudinary. Netlify listed All scopes and the same values for all deploy contexts. No keys, permissions, account policies or environment values were changed. No credential values are included in the evidence, repository or ZIP.

The actual signed upload probe could not complete because the restricted verification runtime could not reach Cloudinary, and private IPC to the network-enabled host was unavailable. No test image was uploaded. The old production handler discards the provider error, so the exact production rejection remains unconfirmed. Real account upload and owner sign-in must therefore be retested after publishing. If Cloudinary still rejects the image, the new safe error code distinguishes credentials, signature, account access, limits, invalid images and transient failures. Live upload is NOT reported as passing.

## Checks completed

- Production build: passed, Next.js 15.5.27.
- TypeScript: passed.
- Lint: 0 errors, 23 existing warnings.
- Full regression run: all 14 suites passed.
- Actual API/CMS handlers against disposable PGlite data: 263 assertions, including 48 new upload assertions and custom-domain password/recovery-code sign-in. Storage responses are mocked; these checks validate signing, handlers, persistence and error behavior, not the hosted provider.
- React DOM interactions: 92 assertions in total, including 10 new profile upload checks. JSDOM verifies behavior, not real browser geometry or mobile/desktop appearance.
- Public React server rendering: 111 assertions across 83 routes, using Next component adapters.
- Final built server HTTP origin checks: 12/12 passed across login/inquiries. The server used a dummy database connection string; these empty requests exercise origin/field validation before database access.

Evidence is under `verification/`: `automated-tests.json`, `automated-tests.log`, `upload-tests.log`, `upload-integration.log`, `upload-ui.log`, `upload-build.log`, `upload-typecheck.log`, `upload-lint.log`, `upload-built-http.json`, and `cloudinary-dashboard-check.json`. Earlier reports/evidence remain as historical records. No new browser visual/mobile audit or real Cloudinary upload is claimed.

## GitHub and publishing

Changes are on `fix/custom-domain-login-origin`, draft PR https://github.com/saadlashari/velaur-labs/pull/1 . Production was left unchanged in accordance with the earlier no-auto-deploy instruction. The dashboard showed the currently published release as a drop deployment; pushing this branch alone does not publish that release. Publish a fresh Next.js build with the existing Netlify environment after review. Keep the existing database, AUTH_SECRET and 2FA configuration; no Neon schema update is needed for these changes.

The ZIP is a complete source package with reports and a SHA-256 file manifest, excluding node_modules, build output, Git history, private backups and real environment files. Install locked dependencies and build it using the included Netlify configuration. It is not a prebuilt static drag-and-drop website.
