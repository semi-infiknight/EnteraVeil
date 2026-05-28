#!/usr/bin/env bash
# Bring up local dev stack once Docker Desktop is installed.
# Run from project root: ./scripts/bootstrap-local.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Sanity
command -v docker >/dev/null || { echo "Install Docker Desktop first"; exit 1; }
command -v pnpm   >/dev/null || { echo "Install pnpm: npm i -g pnpm@10"; exit 1; }
[ -f PROJECT_CONFIG.env ]   || { echo "Need PROJECT_CONFIG.env at repo root"; exit 1; }
set -a; source PROJECT_CONFIG.env; set +a

echo "1/5  Installing JS deps (workspace root)"
pnpm install

echo "2/5  Starting Postgres + Redis"
docker compose up -d
sleep 5

echo "3/5  Running Medusa migrations + seed"
cd apps/medusa
pnpm run db:migrate
pnpm run seed
pnpm exec medusa user -e "$ADMIN_EMAIL_DEV" -p "$ADMIN_PASSWORD_DEV" || true
cd "$ROOT"

echo "4/5  Fetching publishable API key into storefront .env.local"
./scripts/fetch-publishable-key.sh

echo "5/5  Done. Run 'pnpm dev' to start everything."
