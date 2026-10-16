# VELAUR LABS — consolidated release status

## Added in this pass
- Service, project and blog content editing now requires an `expectedUpdatedAt` record version.
- The server locks the existing row, checks the version inside a database transaction and returns HTTP 409 rather than silently overwriting newer changes.
- The editor sends the version from the selected record and keeps unsaved content visible after a failed save.

## Known incomplete / unverified scope
- The agreed comprehensive visual editor is not implemented for every bespoke public section.
- 37 portfolio entries are not all independently verified with permitted real screenshot assets and case-study details.
- Real managed Neon point-in-time backup recovery and safe restore drills are not implemented. Content JSON export is not a disaster-recovery backup.
- Full Next.js production build, Neon queries, Cloudinary image uploads, outgoing email and device/browser/security QA have not passed in this environment.
- Offline package resolution failed (npm ENOTCACHED @eslint/eslintrc); this does not establish build success or failure of project code.

## Estimated implementation, not independently verified
- Admin ~79%; Public website ~58%; overall ~64%; release verification ~20%.

No claim is made that this is a finished production-ready release. No deployment or database mutation was performed.
