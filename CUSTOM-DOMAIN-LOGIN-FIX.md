# Custom-domain origin validation fix — 21 October 2026

## Observed problem

Credential-free live POST requests to `/api/auth/login` reproduced the reported behavior: `https://velaurlabs.com` returned 403 `Invalid request origin.`, while `https://velaurlabs.netlify.app` returned 400 field validation. The original guard trusted only the single `APP_URL` origin. The live deployment's secret/environment configuration was not read; the results are consistent with a Netlify primary APP_URL that does not match the custom domain.

## Change

The guard retains an explicit valid APP_URL requirement. When that URL belongs to this VELAUR deployment, the exact HTTPS origins `https://velaurlabs.com`, `https://www.velaurlabs.com` and `https://velaurlabs.netlify.app` are accepted. Other deployments continue to trust only their exact configured origin. There is no wildcard for Netlify sites, subdomains or previews, and no Host/X-Forwarded-Host-based trust. Missing, opaque, malformed, credential-bearing or path/query/fragment-bearing Origin headers are rejected. A production APP_URL must be a root HTTP(S) URL, not a page URL.

The shared guard fixes login and the authenticated CMS mutation endpoints that use the same validation, as well as public inquiry submissions. Password validation, mandatory Super Admin two-factor authentication, recovery-code single use, session cookie flags, permissions and database rate limiting remain in place. No database migration, secret reset, password reset or 2FA reset is required. No UI or website content is changed.

## Verification

- Production build passed on Next.js 15.5.27.
- Standalone TypeScript check passed.
- Full lint: zero errors, 23 existing warnings.
- All 14 regression suites passed, including 215 actual API/CMS assertions against disposable PGlite data.
- Added 33 integration assertions: all 9 primary/alias combinations, malformed/foreign/lookalike origins, proxy-header spoofing, missing/invalid APP_URL, deployment isolation, actual custom-domain password/recovery-code sign-in, an authenticated custom-domain CMS request reaching validation, and foreign CMS requests remaining blocked.
- Built application tested over real local HTTP with APP_URL set to the Netlify domain: 12 checks across login and inquiry endpoints. All three aliases reach field validation; foreign/lookalike/other-Netlify origins return 403 even with spoofed forwarded headers.
- Real production credentials and the screenshot's authenticator code were never used. Actual production account sign-in must be verified by the owner after publishing with a fresh authenticator code.

Evidence: `verification/origin-fix-live-before.json`, `origin-fix-http.json`, `origin-fix-build.log`, `origin-fix-typecheck.log`, `origin-fix-lint.log`, `origin-fix-tests.log`, and `automated-tests.json`/`.log`. `origin-fix-integration.log` is the preliminary 212-check run; the final full suite contains 215 assertions.

## Publish status

The source is prepared on a dedicated GitHub fix branch for review. Production has not been changed automatically, in accordance with the owner's earlier instruction. Merge the fix and publish a new Netlify deploy to apply it. A Netlify deploy is required even if only environment variables are changed: https://docs.netlify.com/build/functions/environment-variables/ . Once published, repeat the credential-free checks (custom domain should return field validation rather than origin rejection), then sign in normally. Keep the existing database, AUTH_SECRET and 2FA configuration.
