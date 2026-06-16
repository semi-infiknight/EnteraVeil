# syntax=docker/dockerfile:1.7
#
# Medusa production image. Builds in a fat builder stage, ships a
# trimmed runner stage. Skips `pnpm deploy` (which has known bugs
# with v10 + workspace + Medusa's plugin structure) — instead copies
# the built app directly and prunes dev deps in the runner stage.

# ----- builder -----
FROM node:20-bookworm-slim AS builder

# Native compile tools for any modules that need them at install time
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential pkg-config libc6-dev curl \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.34.1 --activate

WORKDIR /repo

# Workspace metadata first for cached install layer
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/medusa/package.json apps/medusa/package.json
COPY apps/storefront/package.json apps/storefront/package.json
COPY apps/strapi/package.json apps/strapi/package.json

# Install with online registry — more reliable than fetch+offline
RUN pnpm install --frozen-lockfile --filter ./apps/medusa...

# Bring in the medusa source and build
COPY apps/medusa apps/medusa
RUN pnpm --filter ./apps/medusa build

# ----- runner -----
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
WORKDIR /app

# Need pnpm in runner to run scripts (medusa exec, db:migrate)
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.34.1 --activate

# Non-root user
RUN groupadd --system --gid 1001 medusa \
  && useradd --system --uid 1001 --gid medusa medusa

# Copy workspace metadata
COPY --chown=medusa:medusa pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY --chown=medusa:medusa apps/medusa/package.json apps/medusa/

# package.json still declares yarn@3 — strip so corepack doesn't hijack pnpm at runtime
RUN node -e "const fs=require('fs'); const p='apps/medusa/package.json'; const j=JSON.parse(fs.readFileSync(p,'utf8')); delete j.packageManager; fs.writeFileSync(p, JSON.stringify(j,null,2));"

# Install prod deps only (smaller image)
RUN pnpm install --frozen-lockfile --prod --filter ./apps/medusa... \
  && pnpm store prune

# Bring the built app + necessary runtime files
COPY --from=builder --chown=medusa:medusa /repo/apps/medusa/.medusa apps/medusa/.medusa
COPY --from=builder --chown=medusa:medusa /repo/apps/medusa/medusa-config.ts apps/medusa/
COPY --from=builder --chown=medusa:medusa /repo/apps/medusa/instrumentation.ts apps/medusa/
COPY --from=builder --chown=medusa:medusa /repo/apps/medusa/src apps/medusa/src

WORKDIR /app/apps/medusa

# Writable HOME for corepack/pnpm when running as non-root on Railway
ENV HOME=/app
RUN mkdir -p /app/.cache && chown -R medusa:medusa /app/.cache

USER medusa
EXPOSE 9000

CMD ["pnpm", "start"]
