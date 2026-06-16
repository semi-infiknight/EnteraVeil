#!/bin/bash
# Redeploy all EnteraVeil app services on Railway (after env/config changes).
set -euo pipefail

export PATH="$(npm prefix -g)/bin:${PATH:-}"

SERVICES=(medusa storefront strapi)

for svc in "${SERVICES[@]}"; do
  echo "→ Redeploying ${svc}..."
  railway redeploy --service "$svc" --yes 2>&1 || railway up --service "$svc" -d -y 2>&1
done

echo "→ Deployments triggered. Watch: railway service status --json"