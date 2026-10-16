# VELAUR LABS — Database Backup and Restore

These scripts provide a **full PostgreSQL logical archive** (including admin users, content, audit history and other DB tables), unlike the Admin Operations JSON content export. They are intended for an authorized operator running locally or in a secured CI runner, **not** exposed through a public HTTP endpoint. PostgreSQL client tools `pg_dump` and `pg_restore`, compatible with the Neon database version, are required.

## Backup

Set `DATABASE_URL` through a secret manager or secure environment; never commit or paste it. Run:

```bash
bash scripts/database-backup.sh /secure/encrypted-backups
```

This writes a PostgreSQL custom-format archive, validates its table-of-contents readability, creates a `.sha256` checksum where available, and restricts permissions. The backup still needs **a tested restore** before it is considered recoverable. Store an encrypted copy off-site and set retention/scheduling with your secure platform.

## Restore — staging first

1. Provision an **empty staging** Neon database and point `DATABASE_URL` to it.
2. Install matching PostgreSQL client tools and obtain the archive securely.
3. Inspect the archive with `pg_restore --list backup.dump` and verify checksum.
4. For a destructive restore into a target database, invoke:

```bash
VELAUR_CONFIRM_RESTORE=RESTORE_AND_REPLACE_TARGET_DATABASE \
  bash scripts/database-restore.sh /secure/encrypted-backups/backup.dump
```

A **pre-restore logical backup of the target** is mandatory and stored separately under `private-backups/pre-restore` by default. The restore uses `--clean --if-exists --single-transaction --exit-on-error` and stops on the first failed SQL statement. Do not run against production without a planned maintenance window, stakeholder approval and a rollback procedure. A target empty staging DB still gets a pre-restore backup.

## Limitations

- This does **not** back up Cloudinary-hosted images, external email records, Netlify configuration or application environment secrets. Back them up independently.
- A readable pg_restore archive does not prove semantic restorability, privileges compatibility or app correctness. Full integration and staging-restore QA are still required.
- Managed Neon point-in-time restore/branching should also be configured independently according to the actual plan capabilities.
- DB credentials belong in secret management; do not store dump archives under `public/` or a web-accessible folder.
- Database restore is intentionally not exposed to admin browsers; doing so creates excessive destructive security risk.
