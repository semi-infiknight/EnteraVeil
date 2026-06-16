#!/usr/bin/env bash
# Set optional production secrets on Railway (interactive — reads from env or prompts).
# Copy .env.railway.template → .env.railway.local (gitignored), fill values, then:
#   set -a && source .env.railway.local && set +a && ./scripts/railway-set-secrets.sh
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

echo "→ Medusa payment + email"
set_var medusa RAZORPAY_ID "${RAZORPAY_ID:-}"
set_var medusa RAZORPAY_SECRET "${RAZORPAY_SECRET:-}"
set_var medusa RAZORPAY_WEBHOOK_SECRET "${RAZORPAY_WEBHOOK_SECRET:-}"
set_var medusa RAZORPAY_ACCOUNT "${RAZORPAY_ACCOUNT:-}"
set_var medusa RESEND_API_KEY "${RESEND_API_KEY:-}"
set_var medusa RESEND_FROM_EMAIL "${RESEND_FROM_EMAIL:-orders@enteraveil.com}"

echo "→ Storefront (redeploy required for NEXT_PUBLIC_*)"
set_var storefront NEXT_PUBLIC_RAZORPAY_KEY_ID "${RAZORPAY_ID:-}"
set_var storefront STRAPI_WEBHOOK_REVALIDATION_SECRET "${STRAPI_WEBHOOK_REVALIDATION_SECRET:-}"

echo "→ Done. Redeploy medusa + storefront after Razorpay/Resend changes."