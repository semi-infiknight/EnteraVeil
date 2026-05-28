#!/usr/bin/env bash
# Auto-fetch Medusa publishable API key and write it to apps/storefront/.env.local.
# Requires docker compose + Postgres up (Phase 1) and a key already created by the seed.
# Falls back to creating a key via Medusa admin REST API if Postgres has none.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# 1. Try Postgres
KEY=$(docker compose exec -T postgres psql -U postgres -d medusa-store -tA \
  -c "SELECT id FROM publishable_api_key LIMIT 1;" 2>/dev/null || true)
KEY="$(echo "$KEY" | tr -d '[:space:]')"

# 2. Fall back to admin REST API
if [ -z "$KEY" ]; then
  echo "No key in Postgres — creating one via admin REST API"
  source PROJECT_CONFIG.env
  TOKEN=$(curl -s -X POST http://localhost:9000/auth/user/emailpass \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL_DEV\",\"password\":\"$ADMIN_PASSWORD_DEV\"}" \
    | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>{try{console.log(JSON.parse(d).token||"")}catch{console.log("")}})')
  if [ -z "$TOKEN" ]; then echo "Could not auth admin"; exit 1; fi
  KEY=$(curl -s -X POST http://localhost:9000/admin/api-keys \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"storefront","type":"publishable"}' \
    | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>{try{console.log(JSON.parse(d).api_key.token||JSON.parse(d).api_key.id||"")}catch{console.log("")}})')
fi

if [ -z "$KEY" ]; then echo "Failed to obtain a publishable key"; exit 1; fi

echo "Publishable key: $KEY"

ENV_FILE="apps/storefront/.env.local"
if grep -q "^NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=" "$ENV_FILE"; then
  # Replace existing line cross-platform (avoid sed -i quirks on macOS/Windows)
  node -e "
    const fs=require('fs');
    const p='$ENV_FILE';
    const k='$KEY';
    const txt=fs.readFileSync(p,'utf8').replace(/^NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*/m,'NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY='+k);
    fs.writeFileSync(p,txt);
  "
else
  echo "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$KEY" >> "$ENV_FILE"
fi
echo "Wrote key to $ENV_FILE"
