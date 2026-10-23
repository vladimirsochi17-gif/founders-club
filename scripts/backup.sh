#!/bin/sh
set -eu

backup_dir="${1:-./backups}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$backup_dir"

docker compose exec -T db pg_dump -U founders -d founders_club --format=custom \
  > "$backup_dir/founders-db-$timestamp.dump"
docker compose exec -T app tar -C /app/data -czf - uploads \
  > "$backup_dir/founders-uploads-$timestamp.tar.gz"

echo "Backup written to $backup_dir ($timestamp)"
