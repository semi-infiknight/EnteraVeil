#!/usr/bin/env bash
# Opt in to Medusa admin UI on Railway. Scale medusa memory to ≥1 GB first.
set -euo pipefail

echo "→ Setting ENABLE_MEDUSA_ADMIN=true on medusa (requires ≥1 GB RAM)"
npx @railway/cli variable set --service medusa ENABLE_MEDUSA_ADMIN=true
npx @railway/cli variable delete --service medusa DISABLE_MEDUSA_ADMIN 2>/dev/null || true

echo "→ Redeploying medusa"
npx @railway/cli redeploy --service medusa --yes

echo "→ Admin: https://medusa-production-e8b6.up.railway.app/app"
echo "  If /health stays 502, scale memory in Railway dashboard then redeploy."