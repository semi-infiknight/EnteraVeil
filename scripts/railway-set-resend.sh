#!/usr/bin/env bash
# Set Resend email vars on Railway (no Razorpay). Source .env.railway.local first.
set -euo pipefail

set_var() {
  local service="$1" name="$2" value="$3"
  if [ -z "$value" ]; then
    echo "  skip ${service}.${name} (empty)"
    return
  fi
  echo "  set ${service}.${name}"
  npx @railway/cli variable set --service "$service" "${name}=${value}"
}

echo "→ Medusa email (Resend)"
set_var medusa RESEND_API_KEY "${RESEND_API_KEY:-}"
set_var medusa RESEND_FROM_EMAIL "${RESEND_FROM_EMAIL:-orders@enteraveil.com}"
set_var medusa ADMIN_EMAIL "${ADMIN_EMAIL:-}"

echo "→ Done. Redeploy medusa after Resend changes."