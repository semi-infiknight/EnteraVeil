# EnteraVeil

## Stack
Medusa 2.0 (Node 20+, TS, Postgres 15, Redis 7) + Next.js 14 App Router + Strapi 5 + Razorpay + Resend.
Single DigitalOcean Bangalore droplet, Docker Compose. India market: ships Bangalore + Raipur.

## Structure (monorepo, pnpm workspaces)
- `apps/medusa/` — backend + admin
- `apps/storefront/` — Next.js storefront
- `apps/strapi/` — Strapi CMS
- `reference/` — gitignored read-only clones
- `docs/deviations.md` — every non-trivial decision logged here

## Rules
- TypeScript everywhere; `any` requires inline justification
- Tailwind only; no CSS-in-JS
- Server components default; mark client `"use client"`
- pnpm for packages
- Secrets via `process.env`; never hardcoded
- NEVER add Stripe; Razorpay only
- NEVER commit `.env*`
- NEVER run destructive DB commands without confirmation
- After any code change: `pnpm typecheck` in the affected app
- At phase end: commit with `feat:`/`fix:`/`chore:`, tag `phase-N-done`

## Brand
EnteraVeil — anime streetwear. Dark default. Wordmark logo in Space Grotesk.
Tokens from PROJECT_CONFIG.env: BRAND_BG / BRAND_FG / BRAND_ACCENT / BRAND_ACCENT_DEEP / BRAND_MUTED.

## Commands
- `pnpm dev` — all apps
- `pnpm typecheck` / `pnpm lint`
- `cd apps/medusa && pnpm medusa db:migrate`
- `docker compose up -d` / `docker compose down`
- Admin: localhost:9000/app | Storefront: localhost:8000 | Strapi: localhost:1337/admin
