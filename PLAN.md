# PLAN.md — EnteraVeil clothing store build spec for Claude Code

---

## 1. What this is

A nine-phase build of EnteraVeil — anime-streetwear graphic-tee store. Medusa 2.0 + Next.js 14 + Strapi 5 + Razorpay. Single VPS in Bangalore. Built to run autonomously by Claude Code with minimal interruption.

You (Claude Code) execute every phase in order. Commit at phase boundaries. Tag each phase. **Do not stop unless you hit a 🛑 marker** — those are the only places where a human action is genuinely required (credentials from third-party dashboards, browser-only setup wizards).

For all other ambiguity: **pick the most defensible option, log it in `docs/deviations.md`, proceed.**

---

## 2. Configuration

### `PROJECT_CONFIG.env` — read at every session start

The user has already created this at the project root. Read and use throughout.

```bash
# Brand
BRAND_NAME="EnteraVeil"
BRAND_TAGLINE=""
BRAND_FONT_HEADING="Space Grotesk"
BRAND_FONT_BODY="Inter"
LOGO_IS_WORDMARK=true

# Colors (dark-first anime streetwear palette)
BRAND_BG="#0A0A0A"
BRAND_FG="#F5F5F4"
BRAND_ACCENT="#FFB627"
BRAND_ACCENT_DEEP="#E8801A"
BRAND_MUTED="#3F3F46"
BRAND_DANGER="#EF4444"
DEFAULT_THEME="dark"

# Shipping (paise — Medusa smallest unit for INR)
BANGALORE_SHIPPING_RATE_PAISE=5000
RAIPUR_SHIPPING_RATE_PAISE=8000
FREE_SHIPPING_THRESHOLD_PAISE=150000
ENABLE_COD=true

# Local dev defaults (not real credentials)
ADMIN_EMAIL_DEV="admin@enteraveil.local"
ADMIN_PASSWORD_DEV="changemeindev"
```

### Secrets — never asked up front

Each secret is requested **only at the start of the phase that actually integrates it**. Until then, use placeholders that allow the app to boot. The phases below mark every credential stop with 🛑.

---

## 3. Decision-making rules

You will hit ambiguity constantly. Default behavior: **decide and proceed.** Log every non-trivial decision in `docs/deviations.md` with a one-line reason.

When choosing between options:
- Prefer the option with **most recent activity** (npm publish date, GitHub commits)
- Prefer **official** over community when comparable
- Prefer **fewer dependencies** when comparable
- Prefer the option that **matches existing patterns in the codebase**

When a file referenced in this plan doesn't exist where I said it would:
- Search the codebase for the closest equivalent
- Adapt the instruction to the actual structure
- Log the adaptation

When a package or version is no longer current:
- Use the current equivalent
- Log it

When a verification step fails:
- Investigate up to 3 reasonable fixes autonomously
- If still failing after 3 attempts, stop and report

Never ask the user to confirm a decision you can make yourself. Never ask "did this work?" — verify it yourself or move on.

---

## 4. CLAUDE.md — create in Phase 0

Write to `CLAUDE.md` at project root:

```markdown
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
```

---

# Phase 0: Skeleton

```bash
test -f PROJECT_CONFIG.env || { echo "Need PROJECT_CONFIG.env"; exit 1; }
source PROJECT_CONFIG.env

mkdir -p apps reference docs scripts
touch docs/deviations.md

cat > .gitignore <<'EOF'
node_modules/
.next/
dist/
build/
.env
.env.local
.env.*.local
.env.prod
reference/
.turbo/
.DS_Store
*.log
EOF

cat > package.json <<EOF
{
  "name": "enteraveil-store",
  "private": true,
  "packageManager": "pnpm@10.0.0",
  "workspaces": ["apps/*"],
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint"
  }
}
EOF

cat > README.md <<'EOF'
# EnteraVeil
Anime streetwear store. Medusa + Next.js + Strapi.
See PLAN.md.
EOF

git init -b main
```

Write CLAUDE.md from Section 4.

```bash
git add -A
git commit -m "chore: skeleton + CLAUDE.md"
git tag phase-0-done
```

### Self-verify
`test -f CLAUDE.md && test -f .gitignore && test -d apps && test -d docs && git log --oneline | wc -l` should show ≥ 1.

---

# Phase 1: Solace baseline

```bash
git clone --depth 1 https://github.com/rigby-sh/solace-medusa-starter.git reference/solace

cp -r reference/solace/medusa apps/medusa
cp -r reference/solace/storefront apps/storefront
find apps -name ".git" -type d -exec rm -rf {} + 2>/dev/null || true

cat > docker-compose.yml <<'EOF'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: medusa-store
    ports: ["5432:5432"]
    volumes: ["postgres-data:/var/lib/postgresql/data"]
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: ["redis-data:/data"]
volumes:
  postgres-data:
  redis-data:
EOF
```

Set up envs:
- `apps/medusa/.env` from its template. Generate random JWT_SECRET and COOKIE_SECRET (32-char hex). Set DATABASE_URL and REDIS_URL to localhost. Leave Razorpay/Resend/Stripe values as empty strings or test dummies — the app should still boot.
- `apps/storefront/.env.local` from its template. Leave `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` empty for now; you'll auto-fetch it below.

```bash
pnpm install
docker compose up -d
sleep 5

cd apps/medusa
pnpm medusa db:migrate
pnpm seed
pnpm medusa user -e "$ADMIN_EMAIL_DEV" -p "$ADMIN_PASSWORD_DEV"
cd ../..
```

**Auto-fetch the publishable API key** instead of asking the user:
1. Query Postgres directly: `docker compose exec -T postgres psql -U postgres -d medusa-store -c "SELECT id FROM publishable_api_key LIMIT 1;"`
2. If no key exists, create one via the Medusa admin API using the admin credentials.
3. Write the key to `apps/storefront/.env.local` as `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.
4. Log this approach in deviations.md.

```bash
pnpm dev &
sleep 10

git add -A
git commit -m "feat: solace baseline running"
git tag phase-1-done
```

### Self-verify
- `curl -s http://localhost:9000/health` returns 200
- `curl -s http://localhost:8000 | grep -i "<html"` returns HTML
- Publishable key is set in storefront `.env.local`

If verify fails: investigate 3 fixes (port conflict, missing migration, env issue), then stop.

---

# Phase 2: EnteraVeil brand identity

Replace Solace branding with EnteraVeil. Dark theme default.

1. **Replace text:** Find every "Solace" / "rigby" / "Sofa Society" in user-facing files (`apps/storefront/{src,app}` and `apps/medusa/src/emails` if present). Replace with EnteraVeil. Leave technical identifiers (package names, npm scripts) untouched.

2. **Tailwind config** (`apps/storefront/tailwind.config.ts`): replace color tokens with brand colors. Source values from PROJECT_CONFIG.env at build time (Tailwind CSS variables pattern).

3. **Fonts:** in `apps/storefront/app/layout.tsx`, import Space Grotesk + Inter from `next/font/google`. Wire as Tailwind font variables.

4. **Theme:** ensure `next-themes` provider defaults to `dark`. Keep light toggle.

5. **Wordmark:** create `apps/storefront/src/components/logo.tsx`:
   ```tsx
   export function Logo() {
     return <span className="font-heading text-2xl tracking-tight">EnteraVeil</span>
   }
   ```
   Replace any logo image references with this component.

6. **Favicon:** use Next.js icon API. Create `apps/storefront/app/icon.tsx` rendering a stylized "E" in gold on near-black with ImageResponse.

7. **Metadata** in `app/layout.tsx`: title="EnteraVeil", description="Anime streetwear from beyond the veil".

8. **OG image:** create `apps/storefront/app/opengraph-image.tsx` with brand colors and the wordmark.

```bash
cd apps/storefront && pnpm typecheck && cd ../..
git add -A
git commit -m "feat(brand): enteraveil identity, dark-default, wordmark logo"
git tag phase-2-done
```

### Self-verify
- `grep -ril -E "solace|rigby|sofa.society" apps/storefront/src apps/storefront/app` returns nothing user-facing
- `pnpm typecheck` clean
- `curl -s http://localhost:8000 | grep -i "enteraveil"` returns hits

---

# Phase 3: Stripe → Razorpay swap

🛑 **STOP — credentials needed:**
> "I'm starting the Razorpay integration. Please provide three values now (paste them into `apps/medusa/.env`):
> - `RAZORPAY_ID` (test mode, starts with `rzp_test_`)
> - `RAZORPAY_SECRET`
> - `RAZORPAY_WEBHOOK_SECRET` (any random 32-char hex for now; you'll regenerate this in the Razorpay dashboard when adding the webhook later)
>
> Get test keys from: Razorpay Dashboard → Settings → API Keys → Generate Test Keys. Test keys work without completing KYC."

After credentials are in `.env`, proceed autonomously:

### 3A: Backend plugin

Check npm for Razorpay plugins compatible with Medusa v2. Candidates: `medusa-plugin-razorpay-v3`, `@tsc_tech/medusa-plugin-razorpay-payment`. Pick by recency + v2 compatibility. Log choice in deviations.md.

```bash
cd apps/medusa
pnpm add <chosen-plugin>
cd ../..
```

Register in `apps/medusa/medusa-config.ts` payment providers. Run migration: `cd apps/medusa && pnpm medusa db:migrate`.

### 3B: Storefront checkout button

Find Solace's Stripe button: `grep -ril stripe apps/storefront/src apps/storefront/app`.

Replace with `apps/storefront/src/modules/checkout/components/razorpay-button/razorpay-button.tsx`:
- Load `https://checkout.razorpay.com/v1/checkout.js` via Next `Script` in `app/layout.tsx` (strategy="lazyOnload")
- On click, open Razorpay modal with order amount from Medusa cart
- On success callback, confirm payment via Medusa store API → redirect to order confirmation
- On dismiss/failure, restore cart state

### 3C: Webhook handler

Create `apps/medusa/src/api/webhooks/razorpay/route.ts`:
- Verify signature: `crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex') === request.headers['x-razorpay-signature']`
- Handle `payment.captured` → mark Medusa order paid + capture
- Handle `payment.failed` → mark order failed
- Handle `refund.processed` → mark refund complete
- Idempotent: check if order already in target state before transitioning

### 3D: Remove Stripe entirely

```bash
cd apps/medusa && pnpm remove stripe @stripe/stripe-js 2>/dev/null || true
cd ../storefront && pnpm remove stripe @stripe/stripe-js @stripe/react-stripe-js 2>/dev/null || true
cd ../..
```

Delete all Stripe imports, components, env references. Remove Stripe from `medusa-config.ts`.

```bash
# Verify clean removal
grep -ril stripe apps/medusa/src apps/storefront/src apps/storefront/app
# Should return nothing

pnpm typecheck

git add -A
git commit -m "feat(payments): razorpay swap, stripe removed"
git tag phase-3-done
```

### Self-verify
- `grep -ril stripe apps/medusa/src apps/storefront/src` empty
- `pnpm typecheck` clean
- Cart → checkout flow renders Razorpay button instead of Stripe
- Webhook route responds 200 on a manually-crafted test payload

User tests end-to-end purchase later (deferred to Phase 8 production smoke test).

---

# Phase 4: India region + shipping + COD

Write provisioning script `apps/medusa/scripts/setup-india.ts` using Medusa admin SDK that:
1. Creates "India" region, INR currency, set as default. If exists, idempotent.
2. Enables countries: India only.
3. Adds shipping options via manual fulfillment provider:
   - "Bangalore Standard" — `BANGALORE_SHIPPING_RATE_PAISE`
   - "Raipur Standard" — `RAIPUR_SHIPPING_RATE_PAISE`
   - "Free Shipping" — applies when cart subtotal ≥ `FREE_SHIPPING_THRESHOLD_PAISE`
4. If `ENABLE_COD=true`: enables manual payment provider, labels it "Cash on Delivery", marks COD orders as `awaiting_payment` (not auto-captured).

Run it: `cd apps/medusa && pnpm tsx scripts/setup-india.ts`.

Storefront changes:
- Filter state dropdown in checkout address form to **Karnataka** and **Chhattisgarh** only
- Add notice on checkout: "Currently shipping to Bangalore and Raipur"
- If `ENABLE_COD`: render a payment method selector with two options — Razorpay and COD. COD submits without opening Razorpay modal.

```bash
cd apps/medusa && pnpm typecheck && cd ../..
cd apps/storefront && pnpm typecheck && cd ../..
git add -A
git commit -m "feat(india): INR region, BLR+RPR shipping, COD"
git tag phase-4-done
```

### Self-verify
Programmatic check via Medusa store API:
```bash
curl -s http://localhost:9000/store/regions | grep -i india
curl -s http://localhost:9000/store/shipping-options
```
Both should return populated data.

---

# Phase 5: Resend transactional emails

🛑 **STOP — credentials needed:**
> "Order email integration time. I need:
> - `RESEND_API_KEY` from resend.com (free tier — sign up takes 1 min, no domain needed yet)
> - `RESEND_FROM` — use `onboarding@resend.dev` for now (works without domain verification, only sends to your own email in test mode). You'll switch to `orders@enteraveil.com` after verifying your domain in Phase 8.
> - `ADMIN_EMAIL` — where YOU want order notifications to land (your personal email is fine)
>
> Paste into `apps/medusa/.env`."

After credentials are in `.env`, proceed:

Solace already has Resend integration. Find existing code: `grep -ril resend apps/medusa/src`. Extend rather than reinstall.

Create email templates in `apps/medusa/src/emails/` using react-email:
- `order-placed-admin.tsx` — to ADMIN_EMAIL, shows order summary + items + total + shipping address + link to admin order page
- `order-placed-customer.tsx` — to `order.email`, branded thank-you + items + total + expected delivery + support email

Both use brand colors and the EnteraVeil wordmark.

Create or extend subscriber `apps/medusa/src/subscribers/order-placed.ts`:
- Listens to `order.placed` event
- Sends both emails
- Triggers on Razorpay-paid orders AND COD orders
- Idempotent — skip if already sent for this order ID

```bash
git add -A
git commit -m "feat(email): order confirmation emails"
git tag phase-5-done
```

### Self-verify
- `pnpm typecheck` clean
- Manually invoke the subscriber with a fake order payload and confirm Resend API returns 200 (using API call, not actual email delivery — that's tested in Phase 8)

---

# Phase 6: Strapi CMS

```bash
cd apps
pnpm create strapi@latest strapi --quickstart=false --typescript --skip-cloud
cd ..

# Strapi database
docker compose exec -T postgres createdb -U postgres strapi
```

Configure `apps/strapi/config/database.ts` to use Postgres (db: strapi).

Generate Strapi secrets (random 32-char hex each) and write to `apps/strapi/.env`:
- `JWT_SECRET`
- `ADMIN_JWT_SECRET`
- `API_TOKEN_SALT`
- `APP_KEYS` (4 comma-separated random strings)
- `TRANSFER_TOKEN_SALT`
- `DATABASE_URL=postgres://postgres:postgres@localhost:5432/strapi`

Add Strapi to `docker-compose.yml` as port 1337 (optional for local dev — fine to run via `pnpm dev` too).

Define content types via Strapi's config files (no admin UI needed — content types are code-defined):
- `about` (single type): hero_image, title, body (rich text)
- `blog-post` (collection): title, slug, hero_image, body, author, published_at, tags
- `lookbook-entry` (collection): title, slug, gallery, body, linked_product_skus
- `homepage-section` (collection): type, title, body, image, cta_text, cta_url, sort_order
- `legal-page` (collection): slug, title, body — catch-all for privacy/terms/refund/shipping/contact

Set public read access on all content types (Strapi → Settings → Roles → Public → enable `find` and `findOne` on each).

🛑 **STOP — Strapi requires browser setup:**
> "Strapi forces a first-run setup wizard that cannot be scripted. Please:
> 1. Open http://localhost:1337/admin
> 2. Create your admin user (any email/password — this is just for the CMS)
> 3. Go to Settings → API Tokens → Create new token: 'storefront-read', Read-only, Full access, Unlimited duration
> 4. Paste the token here — I'll add it to `apps/storefront/.env.local` as `STRAPI_API_TOKEN`"

After the token is in `.env.local`:

Create `apps/storefront/src/lib/strapi.ts` (fetch client) and pages:
- `/about` — reads about single type
- `/blog`, `/blog/[slug]`
- `/lookbook`, `/lookbook/[slug]`
- `/[slug]` — catch-all that maps to legal-page collection

ISR revalidation:
- Strapi webhook (configured in admin UI) → POST `/api/revalidate?secret=X&path=Y`
- Storefront `/api/revalidate` route handler revalidates the path

Seed placeholder content for every content type so pages render instead of 404. Use Strapi's REST API with the admin token, or a seed script.

```bash
cd apps/storefront && pnpm typecheck && cd ../..
git add -A
git commit -m "feat(cms): strapi content types and storefront pages"
git tag phase-6-done
```

### Self-verify
- `curl -s http://localhost:1337/api/about` returns 200 JSON
- `curl -s http://localhost:8000/about | grep -i "<html"` returns HTML
- All 5 content types accessible via Strapi REST API

---

# Phase 7: Production Dockerfiles + deploy scripts

No credentials needed yet — just code. Will need values in Phase 8.

Create multi-stage production Dockerfiles for each app. Use pnpm fetch, slim final image.

Create `docker-compose.prod.yml`:
- Services: medusa, storefront, strapi, postgres, redis, caddy
- Volumes: postgres-data, redis-data, strapi-uploads, caddy-data, caddy-config
- No host port mappings except Caddy (80 + 443)

Create `Caddyfile` template (domain substituted at deploy time):
```
{$BRAND_DOMAIN} {
  reverse_proxy storefront:8000
}
api.{$BRAND_DOMAIN} {
  reverse_proxy medusa:9000
}
cms.{$BRAND_DOMAIN} {
  reverse_proxy strapi:1337
}
```

Create `.env.prod.template` at root (keys only, no values).

Create `scripts/backup-postgres.sh` — daily pg_dumpall, 7-day retention.

Create `deploy.sh`:
```bash
#!/bin/bash
set -e
source PROJECT_CONFIG.env
ssh ${VPS_USER}@${VPS_HOST} <<REMOTE
  cd /opt/enteraveil-store
  git pull
  docker compose -f docker-compose.prod.yml up -d --build
  docker compose -f docker-compose.prod.yml exec -T medusa pnpm medusa db:migrate
REMOTE
echo "Deployed"
```

Write `docs/DEPLOY.md` covering:
- DO Bangalore droplet provisioning (1GB minimum, Ubuntu 24.04)
- DNS records (api subdomain MUST be Cloudflare DNS-only / gray cloud)
- Cron backup setup
- Razorpay webhook URL update for prod
- TEST → LIVE Razorpay key swap procedure
- Resend domain verification before going live

```bash
docker compose -f docker-compose.prod.yml config > /dev/null  # validates
git add -A
git commit -m "chore: production docker + deploy"
git tag phase-7-done
```

### Self-verify
- `docker compose -f docker-compose.prod.yml config` exits 0
- All three Dockerfiles build: `docker compose -f docker-compose.prod.yml build`
- `docs/DEPLOY.md` exists and covers all listed sections

---

# Phase 8: Production deploy

🛑 **STOP — production credentials and infra needed:**
> "Time to go live. I need:
>
> **From you (one-time setup):**
> 1. **Domain purchased** — share the domain name (e.g. `enteraveil.com`). Add it to `PROJECT_CONFIG.env` as `BRAND_DOMAIN`.
> 2. **DigitalOcean droplet** — provision: basic 1GB / 1vCPU / 25GB / Ubuntu 24.04 / Bangalore (BLR1). Share VPS IP and SSH user. Add to `PROJECT_CONFIG.env` as `VPS_HOST` and `VPS_USER`.
> 3. **DNS pointed in Cloudflare** — A records for `<domain>`, `api.<domain>`, `cms.<domain>` → droplet IP. **The `api` subdomain MUST be gray cloud (DNS-only), not proxied** — Razorpay webhooks fail behind Cloudflare proxy.
> 4. **Resend domain verified** — add the DKIM/SPF records Resend gives you to Cloudflare. Update `RESEND_FROM` in production to `orders@<domain>`.
> 5. **Razorpay KYC complete** (if not done, you can deploy with test keys and switch later). Generate LIVE keys when ready.
> 6. **`.env.prod`** — I'll generate the template; you fill values on the VPS after I SSH in.
>
> Confirm 1–4 done, paste VPS_HOST/VPS_USER, then I'll run the deploy."

After user confirms and provides VPS access:

```bash
# Generate the .env.prod on the VPS via SSH
# Walk through filling each value (Claude Code does this via SSH, prompting user inline for each)
# Run deploy
./deploy.sh

# Smoke test from local
source PROJECT_CONFIG.env
curl -sI https://${BRAND_DOMAIN} | head -1
curl -sI https://api.${BRAND_DOMAIN}/health | head -1
curl -sI https://cms.${BRAND_DOMAIN}/admin | head -1

# All should return 200 with valid SSL (Caddy auto-provisions)
```

Update Razorpay webhook URL in their dashboard to `https://api.${BRAND_DOMAIN}/webhooks/razorpay`. This is the only browser step.

```bash
git tag phase-8-done
```

### Self-verify
- All three subdomains return 200 over HTTPS
- Postgres backup cron scheduled (`ssh ... crontab -l`)

---

# Phase 9: Final QA + handoff docs

This is the single batched verification phase — everything that was deferred earlier gets tested here.

Write `docs/admin-guide.md` for the non-technical operator covering:
- Logging into Medusa admin and Strapi
- Adding products (size variants + images)
- Managing collections
- Publishing/unpublishing
- Fulfilling orders + tracking
- Refunds + cancellations
- COD order handling
- Editing About / Blog / Lookbook in Strapi
- "Don't touch" list

Write `docs/troubleshooting.md` for the developer covering:
- OOM on VPS → resize
- Razorpay webhook failures → check signature + Cloudflare proxy
- Resend rate limits / domain issues
- Strapi crashes
- Postgres connection refused
- SSL renewal failure
- Rollback to phase tag

🛑 **STOP — final acceptance test:**
> "Final test pass before signing off:
> 1. Place a real LIVE Razorpay purchase (₹1 product) — confirms payment, webhook, admin email, customer email all working end-to-end
> 2. Place a COD test order — confirms COD flow + emails
> 3. Edit the About page in Strapi — confirms CMS → storefront within 60s
> 4. Check `docs/admin-guide.md` makes sense to a non-technical reader
>
> Report any failures. Once all four pass, we're done."

```bash
git add -A
git commit -m "docs: admin guide and troubleshooting"
git tag phase-9-done
```

---

# Error recovery

If a phase fails:
```bash
git reset --hard phase-N-done   # roll back to last good phase
```

If a verification step fails after 3 autonomous fix attempts:
- Stop
- Report exact command and output
- Wait for user instruction

If anything in this plan turns out to be wrong (file paths, package names, versions):
- Adapt to actual reality
- Log in `docs/deviations.md`
- Continue

---

# Done when

All 9 phase tags exist. Production live at `https://${BRAND_DOMAIN}`. Real Razorpay purchase has succeeded end-to-end with both emails. Admin and troubleshooting docs written.

Ship it.
