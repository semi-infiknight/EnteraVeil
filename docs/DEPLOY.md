# EnteraVeil — Production Deployment (Railway)

End-to-end runbook for taking EnteraVeil live on [Railway](https://railway.com). All stack components run as separate Railway services in one project — no VPS, no Caddy, no Docker Compose on a droplet.

**Live project:** [enteraveil on Railway](https://railway.com/project/a098d5f4-ebc5-41ed-a16e-3547c82d2b0b?environmentId=9c4375bb-bf48-4c61-86b1-b9a6dc28968d)

**Current snapshot (URLs, done/pending, smoke tests):** [`docs/PRODUCTION-STATE.md`](./PRODUCTION-STATE.md) — update this file whenever production changes.

---

## Architecture on Railway

| Railway service | Role | Public URL (production) |
|-----------------|------|-------------------------|
| **storefront** | Next.js 14 storefront | `https://storefront-production-bb74.up.railway.app` |
| **medusa** | Medusa 2 API + admin (`/app`) | `https://medusa-production-e8b6.up.railway.app` |
| **strapi** | Strapi 5 CMS (`/admin`) | `https://strapi-production-2a4f.up.railway.app` |
| **Postgres** | PostgreSQL 18 (Medusa + Strapi DBs) | private — `${{Postgres.DATABASE_URL}}` |
| **Redis** | Redis 8 (Medusa cache/events) | private — `${{Redis.REDIS_URL}}` |

Custom domains (when you own `enteraveil.com`):

| Host | Railway service |
|------|-----------------|
| `enteraveil.com` | storefront |
| `api.enteraveil.com` | medusa |
| `cms.enteraveil.com` | strapi |

> Razorpay webhooks POST to the **medusa** service. Railway terminates TLS at the edge — no Cloudflare orange-cloud caveat. When you add a custom domain for `api.*`, point DNS directly at Railway (CNAME to the Railway target).

---

## 1. Prerequisites

- [Railway CLI](https://docs.railway.com/cli) installed and logged in (`railway login`)
- This repo cloned locally
- GitHub repo `semi-infiknight/EnteraVeil` connected to the Railway services (already done for production)

Link the project from your laptop:

```bash
cd EnteraVeil
railway link -p a098d5f4-ebc5-41ed-a16e-3547c82d2b0b -e 9c4375bb-bf48-4c61-86b1-b9a6dc28968d
```

---

## 2. What gets deployed

Each app service builds from its **Dockerfile** (monorepo root context):

- `apps/medusa/Dockerfile` — port 9000, health `/health`
- `apps/storefront/Dockerfile` — port 8000, health `/in`
- `apps/strapi/Dockerfile` — port 1337, health `/admin`

Config-as-code per service: `apps/<app>/railway.toml` (builder, watch paths, healthchecks, Medusa pre-deploy migrate).

Infrastructure-as-code (optional): `.railway/railway.ts` — run `railway config plan` / `railway config apply` after installing `pnpm` deps (`railway` + `tsx` devDependencies).

---

## 3. First-time / fresh environment setup

### 3a. Add data services (if starting blank)

```bash
railway add --database postgres --json
railway add --database redis --json
```

### 3b. Add app services from GitHub

```bash
railway add --repo semi-infiknight/EnteraVeil --branch main --service medusa
railway add --repo semi-infiknight/EnteraVeil --branch main --service storefront
railway add --repo semi-infiknight/EnteraVeil --branch main --service strapi
```

### 3c. Force Docker builds (not Railpack)

```bash
railway variable set RAILWAY_DOCKERFILE_PATH=apps/medusa/Dockerfile --service medusa
railway variable set RAILWAY_DOCKERFILE_PATH=apps/storefront/Dockerfile --service storefront
railway variable set RAILWAY_DOCKERFILE_PATH=apps/strapi/Dockerfile --service strapi
```

Or run the bundled script (wires cross-service URLs too):

```bash
./scripts/railway-set-vars.sh
```

### 3d. Generate Railway domains

```bash
railway domain --service medusa
railway domain --service storefront
railway domain --service strapi
```

Update `MEDUSA_URL` / `STOREFRONT_URL` / `STRAPI_URL` in `scripts/railway-set-vars.sh` if domains change, then re-run the script.

### 3e. Secrets

Copy `.env.railway.template` and set values on each service. Minimum to boot:

| Service | Keys |
|---------|------|
| medusa | `JWT_SECRET`, `COOKIE_SECRET`, `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `REDIS_URL=${{Redis.REDIS_URL}}` |
| strapi | `APP_KEYS` (4 comma-separated), `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET` (users-permissions), `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`, `DATABASE_*` → `${{Postgres.*}}` |
| storefront | `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_STRAPI_URL`, `STRAPI_WEBHOOK_REVALIDATION_SECRET` |

Razorpay + Resend are optional at first boot (COD works without Razorpay; emails skip without Resend).

Generate secrets:

```bash
openssl rand -hex 32   # JWT_SECRET, COOKIE_SECRET
openssl rand -hex 24   # STRAPI_WEBHOOK_REVALIDATION_SECRET, RAZORPAY_WEBHOOK_SECRET
openssl rand -base64 16  # each Strapi salt/key (repeat 4× for APP_KEYS)
```

### 3f. Create Strapi database on shared Postgres

Medusa uses the default `railway` database. Strapi needs a `strapi` database:

```bash
# Uses DATABASE_PUBLIC_URL from the Postgres service
DB_URL=$(railway variable list --service Postgres --json | jq -r .DATABASE_PUBLIC_URL)
psql "$DB_URL" -f scripts/railway-init-db.sql
```

### 3g. Strapi uploads volume

Production already has `strapi-volume` at `/app/apps/strapi/public/uploads`. For a fresh env:

```bash
npx @railway/cli service link strapi
npx @railway/cli volume add -m /app/apps/strapi/public/uploads
```

### 3h. Ops scripts (production)

| Script | When |
|--------|------|
| `./scripts/railway-set-vars.sh` | First boot; again after custom domains |
| `./scripts/railway-seed-medusa.sh` | Idempotent Medusa catalog + INR + filters |
| `./scripts/railway-setup-strapi-webhook.sh` | After `STRAPI_WEBHOOK_REVALIDATION_SECRET` on storefront |
| `./scripts/railway-set-resend.sh` | Resend + `ADMIN_EMAIL` (no Razorpay) |
| `./scripts/railway-set-secrets.sh` | Razorpay — **run last** |
| `./scripts/railway-enable-medusa-admin.sh` | Opt in to `/app` after scaling medusa ≥1 GB RAM |

CLI: `npx @railway/cli` or `node node_modules/@railway/cli/bin/railway.js`. Template: `.env.railway.template`.

---

## 4. Deploy

Push to `main` (GitHub trigger) **or** redeploy from CLI:

```bash
./scripts/railway-deploy.sh
# or per service:
railway redeploy --service medusa --yes
```

Medusa runs `pnpm medusa db:migrate` as a pre-deploy step (see `apps/medusa/railway.toml`).

Watch builds:

```bash
railway logs --service medusa
railway service status --json
```

---

## 5. Browser-only setup (one-time)

Use Railway URLs (see [`PRODUCTION-STATE.md`](./PRODUCTION-STATE.md) for current status).

1. **Strapi admin** — `https://<strapi-domain>/admin` → admin user (SSH if needed) → API token (read-only) → `STRAPI_API_TOKEN` on **storefront** → redeploy storefront. CMS seeded on boot (`apps/strapi/src/index.ts`).
2. **Medusa admin** — `https://<medusa-domain>/app` (root `/` is 404 by design). Create user via SSH; catalog via `./scripts/railway-seed-medusa.sh` (not full `seed.ts` on prod).
   ```bash
   npx @railway/cli ssh --service medusa
   pnpm medusa user --email you@yourbox.com --password '<strong>'
   ```
   → Publishable API Keys → `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` on **storefront** → redeploy storefront.
3. **India region** — `pnpm medusa exec ./src/scripts/setup-india.ts` (confirm on prod).
4. **Strapi revalidation** — `./scripts/railway-setup-strapi-webhook.sh` (Strapi 5: no `enabled` field in payload).
5. **Razorpay webhook** (when keys exist) — `https://<medusa-domain>/hooks/payment/razorpay_razorpay`.

**Medusa `/app` requirements:** `ENABLE_MEDUSA_ADMIN=true` on Railway; Dockerfile builds admin bundle and symlinks `public/admin` → `.medusa/server/public/admin`. See `docs/deviations.md`.

---

## 6. Smoke test

```bash
curl -sI https://storefront-production-bb74.up.railway.app/in | head -1
curl -sI https://medusa-production-e8b6.up.railway.app/health | head -1
curl -sI https://strapi-production-2a4f.up.railway.app/admin | head -1
```

---

## 7. Custom domains

```bash
railway domain enteraveil.com --service storefront
railway domain api.enteraveil.com --service medusa
railway domain cms.enteraveil.com --service strapi
```

Add the CNAME records Railway prints to your DNS host. Re-run `./scripts/railway-set-vars.sh` with the production hostnames so CORS / `NEXT_PUBLIC_*` URLs match.

---

## 8. Rolling forward

```bash
git push origin main          # triggers GitHub → Railway rebuild
./scripts/railway-deploy.sh   # or manual redeploy if only env changed
```

Copy edits in Strapi/Medusa admin still propagate via the revalidation webhook — no redeploy needed for CMS copy.

---

## 9. What can go wrong

| Symptom | Fix |
|---------|-----|
| Build fails with "No start command" (Railpack) | Set `RAILWAY_DOCKERFILE_PATH` on the service |
| Storefront shows wrong API host | `NEXT_PUBLIC_*` are **build-time** — change vars, then **redeploy** storefront |
| Strapi "database does not exist" | Run `scripts/railway-init-db.sql` against Postgres |
| Medusa migration fails | `railway logs --service medusa` — confirm `DATABASE_URL=${{Postgres.DATABASE_URL}}` |
| Razorpay webhook 401 | Wrong `RAZORPAY_WEBHOOK_SECRET` on medusa |
| Strapi `/admin` returns "Not Found" | Runner image must symlink `build` → `dist/build` (see `apps/strapi/Dockerfile`); do not copy `tsconfig.json` into runner (triggers TS compile with no sources) |
| Strapi `/api/*` returns 404 | Runner must also symlink `src` → `dist/src` so content-type routes and bootstrap seed load; restart after deploy — seed is idempotent in `apps/strapi/src/index.ts` |
| OOM / slow cold starts | Scale service memory in Railway dashboard (Medusa `/app` + Strapi admin are hungry) |
| Medusa `/app` white screen | `public/admin` must point to `.medusa/server/public/admin`, not `.medusa/client` (dev stub loads `./entry.jsx` → 404) |
| Medusa `/app` 404 | Set `ENABLE_MEDUSA_ADMIN=true`; ensure admin bundle built in Docker (`ENABLE_MEDUSA_ADMIN=true` in builder stage) |
| Storefront legal pages old content | `railway up --service storefront` — redeploy alone may not rebuild from latest `main` |
| `npx @railway/cli` silent fail | Run `node node_modules/@railway/cli/npm-install/postinstall.js` then use `node node_modules/@railway/cli/bin/railway.js` |

See `docs/troubleshooting.md` for more.

---

## 10. Cost note

Railway Hobby/Pro usage billing. Postgres + Redis + 3 Node services typically lands around **$15–25/mo** on light traffic.