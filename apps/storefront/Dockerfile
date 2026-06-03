# syntax=docker/dockerfile:1.7
#
# Storefront production image. Next.js 16 standalone output keeps the
# runner stage small (~180 MB). Adds ARGs for NEXT_PUBLIC_* values so
# Next can inline them at build time — without these the build fails
# when middleware (proxy.ts) reads them.

# ----- builder -----
FROM node:20-bookworm-slim AS builder

# Native build deps for any module that needs them
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential pkg-config \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.34.1 --activate

WORKDIR /repo

# Workspace metadata for cache
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/medusa/package.json apps/medusa/package.json
COPY apps/storefront/package.json apps/storefront/package.json
COPY apps/strapi/package.json apps/strapi/package.json

# Install with online registry — more reliable than fetch+offline
RUN pnpm install --frozen-lockfile --filter ./apps/storefront...

COPY apps/storefront apps/storefront

# Build-time env. These are baked into the output bundle by Next.
# Defaults to localhost so builds in environments without runtime env
# (the GHA runner) succeed. Production runtime overrides these via
# .env.prod / docker-compose environment:.
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
ARG NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_placeholder
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_placeholder
ARG NEXT_PUBLIC_SHOP_NAME=EnteraVeil
ARG NEXT_PUBLIC_SHOP_DESCRIPTION=Anime\ streetwear\ from\ beyond\ the\ veil

ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL \
    NEXT_PUBLIC_STRAPI_URL=$NEXT_PUBLIC_STRAPI_URL \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
    NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID \
    NEXT_PUBLIC_SHOP_NAME=$NEXT_PUBLIC_SHOP_NAME \
    NEXT_PUBLIC_SHOP_DESCRIPTION=$NEXT_PUBLIC_SHOP_DESCRIPTION \
    NEXT_TELEMETRY_DISABLED=1

RUN pnpm --filter ./apps/storefront build

# ----- runner -----
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

RUN groupadd --system --gid 1001 nextjs \
  && useradd --system --uid 1001 --gid nextjs nextjs

# Next.js standalone bundle ships its own node_modules subset.
# Path structure produced by `output: 'standalone'` with
# outputFileTracingRoot at repo root: standalone/apps/storefront/server.js
COPY --from=builder --chown=nextjs:nextjs /repo/apps/storefront/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /repo/apps/storefront/.next/static ./apps/storefront/.next/static
COPY --from=builder --chown=nextjs:nextjs /repo/apps/storefront/public ./apps/storefront/public

USER nextjs
EXPOSE 8000
ENV PORT=8000 HOSTNAME=0.0.0.0

CMD ["node", "apps/storefront/server.js"]
