#!/usr/bin/env bash
# Full PostgreSQL logical backup; never writes credentials to logs.
set -Eeuo pipefail
umask 077
command -v pg_dump >/dev/null || { echo 'pg_dump is required (PostgreSQL client tools).' >&2; exit 2; }
command -v pg_restore >/dev/null || { echo 'pg_restore is required (PostgreSQL client tools).' >&2; exit 2; }
: "${DATABASE_URL:?Set DATABASE_URL securely in environment (never pass credentials as CLI args)}"
out_dir="${1:-./private-backups}"
mkdir -p "$out_dir"
chmod 700 "$out_dir"
file="$out_dir/velaur-full-$(date -u +%Y%m%dT%H%M%SZ)-$$.dump"
if ! pg_dump --dbname="$DATABASE_URL" --format=custom --no-owner --no-privileges --file="$file"; then
  rm -f "$file"
  echo 'Database backup failed; incomplete archive deleted.' >&2
  exit 1
fi
if ! pg_restore --list "$file" >/dev/null; then
  rm -f "$file"
  echo 'Backup archive validation failed; file deleted.' >&2
  exit 1
fi
if command -v sha256sum >/dev/null; then
  (cd "$out_dir" && sha256sum "$(basename "$file")" > "$(basename "$file").sha256")
fi
printf 'Backup saved and archive listing validated: %s\n' "$file"
echo 'Store archive and checksum in encrypted, access-controlled storage outside the deployment host.'
