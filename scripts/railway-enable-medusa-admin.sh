#!/usr/bin/env bash
# Re-enable Medusa admin UI on Railway (.medusa/client is already in the Docker image).
set -euo pipefail

echo "→ Removing DISABLE_MEDUSA_ADMIN on medusa"
npx @railway/cli variable delete --service medusa DISABLE_MEDUSA_ADMIN 2>/dev/null \
  || npx @railway/cli variable set --service medusa DISABLE_MEDUSA_ADMIN=false

echo "→ Redeploying medusa"
npx @railway/cli redeploy --service medusa --yes

echo "→ Admin should be at: https://medusa-production-e8b6.up.railway.app/app"