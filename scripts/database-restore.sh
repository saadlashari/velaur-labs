#!/usr/bin/env bash
# Destructive database restore. Requires explicit confirmation and automatic pre-change backup.
set -Eeuo pipefail
umask 077
[[ $# -eq 1 ]] || { echo 'Usage: bash scripts/database-restore.sh /absolute/path/archive.dump' >&2; exit 2; }
archive="$1"
[[ -f "$archive" ]] || { echo 'Archive does not exist.' >&2; exit 2; }
[[ "${VELAUR_CONFIRM_RESTORE:-}" == 'RESTORE_AND_REPLACE_TARGET_DATABASE' ]] || {
  echo 'Refusing destructive restore. Set VELAUR_CONFIRM_RESTORE=RESTORE_AND_REPLACE_TARGET_DATABASE after reviewing target DATABASE_URL.' >&2
  exit 2
}
: "${DATABASE_URL:?Set target DATABASE_URL securely in environment}"
command -v pg_restore >/dev/null || { echo 'pg_restore is required.' >&2; exit 2; }
command -v pg_dump >/dev/null || { echo 'pg_dump is required.' >&2; exit 2; }
pg_restore --list "$archive" >/dev/null || { echo 'Invalid PostgreSQL custom-format archive.' >&2; exit 2; }
if [[ -f "$archive.sha256" ]] && command -v sha256sum >/dev/null; then
  (cd "$(dirname "$archive")" && sha256sum -c "$(basename "$archive").sha256") || { echo 'Backup checksum mismatch.' >&2; exit 2; }
fi
# Always save target state before destructive restore. Fail closed if this backup fails.
pre_dir="${VELAUR_PRE_RESTORE_BACKUP_DIR:-./private-backups/pre-restore}"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$script_dir/database-backup.sh" "$pre_dir"
echo 'Pre-restore target backup succeeded. Beginning transaction-controlled restore.'
# Single transaction rolls back if PostgreSQL reports an error. --clean can destroy existing target data.
pg_restore --dbname="$DATABASE_URL" --clean --if-exists --no-owner --no-privileges --single-transaction --exit-on-error "$archive"
echo 'Database restore completed. Verify application logins, content, media links and public routes.'
