# EnteraVeil — Production state (Railway)

**Last updated:** 2026-10-28  
**Keep this file current** whenever deploy topology, URLs, seeds, or integrations change.

Canonical deploy runbook: [`docs/DEPLOY.md`](./DEPLOY.md). Decision log: [`docs/deviations.md`](./deviations.md).

---

## Live URLs

| Surface | URL | Notes |
|---------|-----|-------|
| **Storefront** | https://storefront-production-6736.up.railway.app/in | Country redirect from `/` → `/in` |
| **Medusa API** | https://medusa-production-6fe4.up.railway.app | Root `/` → 404 (expected). Health: `/health` |
| **Medusa admin** | https://medusa-production-6fe4.up.railway.app/app | Dashboard UI |
| **Strapi CMS** | https://strapi-production-5248.up.railway.app/admin | Content admin |

**Railway project:** [enteraveil](https://railway.com/project/a08ad31d-1a7d-44dd-a3d3-aeb6b5b64c48?environmentId=43492585-64fe-42ae-a3d9-13192f866b05)

```bash
cd EnteraVeil
npx @railway/cli login
npx @railway/cli link -p a08ad31d-1a7d-44dd-a3d3-aeb6b5b64c48 -e 43492585-64fe-42ae-a3d9-13192f866b05
```

> Use `node node_modules/@railway/cli/bin/railway.js` if `npx @railway/cli` fails (run `node node_modules/@railway/cli/npm-install/postinstall.js` once to fetch the native binary). The root `railway` npm package is the IaC SDK, not the CLI.

---

## Railway services

| Service | Image | Volume | Health |
|---------|-------|--------|--------|
| **storefront** | `apps/storefront/Dockerfile` | — | `/in` |
| **medusa** | `apps/medusa/Dockerfile` | — | `/health` |
| **strapi** | `apps/strapi/Dockerfile` | `strapi-uploads` → `/app/apps/strapi/public/uploads` | `/admin` |
| **Postgres** | Railway template | `postgres-volume` | private |
| **Redis** | Railway template | `redis-volume` | private |

- Medusa DB: default `railway` database on shared Postgres.
- Strapi DB: `strapi` database, auto-created on boot by `apps/strapi/scripts/ensure-db.cjs` (no SSH required).
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
- [x] First-boot bootstrap (`src/scripts/bootstrap-prod.ts`): default store, sales channel, demo seed when catalog empty, India region, INR prices, shop filters, publishable key
- [x] Idempotent catalog seed (`seed-catalog-if-empty.ts`) — 4 demo products
- [x] INR prices + shop filters seeded (`seed-inr-prices.ts`, `seed-shop-filters.ts`)
- [x] Payment providers: COD (`pp_system_default`) only — Razorpay registers automatically when keys are set
- [x] Shipping options attached to the products' *Default Shipping Profile* (checkout fix — see `setup-india.ts`)
- [x] Admin UI enabled (`ENABLE_MEDUSA_ADMIN=true`) with Dockerfile fix:
  - Build always runs Vite admin bundle (`ENABLE_MEDUSA_ADMIN=true` in builder stage)
  - `public/admin` → `.medusa/server/public/admin` (not `.medusa/client` dev stub)
- [x] Admin user created on boot from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (values live in Railway only — **never commit**)
- [x] Redis wired via `projectConfig.redisUrl` (`REDIS_URL`)
- [x] Publishable key set as `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` on storefront (build-time; redeploy after rotation)

### Verified end-to-end (2026-10-28)
- [x] COD checkout: cart → shipping → `pp_system_default` → order `total=1149 INR` (test order canceled afterwards)
- [x] Storefront renders Medusa catalog + Strapi homepage sections on `/in`
- [x] Strapi admin login works; webhook `storefront-revalidate` registered
- [x] Strapi public API returns seeded content (`/api/homepage-sections` = 200)

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
4. Real catalog in Medusa (replace demo SKUs)
5. Strapi content/images in admin

### Phase 9 acceptance (from `PLAN.md` 🛑)
1. ~~**COD test order**~~ — verified 2026-10-28 (order completed, canceled after test)
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
| **Real product catalog** | Replace 4 demo SKUs in Medusa admin |
| **Strapi hero images** | Upload in Strapi admin (seed is text-only) |
| **FAQ page** | Still uses legacy Solace `getFAQ()` in `lib/data/fetch.ts` |
| **Home lookbook strip** | Hardcoded Unsplash; `/lookbook` uses Strapi |
| **Footer dead links** | Careers / Support / Contact → `#` (Strapi has `/legal/contact`) |
| **Phase 9 acceptance** | Strapi revalidation check, live Razorpay ₹1, admin-guide review |

---

## Admin access (no secrets in git)

Credentials are set as Railway variables and created automatically on boot:

| App | Variable | Where |
|-----|----------|-------|
| Medusa | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | medusa service → `/app` |
| Strapi | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | strapi service → `/admin` |

Neither password is in git. Retrieve or rotate them in the Railway dashboard (service → Variables), then redeploy that service — both bootstraps are idempotent and will create the user if missing / re-activate it.

```bash
# Rotate Medusa admin password (Railway dashboard is easiest)
# then redeploy medusa; existing users are left untouched, so delete the
# old user in /app → Settings → Users if you rotate the address.
```

Storefront needs `STRAPI_API_TOKEN` (read-only, optional — public read is enabled) and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (from Medusa admin → Settings → Publishable API Keys) — both are **build-time** on storefront; redeploy after changing.

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
curl -sI https://storefront-production-6736.up.railway.app/in | head -1
curl -sI https://medusa-production-6fe4.up.railway.app/health | head -1
curl -sI https://strapi-production-5248.up.railway.app/admin | head -1
curl -sI https://storefront-production-6736.up.railway.app/in/privacy-policy | grep -i location
# expect redirect to /in/legal/privacy-policy
```