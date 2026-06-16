# EnteraVeil

## Stack
Medusa 2.0 (Node 20+, TS, Postgres, Redis) + Next.js App Router + Strapi 5 + Razorpay + Resend.
**Production:** Railway (separate services). **Local:** Docker Compose. India market: ships Bangalore + Raipur.

## Structure (monorepo, pnpm workspaces)
- `apps/medusa/` — backend + admin (`/app`)
- `apps/storefront/` — Next.js storefront
- `apps/strapi/` — Strapi CMS
- `reference/` — gitignored read-only clones
- `docs/PRODUCTION-STATE.md` — **update when production changes**
- `docs/deviations.md` — every non-trivial decision logged here
- `docs/DEPLOY.md` — Railway deploy runbook

## Rules
- TypeScript everywhere; `any` requires inline justification
- Tailwind only; no CSS-in-JS
- Server components default; mark client `"use client"`
- pnpm for packages
- Secrets via `process.env`; never hardcoded; never commit passwords in markdown
- NEVER add Stripe; Razorpay only
- NEVER commit `.env*`
- NEVER run destructive DB commands without confirmation
- After any code change: `pnpm typecheck` in the affected app
- After deploy/topology changes: update `docs/PRODUCTION-STATE.md` + `docs/deviations.md`
- At phase end: commit with `feat:`/`fix:`/`chore:`, tag `phase-N-done`

## Brand
EnteraVeil — anime streetwear. Dark default. Wordmark logo in Space Grotesk.
Tokens from PROJECT_CONFIG.env: BRAND_BG / BRAND_FG / BRAND_ACCENT / BRAND_ACCENT_DEEP / BRAND_MUTED.

## Commands
- `pnpm dev` — all apps (local)
- `pnpm typecheck` / `pnpm lint`
- `cd apps/medusa && pnpm medusa db:migrate`
- `docker compose up -d` / `docker compose down` (local)
- Railway CLI: `npx @railway/cli` or `node node_modules/@railway/cli/bin/railway.js`

## URLs
| Env | Storefront | Medusa | Strapi |
|-----|------------|--------|--------|
| Local | localhost:8000 | localhost:9000/app | localhost:1337/admin |
| Railway | storefront-production-bb74.up.railway.app | medusa-production-e8b6.up.railway.app | strapi-production-2a4f.up.railway.app |