# VELAUR LABS — Production verification, 22 October 2026

## Delivered changes

Custom-domain admin login accepts only the configured app's exact trusted HTTPS origins: velaurlabs.com, www.velaurlabs.com and velaurlabs.netlify.app. Foreign origins remain rejected. Password, 2FA, recovery-code, permission and rate-limit checks remain enforced.

Profile and media uploads share signed server-side Cloudinary handling, trimmed configuration, timeouts, safe errors and validation of successful image responses. Failed uploads preserve the saved avatar and do not create media records. The profile screen handles progress, retries and incomplete success responses.

The real Cloudinary rejection was `missing permissions (actions=[create])`. The account owner corrected the active key's create permission. Both signed upload probes then returned HTTP 200, and both temporary assets were deleted successfully. The owner signed into the custom-domain admin and uploaded their own profile image: the UI showed success, the database recorded AVATAR_UPDATE, and the saved image returned HTTP 200. The owner's image was preserved. SHA-1 was also tested successfully; the permission issue, not SHA-1 alone, caused the original rejection.

Homepage card links edited in the visual builder now navigate to their saved destination. Previously a BodyTalk card's visible href pointed to BodyTalk while Next's retained React destination opened SalesFox. The new behavior follows the edited native anchor and retains modifier/new-tab behavior. The admin inspector now offers **Link destination** and **Apply link** when selecting a link, its image/heading, or a card with one link. Invalid or blank destinations cannot be applied. Existing draft/publish controls remain.

Use Admin > Design, select the relevant linked element, open Edit, change Link destination, choose Apply link, then save a draft/review/publish. Selecting a container containing several different links does not arbitrarily change one of them.

## Preservation

No production content or design records were written by this maintenance. Before/after hashes match for all 129 public global settings and the projects, pages, page_sections, services, blog_posts and redirects tables. Seven public route snapshots preserve headings, project identities and saved hide rules. The current homepage's BodyTalk/TopMusic edits, copy, images and hidden elements remain saved.

Nine website/mobile entries remain hidden on the existing /work page: SalesFox website/mobile, MyYogi website/mobile, Actimus website/mobile, Her Golf, TJ's Pizza and ServeU mobile. Existing web-development and mobile-development page hide rules also remain. These are existing route-specific visual overrides; the category listing routes /work/websites and /work/mobile-apps had no equivalent hide rules before this deployment and were left unchanged under the instruction to preserve the live website. This is preservation of the saved state, not a claim of global record-level unpublishing.

The ZIP contains source, approved assets and verification evidence. Live content/settings remain in the existing database. No Neon migration, database reset, secret reset or 2FA reset is needed.

## Verification

- All 14 automated suites passed: 272 API/CMS assertions, 110 React DOM assertions and 111 public rendering assertions covering 83 routes.
- Tests include link selection, draft persistence, invalid/blank URL handling, preservation of hidden/text/style rules, navigation handler cleanup and preview selection; hidden/archived catalog exclusions are covered separately.
- Production-context Netlify build and TypeScript checks passed. Build warnings are recorded in the build log; no zero-warning claim is made.
- Actual final custom-domain empty login POSTs reach field validation (400) on all three trusted hosts; a foreign origin receives 403. These requests alone do not prove password/2FA sign-in; the owner's successful real sign-in and audit record provide that separate evidence.
- Real custom-domain sign-in and avatar upload were observed on the earlier login/upload deployment. The final deployment retains the same authentication and upload code; subsequent changes concern the link editor/navigation only.
- Review browser clicks: desktop/dark BodyTalk opens /work/projects/bodytalk-system-website; 390x844 mobile/light TopMusic opens /work/projects/topmusic-mobile-app. The mobile result had no horizontal overflow. Final custom-domain browser clicks also reached both intended project pages in dark/light modes.
- Seven public route comparisons passed; saved public CMS table hashes remained unchanged.

The last native Chrome signed-in admin visual check could not run because the desktop browser tool could not verify its current URL. The new inspector was functionally tested with React DOM and workspace draft tests; no final signed-in browser visual pass or exhaustive mobile/desktop audit is claimed. Historical screenshots and reports in verification/ describe their own earlier runs and are not new evidence for this release. No 100% coverage claim is made.

## Publishing and evidence

The tested Next.js build is published to the existing VELAUR LABS Netlify site. Exact deploy IDs and timestamps are recorded in verification/final-production-deployment-20261022.json. GitHub changes are on fix/custom-domain-login-origin, PR https://github.com/saadlashari/velaur-labs/pull/1.

Current evidence: automated-tests.json/.log, final-link-ui-20261022.log, final-netlify-build-20261022.log, cloudinary-live-20261022.json, live-login-upload-20261022.json, final-live-checks-20261022.json, final-preview-checks-20261022.json and live-content-preservation-20261022.json. No credential values, raw private database snapshot or personal avatar URL are included. The ZIP excludes .env secrets, .netlify credentials/state, dependencies, build output and Git history; verification/FILE-MANIFEST.json supplies per-file SHA-256 checksums.
