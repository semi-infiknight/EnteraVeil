#!/bin/bash
# Create EnteraVeil databases on Railway Postgres (idempotent).
# Run once after Postgres is up:
#   railway connect Postgres < scripts/railway-init-db.sql
# or:
#   railway run --service Postgres psql "$DATABASE_URL" -f scripts/railway-init-db.sql
set -euo pipefail

psql "${DATABASE_URL:?DATABASE_URL is required}" -v ON_ERROR_STOP=1 <<'SQL'
SELECT 'CREATE DATABASE strapi'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'strapi')\gexec
GRANT ALL PRIVILEGES ON DATABASE strapi TO CURRENT_USER;
SQL

echo "→ Railway Postgres ready (medusa uses default DB, strapi DB created if missing)"