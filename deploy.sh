#!/bin/bash
# EnteraVeil deploy: ssh to VPS, pull latest main, rebuild + migrate.
# Requires .env.prod on the VPS at /opt/enteraveil-store/.env.prod with real values.
# Reads VPS_HOST and VPS_USER from local PROJECT_CONFIG.env.
set -euo pipefail

if [ -f PROJECT_CONFIG.env ]; then
  # shellcheck disable=SC1091
  source PROJECT_CONFIG.env
fi

VPS_HOST="${VPS_HOST:?VPS_HOST is required (set in PROJECT_CONFIG.env)}"
VPS_USER="${VPS_USER:-root}"
REMOTE_DIR="${REMOTE_DIR:-/opt/enteraveil-store}"

echo "→ Deploying to ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}"

ssh -o StrictHostKeyChecking=accept-new "${VPS_USER}@${VPS_HOST}" bash -s <<REMOTE
set -euo pipefail
cd "${REMOTE_DIR}"

echo "  pulling latest main..."
git fetch origin main
git reset --hard origin/main

echo "  building images..."
docker compose -f docker-compose.prod.yml build

echo "  starting services..."
docker compose -f docker-compose.prod.yml up -d

echo "  running medusa migrations..."
docker compose -f docker-compose.prod.yml exec -T medusa \
  node_modules/.bin/medusa db:migrate

echo "  pruning old images..."
docker image prune -f
REMOTE

echo "→ Deployed. Verifying..."

curl -sI "https://\${BRAND_DOMAIN:-enteraveil.com}" | head -1 || true
echo "Done."
