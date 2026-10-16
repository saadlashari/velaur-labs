# VELAUR LABS — Integrity & unsaved edits update

## Implemented
- Retired the legacy standalone sections PUT endpoint, which could bypass version checks, automatic revisions and the transactional page save API. Existing sections GET remains available. Writes now require `/api/admin/pages/[id]/save`.
- Added an unsaved changes indicator to the page editor.
- Warn before leaving the editor via browser navigation or switching pages, preserving unsaved edits on cancellation.
- After successful save, update the clean snapshot to match the server-returned version.
- Restoring a revision reloads the editor snapshot.

## Verification boundary
- TypeScript parse and relative imports can be audited without dependencies.
- Full Next.js build and real Neon integration are NOT verified; dependency installation is unavailable/timeout in this environment.
- Full locked scope including page-by-page premium redesign, complete 37-project portfolio, robust backups, end-to-end browser QA remains unfinished.
