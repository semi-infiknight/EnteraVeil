# syntax=docker/dockerfile:1.7
#
# Strapi production image. Builder compiles admin + config; runner installs
# prod deps only (includes pg for Postgres) and copies dist/config → config/.

# ----- builder -----
FROM node:20-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential pkg-config libc6-dev \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.34.1 --activate

WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/medusa/package.json apps/medusa/package.json
COPY apps/storefront/package.json apps/storefront/package.json
COPY apps/strapi/package.json apps/strapi/package.json

RUN pnpm install --frozen-lockfile --filter ./apps/strapi...

COPY apps/strapi apps/strapi
RUN pnpm --filter ./apps/strapi build

# ----- runner -----
FROM node:20-bookworm-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips libvips-tools \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.34.1 --activate

ENV NODE_ENV=production
WORKDIR /app

RUN groupadd --system --gid 1001 strapi \
  && useradd --system --uid 1001 --gid strapi strapi

COPY --chown=strapi:strapi pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY --chown=strapi:strapi apps/strapi/package.json apps/strapi/

RUN pnpm install --frozen-lockfile --prod --filter ./apps/strapi... \
  && pnpm store prune

COPY --from=builder --chown=strapi:strapi /repo/apps/strapi/dist apps/strapi/dist
COPY --from=builder --chown=strapi:strapi /repo/apps/strapi/dist/config apps/strapi/config
COPY --from=builder --chown=strapi:strapi /repo/apps/strapi/public apps/strapi/public
COPY --from=builder --chown=strapi:strapi /repo/apps/strapi/favicon.png apps/strapi/

WORKDIR /app/apps/strapi

ENV HOME=/app
RUN mkdir -p /app/.cache /app/.config && chown -R strapi:strapi /app/.cache /app/.config

USER strapi
EXPOSE 1337

CMD ["sh", "-c", "pnpm exec strapi start"]