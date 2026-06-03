# syntax=docker/dockerfile:1.7
#
# Storefront production image. Ships .next + production node_modules
# directly (no standalone tracing — that fights pnpm workspaces).
# ~600 MB runner image, but reliably builds in CI.

# ----- builder -----
FROM node:20-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential pkg-config \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.34.1 --activate

WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/medusa/package.json apps/medusa/package.json
COPY apps/storefront/package.json apps/storefront/package.json
COPY apps/strapi/package.json apps/strapi/package.json

RUN pnpm install --frozen-lockfile --filter ./apps/storefront...

COPY apps/storefront apps/storefront

ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
ARG NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_placeholder
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_placeholder
ARG NEXT_PUBLIC_SHOP_NAME=EnteraVeil

ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL \
    NEXT_PUBLIC_STRAPI_URL=$NEXT_PUBLIC_STRAPI_URL \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
    NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID \
    NEXT_PUBLIC_SHOP_NAME=$NEXT_PUBLIC_SHOP_NAME \
    NEXT_TELEMETRY_DISABLED=1

RUN pnpm --filter ./apps/storefront build

# Prune to prod-only deps after the build
RUN pnpm install --frozen-lockfile --prod --filter ./apps/storefront... \
  && pnpm store prune

# ----- runner -----
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.34.1 --activate

RUN groupadd --system --gid 1001 nextjs \
  && useradd --system --uid 1001 --gid nextjs nextjs

# Bring the workspace metadata + apps so the pnpm-store symlinks resolve
COPY --from=builder --chown=nextjs:nextjs /repo/pnpm-lock.yaml /repo/pnpm-workspace.yaml /repo/package.json ./
COPY --from=builder --chown=nextjs:nextjs /repo/apps/storefront/package.json apps/storefront/

# Reinstall prod deps in the runner so node_modules symlinks are clean
RUN pnpm install --frozen-lockfile --prod --filter ./apps/storefront... \
  && pnpm store prune

# Built output + public assets + .next
COPY --from=builder --chown=nextjs:nextjs /repo/apps/storefront/.next apps/storefront/.next
COPY --from=builder --chown=nextjs:nextjs /repo/apps/storefront/public apps/storefront/public
COPY --from=builder --chown=nextjs:nextjs /repo/apps/storefront/next.config.js apps/storefront/

USER nextjs
WORKDIR /app/apps/storefront
EXPOSE 8000
ENV PORT=8000 HOSTNAME=0.0.0.0

CMD ["pnpm", "start"]
