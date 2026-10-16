# VELAUR LABS — Content recovery and full database backups

## Content export restore (merge-only)

1. In Admin → Operations, export the content JSON (v2) and securely store it. It may include inquiries and personally identifiable information.
2. Validate without a database connection:

   `node scripts/restore-content-export.mjs /safe/path/export.json`

3. Before any restore, create an actual managed PostgreSQL backup and test a recovery on a staging database. Do not point this tool at production first.
4. For a staging **merge-only** restore, supply `DATABASE_URL` securely in the shell (do not commit or print it) and run:

   `node scripts/restore-content-export.mjs /safe/path/export.json --apply --confirm-merge`

The tool verifies the exported checksums and row counts before connecting to PostgreSQL. It writes in one transaction with a database advisory lock and rolls back on SQL errors. It upserts only exported rows; it **does not delete** rows not in the export, and does not restore authentication, sessions, users, approvals, revisions, email logs or system secrets. Some foreign keys refer to admin users; corresponding users must already exist. Run the restore on a database with the correct schema. This restore has not been live-tested against Neon in this environment.

## Full database backup / disaster recovery

A JSON content export is **not** a full database backup. For full recovery use Neon Point-in-Time Restore / branch restore where available, or use PostgreSQL client tools with a restricted, secure environment. Example commands (run only on your own machine or trusted CI with secrets injected):

```
pg_dump --format=custom --no-owner --no-acl --file=velaur-full.dump "$DATABASE_URL"
pg_restore --list velaur-full.dump
# Restore ONLY to an empty staging database after checking the schema and destination:
pg_restore --no-owner --no-acl --single-transaction --exit-on-error --dbname="$STAGING_DATABASE_URL" velaur-full.dump
```

Never run a destructive database restore against production without a verified rollback point and explicit operator approval. Store backups encrypted and restrict access; institute retention and periodic restore drills. Cloudinary-hosted assets need separate backup/retention arrangements.
