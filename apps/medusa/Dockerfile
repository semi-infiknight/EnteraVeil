# syntax=docker/dockerfile:1.7
# ----- builder -----
FROM node:20-bookworm-slim AS builder

# pnpm via corepack
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.34.1 --activate

WORKDIR /repo

# Copy lockfile + workspace metadata first for cached install
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/medusa/package.json apps/medusa/package.json
COPY apps/storefront/package.json apps/storefront/package.json
COPY apps/strapi/package.json apps/strapi/package.json

# Fetch all deps into the pnpm store (workspace-wide)
RUN pnpm fetch

# Bring in the medusa source
COPY apps/medusa apps/medusa

# Install + build the medusa workspace only
RUN pnpm install --offline --frozen-lockfile --filter ./apps/medusa...
RUN pnpm --filter ./apps/medusa build

# Produce a self-contained deploy tree (pnpm deploy bakes only the
# medusa workspace's deps into /app, no symlinks to workspace root)
RUN pnpm --filter ./apps/medusa deploy --prod /app

# ----- runner -----
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
WORKDIR /app

# Non-root user
RUN groupadd --system --gid 1001 medusa \
  && useradd --system --uid 1001 --gid medusa medusa \
  && chown -R medusa:medusa /app

COPY --from=builder --chown=medusa:medusa /app /app

USER medusa
EXPOSE 9000

# `medusa start` reads medusa-config.ts; migrations are run by deploy.sh.
CMD ["node_modules/.bin/medusa", "start"]
