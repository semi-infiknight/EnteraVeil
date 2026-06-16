#!/bin/bash
# One-time Railway variable bootstrap for EnteraVeil production.
# Requires: railway CLI linked to enteraveil / production.
set -euo pipefail

export PATH="$(npm prefix -g)/bin:${PATH:-}"

MEDUSA_URL="${MEDUSA_URL:-https://medusa-production-e8b6.up.railway.app}"
STOREFRONT_URL="${STOREFRONT_URL:-https://storefront-production-bb74.up.railway.app}"
STRAPI_URL="${STRAPI_URL:-https://strapi-production-2a4f.up.railway.app}"

echo "→ Medusa variables"
railway variable set --service medusa --skip-deploys \
  RAILWAY_DOCKERFILE_PATH=apps/medusa/Dockerfile \
  NODE_ENV=production \
  'DATABASE_URL=${{Postgres.DATABASE_URL}}' \
  'REDIS_URL=${{Redis.REDIS_URL}}' \
  "MEDUSA_BACKEND_URL=${MEDUSA_URL}" \
  "STORE_CORS=${STOREFRONT_URL}" \
  "ADMIN_CORS=${MEDUSA_URL}" \
  "AUTH_CORS=${STOREFRONT_URL},${MEDUSA_URL}" \
  NODE_OPTIONS=--max-old-space-size=512

echo "→ Storefront variables"
railway variable set --service storefront --skip-deploys \
  RAILWAY_DOCKERFILE_PATH=apps/storefront/Dockerfile \
  NODE_ENV=production \
  "NEXT_PUBLIC_MEDUSA_BACKEND_URL=${MEDUSA_URL}" \
  "NEXT_PUBLIC_STRAPI_URL=${STRAPI_URL}" \
  NEXT_PUBLIC_SHOP_NAME=EnteraVeil \
  "NEXT_PUBLIC_SHOP_DESCRIPTION=Anime streetwear from beyond the veil"

echo "→ Strapi variables"
# DATABASE_URL targets the strapi DB on shared Postgres (created via railway-init-db.sql)
railway variable set --service strapi --skip-deploys \
  RAILWAY_DOCKERFILE_PATH=apps/strapi/Dockerfile \
  NODE_ENV=production \
  HOST=0.0.0.0 \
  DATABASE_CLIENT=postgres \
  'DATABASE_URL=postgresql://${{Postgres.PGUSER}}:${{Postgres.PGPASSWORD}}@${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/strapi' \
  DATABASE_SSL=false \
  "STOREFRONT_REVALIDATION_URL=${STOREFRONT_URL}/api/strapi-revalidate"

echo "→ Done. Set secrets separately (JWT_SECRET, APP_KEYS, etc.) then redeploy."