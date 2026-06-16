# EnteraVeil — Production state (Railway)

**Last updated:** 2026-06-17  
**Keep this file current** whenever deploy topology, URLs, seeds, or integrations change.

Canonical deploy runbook: [`docs/DEPLOY.md`](./DEPLOY.md). Decision log: [`docs/deviations.md`](./deviations.md).

---

## Live URLs

| Surface | URL | Notes |
|---------|-----|-------|
| **Storefront** | https://storefront-production-bb74.up.railway.app/in | Country redirect from `/` → `/in` |
| **Medusa API** | https://medusa-production-e8b6.up.railway.app | Root `/` → 404 (expected). Health: `/health` |
| **Medusa admin** | https://medusa-production-e8b6.up.railway.app/app | Dashboard UI |
| **Strapi CMS** | https://strapi-production-2a4f.up.railway.app/admin | Content admin |

**Railway project:** [enteraveil](https://railway.com/project/a098d5f4-ebc5-41ed-a16e-3547c82d2b0b?environmentId=9c4375bb-bf48-4c61-86b1-b9a6dc28968d)

```bash
cd EnteraVeil
npx @railway/cli login
npx @railway/cli link -p a098d5f4-ebc5-41ed-a16e-3547c82d2b0b -e 9c4375bb-bf48-4c61-86b1-b9a6dc28968d
```

> Use `node node_modules/@railway/cli/bin/railway.js` if `npx @railway/cli` fails (run `node node_modules/@railway/cli/npm-install/postinstall.js` once to fetch the native binary). The root `railway` npm package is the IaC SDK, not the CLI.

---

## Railway services

| Service | Image | Volume | Health |
|---------|-------|--------|--------|
| **storefront** | `apps/storefront/Dockerfile` | — | `/in` |
| **medusa** | `apps/medusa/Dockerfile` | — | `/health` |
| **strapi** | `apps/strapi/Dockerfile` | `strapi-volume` → `/app/apps/strapi/public/uploads` | `/admin` |
| **Postgres** | Railway template | `postgres-volume` | private |
| **Redis** | Railway template | `redis-volume` | private |

- Medusa DB: default `railway` database on shared Postgres.
- Strapi DB: `strapi` database (created via `scripts/railway-init-db.sql`).
- GitHub `semi-infiknight/EnteraVeil` `main` triggers Railway rebuilds; storefront may need `npx @railway/cli up --service storefront` if GitHub deploy lags.

---

## What is done (production)

### Infrastructure
- [x] Postgres + Redis + three app services on Railway
- [x] Docker builds via `RAILWAY_DOCKERFILE_PATH` per service
- [x] Strapi uploads volume attached
- [x] Strapi bootstrap seed (about, blogs, lookbook, homepage sections, legal pages)
- [x] Strapi → storefront revalidation webhook (`storefront-revalidate`)

### Medusa
- [x] Migrations on deploy (`apps/medusa/railway.toml` pre-deploy)
- [x] Idempotent catalog seed (`seed-catalog-if-empty.ts`) — 4 demo products
- [x] INR prices + shop filters seeded (`seed-inr-prices.ts`, `seed-shop-filters.ts`)
- [x] Admin UI enabled (`ENABLE_MEDUSA_ADMIN=true`) with Dockerfile fix:
  - Build always runs Vite admin bundle (`ENABLE_MEDUSA_ADMIN=true` in builder stage)
  - `public/admin` → `.medusa/server/public/admin` (not `.medusa/client` dev stub)
- [x] Admin user created via SSH (credentials live in password manager — **never commit**)

### Storefront ↔ Strapi
- [x] Homepage hero/promo from `homepage-sections`
- [x] Blog from EnteraVeil `blog-post` APIs
- [x] About-us from Strapi `about` single-type
- [x] Lookbook list/detail from `lookbook-entries`
- [x] Legal pages at `/legal/[slug]`; legacy `/privacy-policy` and `/terms-and-conditions` redirect
- [x] Footer + register links point to `/legal/*`
- [x] Strapi image hosts allowed in `next.config.js`

### Scripts (repo)
| Script | Purpose |
|--------|---------|
| `scripts/railway-set-vars.sh` | Cross-service URLs + Dockerfile paths |
| `scripts/railway-set-secrets.sh` | Razorpay (run last) |
| `scripts/railway-set-resend.sh` | Resend + `ADMIN_EMAIL` only |
| `scripts/railway-seed-medusa.sh` | Catalog + INR + filters on Railway |
| `scripts/railway-setup-strapi-webhook.sh` | Register Strapi revalidation webhook |
| `scripts/railway-enable-medusa-admin.sh` | Opt in to `/app` (scale RAM ≥1 GB first) |
| `scripts/railway-deploy.sh` | Redeploy helper |

---

## What's next (per `PLAN.md`)

Phases 0–7 built the stack. **Phase 8** (go live) is **in progress on Railway** — adapted from the original DigitalOcean runbook in `docs/DEPLOY.md`.

| Phase | Goal | Status |
|-------|------|--------|
| **8 — Production deploy** | Live HTTPS, DNS, secrets, smoke tests | **~80%** — Railway up; custom domains + Resend + Razorpay pending |
| **9 — Final QA + handoff** | Admin guide, troubleshooting, acceptance tests, `phase-9-done` tag | **Partial** — docs exist; acceptance tests not signed off |

### Phase 8 remaining (Railway adaptation)
1. Custom domains (`enteraveil.com`, `api.*`, `cms.*`) + `railway-set-vars.sh`
2. Resend domain verified + `railway-set-resend.sh`
3. Razorpay LIVE keys + webhook (last)
4. Confirm `setup-india.ts` on prod
5. Real catalog in Medusa (replace demo SKUs)
6. Strapi content/images in admin

### Phase 9 acceptance (from `PLAN.md` 🛑)
1. **COD test order** — cart → checkout → Medusa order (+ emails when Resend live)
2. **Strapi edit** — change About in Strapi → storefront updates within ~60s
3. **`docs/admin-guide.md` review** — readable by non-dev operator
4. **Live Razorpay ₹1 purchase** — payment + webhook + both emails (after keys)

Then: `git tag phase-9-done` and **Done when** all nine phase tags exist + real Razorpay E2E (`PLAN.md` footer).

### Code polish (not blocking launch)
- Wire FAQ + home lookbook strip to Strapi
- Footer contact/careers links
- Verify Medusa `REDIS_URL` at runtime

---

## What is not done yet

| Item | Blocker / action |
|------|------------------|
| **Custom domains** | `enteraveil.com`, `api.*`, `cms.*` — DNS + `railway domain`; then re-run `railway-set-vars.sh` |
| **Resend email** | `RESEND_API_KEY` + verified domain → `./scripts/railway-set-resend.sh` |
| **Razorpay** | Keys + webhook → `./scripts/railway-set-secrets.sh` (intentionally last) |
| **`setup-india.ts`** | Confirm India region / BLR+RPR shipping ran on prod (may need SSH) |
| **Real product catalog** | Replace 4 demo SKUs in Medusa admin |
| **Strapi hero images** | Upload in Strapi admin (seed is text-only) |
| **FAQ page** | Still uses legacy Solace `getFAQ()` in `lib/data/fetch.ts` |
| **Home lookbook strip** | Hardcoded Unsplash; `/lookbook` uses Strapi |
| **Footer dead links** | Careers / Support / Contact → `#` (Strapi has `/legal/contact`) |
| **Medusa Redis at runtime** | Logs may show `redisUrl not found` — verify `REDIS_URL=${{Redis.REDIS_URL}}` |
| **Phase 9 acceptance** | COD order, Strapi revalidation, live Razorpay ₹1, admin-guide review |

---

## Admin access (no secrets in git)

Create and rotate credentials via Railway SSH. **Do not commit passwords.**

```bash
# Medusa — https://medusa-production-e8b6.up.railway.app/app
npx @railway/cli ssh --service medusa
pnpm medusa user --email you@yourbox.com --password '<strong>'

# Strapi — https://strapi-production-2a4f.up.railway.app/admin
npx @railway/cli ssh --service strapi
pnpm strapi admin:create-user \
  --email=you@yourbox.com --password=<strong> \
  --firstname=Entera --lastname=Veil
```

Storefront needs `STRAPI_API_TOKEN` (read-only, from Strapi admin) and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (from Medusa admin) — both are **build-time** on storefront; redeploy after changing.

Template for all Railway env vars: `.env.railway.template` (copy to `.env.railway.local`, gitignored).

---

## Medusa `/` vs `/app`

| Path | Behavior |
|------|----------|
| `/` | **404** — no public homepage (API-only host) |
| `/health` | **200** `OK` |
| `/app` | Admin dashboard (bundled JS under `/app/assets/*`) |
| `/store/*` | Storefront REST API |
| `/admin/*` | Admin REST API |

Shoppers use the **storefront** URL, not the Medusa host.

---

## Quick smoke test

```bash
curl -sI https://storefront-production-bb74.up.railway.app/in | head -1
curl -sI https://medusa-production-e8b6.up.railway.app/health | head -1
curl -sI https://strapi-production-2a4f.up.railway.app/admin | head -1
curl -sI https://storefront-production-bb74.up.railway.app/in/privacy-policy | grep -i location
# expect redirect to /in/legal/privacy-policy
```