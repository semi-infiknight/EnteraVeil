# syntax=docker/dockerfile:1.7
#
# Storefront production image. Builder runs `next build`; runner stage
# COPYs the build output + node_modules from the builder (avoids a
# second pnpm install in the runner that would need native build tools).

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

SHELL ["/bin/bash", "-eo", "pipefail", "-c"]
RUN pnpm --filter ./apps/storefront build

# ----- runner -----
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.34.1 --activate

RUN groupadd --system --gid 1001 nextjs \
  && useradd --system --uid 1001 --gid nextjs nextjs

# Copy the entire built workspace tree from the builder. The pnpm-store
# symlinks resolve because we bring node_modules verbatim.
COPY --from=builder --chown=nextjs:nextjs /repo/package.json /repo/pnpm-workspace.yaml /repo/pnpm-lock.yaml ./
COPY --from=builder --chown=nextjs:nextjs /repo/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nextjs /repo/apps/storefront ./apps/storefront

USER nextjs
WORKDIR /app/apps/storefront
EXPOSE 8000
ENV PORT=8000 HOSTNAME=0.0.0.0

CMD ["pnpm", "start"]
