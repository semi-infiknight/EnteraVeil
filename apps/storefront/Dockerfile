# syntax=docker/dockerfile:1.7
# ----- builder -----
FROM node:20-bookworm-slim AS builder

ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.34.1 --activate

WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/medusa/package.json apps/medusa/package.json
COPY apps/storefront/package.json apps/storefront/package.json
COPY apps/strapi/package.json apps/strapi/package.json

RUN pnpm fetch

COPY apps/storefront apps/storefront

RUN pnpm install --offline --frozen-lockfile --filter ./apps/storefront...

# Build Next.js (standalone output to keep the final image small)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter ./apps/storefront build

# ----- runner -----
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

RUN groupadd --system --gid 1001 nextjs \
  && useradd --system --uid 1001 --gid nextjs nextjs

# Next.js standalone bundle ships its own node_modules subset
COPY --from=builder --chown=nextjs:nextjs /repo/apps/storefront/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /repo/apps/storefront/.next/static ./apps/storefront/.next/static
COPY --from=builder --chown=nextjs:nextjs /repo/apps/storefront/public ./apps/storefront/public

USER nextjs
EXPOSE 8000
ENV PORT=8000 HOSTNAME=0.0.0.0

CMD ["node", "apps/storefront/server.js"]
