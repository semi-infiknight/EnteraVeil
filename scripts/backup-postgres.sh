#!/bin/bash
# Daily Postgres backup for EnteraVeil. Keeps 7 days of rolling backups.
# Schedule via cron:
#   0 3 * * *  /opt/enteraveil-store/scripts/backup-postgres.sh >> /var/log/enteraveil-backup.log 2>&1
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/enteraveil}"
COMPOSE_FILE="${COMPOSE_FILE:-/opt/enteraveil-store/docker-compose.prod.yml}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUTFILE="$BACKUP_DIR/enteraveil-${TIMESTAMP}.sql.gz"

echo "[$(date -u +%FT%TZ)] backup → $OUTFILE"

docker compose -f "$COMPOSE_FILE" exec -T postgres \
  pg_dumpall -U "${POSTGRES_USER:-postgres}" \
  | gzip -9 > "$OUTFILE"

# Rotate old backups
find "$BACKUP_DIR" -type f -name "enteraveil-*.sql.gz" -mtime "+${RETENTION_DAYS}" -delete

echo "[$(date -u +%FT%TZ)] done. existing backups:"
ls -lh "$BACKUP_DIR" | tail -n "+2"
