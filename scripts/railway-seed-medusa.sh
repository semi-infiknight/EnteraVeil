#!/usr/bin/env bash
# Seed Medusa catalog on Railway production (idempotent).
# Requires: npx @railway/cli linked to enteraveil / production.
set -euo pipefail

echo "→ seed-catalog-if-empty"
npx @railway/cli ssh --service medusa -- \
  "cd /app/apps/medusa && pnpm medusa exec ./src/scripts/seed-catalog-if-empty.ts"

echo "→ seed-inr-prices"
npx @railway/cli ssh --service medusa -- \
  "cd /app/apps/medusa && pnpm medusa exec ./src/scripts/seed-inr-prices.ts"

echo "→ seed-shop-filters"
npx @railway/cli ssh --service medusa -- \
  "cd /app/apps/medusa && pnpm medusa exec ./src/scripts/seed-shop-filters.ts"

echo "→ Done."