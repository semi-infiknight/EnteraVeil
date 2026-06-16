#!/usr/bin/env bash
# Register Strapi → storefront revalidation webhook (Strapi 5 admin API).
# Set these before running:
#   STRAPI_URL          default: production Railway domain
#   STRAPI_ADMIN_EMAIL  Strapi admin email
#   STRAPI_ADMIN_PASSWORD
#   STOREFRONT_URL      default: production Railway domain
#   STRAPI_WEBHOOK_REVALIDATION_SECRET  must match storefront env
set -euo pipefail

STRAPI_URL="${STRAPI_URL:-https://strapi-production-2a4f.up.railway.app}"
STOREFRONT_URL="${STOREFRONT_URL:-https://storefront-production-bb74.up.railway.app}"
SECRET="${STRAPI_WEBHOOK_REVALIDATION_SECRET:?Set STRAPI_WEBHOOK_REVALIDATION_SECRET}"
EMAIL="${STRAPI_ADMIN_EMAIL:?Set STRAPI_ADMIN_EMAIL}"
PASSWORD="${STRAPI_ADMIN_PASSWORD:?Set STRAPI_ADMIN_PASSWORD}"

JWT=$(curl -sf -X POST "${STRAPI_URL}/admin/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" \
  | node -pe 'JSON.parse(fs.readFileSync(0,"utf8")).data?.token||""')

if [ -z "$JWT" ]; then
  echo "Failed to authenticate Strapi admin" >&2
  exit 1
fi

WEBHOOK_URL="${STOREFRONT_URL}/api/strapi-revalidate?secret=${SECRET}"

PAYLOAD=$(WEBHOOK_URL="$WEBHOOK_URL" node -e '
const payload = {
  name: "storefront-revalidate",
  url: process.env.WEBHOOK_URL,
  headers: {},
  events: [
    "entry.create",
    "entry.update",
    "entry.delete",
    "entry.publish",
    "entry.unpublish",
  ],
};
process.stdout.write(JSON.stringify(payload));
')

RESPONSE=$(curl -sf -X POST "${STRAPI_URL}/admin/webhooks" \
  -H "Authorization: Bearer ${JWT}" \
  -H 'Content-Type: application/json' \
  -d "$PAYLOAD")

echo "$RESPONSE" | node -pe '
const j = JSON.parse(fs.readFileSync(0, "utf8"));
console.log("Webhook id:", j.data?.id || j.id || "created");
'

echo "Registered: ${WEBHOOK_URL}"