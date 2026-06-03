#!/usr/bin/env bash
# Pull-and-restart deploy for the $6 droplet.
# Run this on the droplet (as `deploy` user) after pushing a code change
# to main. GitHub Actions builds the three images, this script pulls them
# and recreates only the services whose digests changed.
#
# Usage: ./scripts/deploy.sh
#        ./scripts/deploy.sh --migrate    # also run db:migrate before restart

set -euo pipefail

cd /opt/enteraveil-store

COMPOSE="docker compose -f docker-compose.prod.images.yml --env-file .env.prod"

echo "→ Pulling latest images from ghcr.io …"
$COMPOSE pull medusa storefront strapi

if [[ "${1:-}" == "--migrate" ]]; then
  echo "→ Running Medusa DB migrations …"
  $COMPOSE up -d postgres redis medusa
  sleep 5
  $COMPOSE exec medusa pnpm medusa db:migrate
fi

echo "→ Recreating containers with the new images …"
$COMPOSE up -d --remove-orphans

echo "→ Pruning unused images (saves disk on a 25 GB droplet) …"
docker image prune -f --filter "until=24h"

echo ""
echo "✔ Deploy complete."
echo ""
$COMPOSE ps
