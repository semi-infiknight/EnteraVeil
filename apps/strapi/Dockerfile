# syntax=docker/dockerfile:1.7
#
# Strapi production image. Skips `pnpm deploy` (which breaks with
# Strapi's bin path structure) — copies the built app + installs
# prod deps directly in the runner stage.

# ----- builder -----
FROM node:20-bookworm-slim AS builder

# Strapi sharp/native image build needs build tools
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

# Install with online registry (more reliable than fetch+offline)
RUN pnpm install --frozen-lockfile --filter ./apps/strapi...

COPY apps/strapi apps/strapi
RUN pnpm --filter ./apps/strapi build

# ----- runner -----
FROM node:20-bookworm-slim AS runner

# libvips for sharp at runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips libvips-tools \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.34.1 --activate

ENV NODE_ENV=production
WORKDIR /app

RUN groupadd --system --gid 1001 strapi \
  && useradd --system --uid 1001 --gid strapi strapi

# Workspace metadata
COPY --chown=strapi:strapi pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY --chown=strapi:strapi apps/strapi/package.json apps/strapi/

# Copy node_modules from builder — prod reinstall + raw config/*.ts breaks Strapi 5 prod boot
COPY --from=builder --chown=strapi:strapi /repo/node_modules ./node_modules
COPY --from=builder --chown=strapi:strapi /repo/apps/strapi/node_modules ./apps/strapi/node_modules

# Built output — strapi start expects ./config/*.js at app root (not dist/config)
COPY --from=builder --chown=strapi:strapi /repo/apps/strapi/dist apps/strapi/dist
COPY --from=builder --chown=strapi:strapi /repo/apps/strapi/dist/config apps/strapi/config
COPY --from=builder --chown=strapi:strapi /repo/apps/strapi/public apps/strapi/public
COPY --from=builder --chown=strapi:strapi /repo/apps/strapi/favicon.png apps/strapi/

WORKDIR /app/apps/strapi

ENV HOME=/app
RUN mkdir -p /app/.cache /app/.config && chown -R strapi:strapi /app/.cache /app/.config

USER strapi
EXPOSE 1337

CMD ["pnpm", "start"]
