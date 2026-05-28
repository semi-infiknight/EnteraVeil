# syntax=docker/dockerfile:1.7
# ----- builder -----
FROM node:20-bookworm-slim AS builder

ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.34.1 --activate

# Strapi sharp/native image build needs build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 build-essential pkg-config libc6-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/medusa/package.json apps/medusa/package.json
COPY apps/storefront/package.json apps/storefront/package.json
COPY apps/strapi/package.json apps/strapi/package.json

RUN pnpm fetch

COPY apps/strapi apps/strapi

RUN pnpm install --offline --frozen-lockfile --filter ./apps/strapi...
RUN pnpm --filter ./apps/strapi build

RUN pnpm --filter ./apps/strapi deploy --prod /app

# ----- runner -----
FROM node:20-bookworm-slim AS runner

# libvips for sharp at runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
  libvips libvips-tools \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
WORKDIR /app

RUN groupadd --system --gid 1001 strapi \
  && useradd --system --uid 1001 --gid strapi strapi

COPY --from=builder --chown=strapi:strapi /app /app

USER strapi
EXPOSE 1337

CMD ["node_modules/.bin/strapi", "start"]
