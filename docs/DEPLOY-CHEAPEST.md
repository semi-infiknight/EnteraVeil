# EnteraVeil — cheapest viable deploy (≈ ₹510 / month)

This is the cut-down deploy path. The full DEPLOY.md assumes a $12/mo droplet + DO Spaces ($5/mo). This path lives on a **$6 droplet + Cloudflare (free) + local image storage**, with full Strapi running.

## Bill of materials

| line | cost / mo | notes |
| --- | ---: | --- |
| DigitalOcean droplet · 1 vCPU / 1 GB / 25 GB SSD · BLR1 | **$6** | with 2 GB swap added (free, see below) |
| Domain | varies (Namecheap `.com` ≈ $11/yr ≈ $1/mo) | bring your own |
| Cloudflare DNS + proxy + CDN | **free** | use the free plan |
| Razorpay | **0 monthly** | transaction-based — 2% per UPI / card txn |
| Resend (transactional email) | **free** | 100 emails/day, 3,000/mo on free tier |
| **Total recurring** | **≈ $7/mo (~₹600)** | |

> **The 1 GB RAM caveat.** The stack (Postgres + Redis + Medusa + Storefront + Strapi + Caddy) wants ~1.6–1.9 GB on its own. With the 2 GB swap below, the kernel pages cold processes to disk. Under load you'll see slower cold-start of Strapi admin (it's barely used by visitors), but customer-facing pages stay warm because Next.js + Medusa pin themselves in RAM. If you start seeing 5xx or "out of memory" in `journalctl`, the right move is to bump the droplet to 2 GB ($12/mo) — that's a 1-minute resize in the DO dashboard with ~30s downtime.

---

## Step 1 — Create the droplet (DO dashboard)

1. https://cloud.digitalocean.com → Create → Droplet
2. **Region:** Bangalore (BLR1)
3. **Image:** Ubuntu 24.04 LTS
4. **Plan:** Shared CPU → Regular → **1 vCPU / 1 GB / 25 GB · $6/mo**
5. **Auth:** SSH key — paste your `~/.ssh/id_ed25519.pub` (generate with `ssh-keygen -t ed25519` if you don't have one)
6. **Hostname:** `enteraveil-prod`
7. Create. Note the IP address.

## Step 2 — Point DNS at the droplet (Cloudflare)

Add three A records in your Cloudflare zone:

| host | type | value | proxy |
| --- | --- | --- | --- |
| `@` (or `enteraveil.com`) | A | `<DROPLET_IP>` | 🟠 Proxied |
| `cms` | A | `<DROPLET_IP>` | 🟠 Proxied |
| `api` | A | `<DROPLET_IP>` | ⚫ **DNS only** |

> `api` MUST be DNS-only (gray cloud). Razorpay's webhook signature verification reads the raw HTTP body — Cloudflare's proxy can mutate bytes and break HMAC.

## Step 3 — First SSH + harden (≈ 5 min)

```bash
ssh root@<DROPLET_IP>

# Create deploy user
adduser --gecos "" deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# 2 GB swap (the trick that keeps $6/mo viable)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
sysctl vm.swappiness=10
echo 'vm.swappiness=10' >> /etc/sysctl.conf

# Firewall — only 22, 80, 443
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Docker + compose plugin
apt update && apt install -y docker.io docker-compose-plugin
systemctl enable --now docker
usermod -aG docker deploy

# Repo dir
mkdir -p /opt/enteraveil-store
chown -R deploy:deploy /opt/enteraveil-store

# Reboot once to clear apt + log out of root
reboot
```

After reboot, log in as `deploy`:

```bash
ssh deploy@<DROPLET_IP>
free -h   # confirm 1.0G RAM + 2.0G swap
```

## Step 4 — Pull repo + env

```bash
cd /opt/enteraveil-store
git clone https://github.com/semi-infiknight/EnteraVeil .

cp .env.prod.template .env.prod
nano .env.prod
```

Paste the values from `C:\Labs\EnteraVeil-secrets\secrets.txt` (the secrets I generated locally) — Postgres password, JWT/cookie secrets, all 6 Strapi secrets, the revalidation handshake.

Set the live values you control:

```
BRAND_DOMAIN=enteraveil.com          # whatever domain you registered
ADMIN_EMAIL=you@yourbox.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=         # leave blank until Step 7
RAZORPAY_ID=                         # leave blank until Step 7
RAZORPAY_SECRET=                     # leave blank until Step 7
RAZORPAY_WEBHOOK_SECRET=             # leave blank until Step 7
RESEND_API_KEY=                      # leave blank until Step 6
RESEND_FROM_EMAIL=orders@enteraveil.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=  # leave blank — set after first boot, Step 8
STRAPI_API_TOKEN=                    # leave blank — set after first boot, Step 9
```

> The blank Razorpay + Resend keys are intentional. The code degrades gracefully — Razorpay disabled → only COD works (which is perfect for India anyway). Resend disabled → no order emails sent. You can fill these in later and `docker compose up -d` to pick them up.

### Cheapest-path env tweaks

These edits to `.env.prod` shave RAM and skip paid services. Add at the bottom:

```
# Skip DO Spaces — use local volume
DO_SPACE_ACCESS_KEY=
DO_SPACE_SECRET_KEY=
DO_SPACE_BUCKET=
# (Medusa falls back to file-local provider when these are empty)

# Pin Node max-old-space to save RAM
NODE_OPTIONS=--max-old-space-size=512
```

## Step 5 — First boot

```bash
cd /opt/enteraveil-store
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Watch first boot — Strapi takes ~90s, Medusa ~60s
docker compose -f docker-compose.prod.yml logs -f --tail=20
```

When you see `Server is ready on port 9000` (Medusa) and `Welcome back!` (Strapi), Ctrl-C out of logs.

Open in a browser:
- `https://enteraveil.com` → storefront
- `https://api.enteraveil.com/health` → 200 OK
- `https://api.enteraveil.com/app` → Medusa admin login
- `https://cms.enteraveil.com/admin` → Strapi admin (first-run prompts you to create an admin user)

If anything 502s, Caddy needs another ~30s to provision Let's Encrypt certs. Refresh.

## Step 6 — Resend (transactional email)

1. resend.com → sign up
2. Domains → Add `enteraveil.com` → add the 3 TXT/CNAME records Cloudflare needs (SPF, DKIM, verification)
3. API Keys → "Create API Key" → copy the `re_…` value
4. SSH back to droplet:
   ```bash
   nano /opt/enteraveil-store/.env.prod   # paste RESEND_API_KEY=re_xxxx
   docker compose -f docker-compose.prod.yml --env-file .env.prod up -d medusa
   ```

## Step 7 — Razorpay (payments)

1. razorpay.com → sign up → complete KYC (~24-48h for live keys; test keys work immediately)
2. Settings → API Keys → generate. Copy `Key Id` and `Secret`.
3. Settings → Webhooks → "Add new webhook":
   - URL: `https://api.enteraveil.com/hooks/payment/razorpay_razorpay`
   - Events: `payment.captured`, `payment.failed`, `order.paid`, `refund.created`
   - Secret: invent one (e.g. `openssl rand -hex 24`) — copy it
4. SSH:
   ```bash
   nano .env.prod
   # RAZORPAY_ID=rzp_live_xxx
   # RAZORPAY_SECRET=xxx
   # RAZORPAY_WEBHOOK_SECRET=xxx   (the one you invented)
   # NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx   (same as RAZORPAY_ID)
   docker compose -f docker-compose.prod.yml --env-file .env.prod up -d medusa storefront
   ```

## Step 8 — Medusa admin first run

1. Browse to `https://api.enteraveil.com/app`
2. Bootstrap an admin user (run inside the medusa container the first time):
   ```bash
   docker compose -f docker-compose.prod.yml exec medusa \
     pnpm medusa user --email you@yourbox.com --password <something-strong>
   ```
3. Log in.
4. Settings → Publishable API Keys → Create one for the storefront. Copy it.
5. Add the value to `.env.prod`:
   ```
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxx
   ```
6. `docker compose -f docker-compose.prod.yml --env-file .env.prod up -d storefront`

### Seed the India region

```bash
docker compose -f docker-compose.prod.yml exec medusa \
  pnpm medusa exec ./src/scripts/setup-india.ts
```

This creates the INR region, Bangalore + Raipur shipping options, and links the COD provider.

## Step 9 — Strapi first run

1. Browse `https://cms.enteraveil.com/admin` — create admin user
2. Settings → API Tokens → "Create new" → name "Storefront read" → type "Read-only" → copy the token
3. Add to `.env.prod` as `STRAPI_API_TOKEN=` and `docker compose ... up -d storefront`
4. Populate the brand singletons (HeroBanner, MidBanner) + collections + lookbook entries via the Strapi admin UI

## Step 10 — Smoke

From your laptop:

```bash
# Storefront
curl -sI https://enteraveil.com | head -1

# Country redirect
curl -s -o /dev/null -w "%{http_code}\n" https://enteraveil.com   # → 307
curl -s -o /dev/null -w "%{http_code}\n" https://enteraveil.com/in # → 200

# Admin
curl -s -o /dev/null -w "%{http_code}\n" https://api.enteraveil.com/health  # → 200

# Strapi
curl -s -o /dev/null -w "%{http_code}\n" https://cms.enteraveil.com/admin  # → 200

# Tap-verify (from C:\Labs\EnteraVeil)
node scripts/tap-verify.mjs https://enteraveil.com/in
```

If all five pass, you're live.

---

## What happens if RAM gets tight

Symptoms: `journalctl -u docker --since "1 hour ago"` shows OOM kills, or Strapi admin loads slowly.

Fix in order of cost:

1. **Bump swappiness more aggressive** (free): `sysctl vm.swappiness=60`
2. **Stop Strapi when not editing**: `docker compose ... stop strapi`. Storefront fallbacks render instead. Start back when editing copy.
3. **Resize droplet to 2 GB** ($6 → $12): DO dashboard → Resize → Power off → CPU & RAM → 2 GB → Power on. ~1 min downtime. No data loss; volumes persist.

---

## Costs over 12 months

| | $/month | $/year |
| --- | ---: | ---: |
| Droplet | $6 | $72 |
| Domain | ~$1 | ~$12 |
| Cloudflare / Resend / Razorpay base | $0 | $0 |
| Razorpay transaction fees (assume 100 orders × ₹1,500 × 2.36% UPI) | ~$45 | — |
| **Total fixed infra** | **$7** | **$84** |

Cheaper than this and you're on either Hetzner (no India region, 200 ms+ latency) or a free-tier stack that will rate-limit you in production.

---

## Building images — RECOMMENDED PATH

**This repo is public on GitHub → GitHub Actions + GHCR are both
unlimited free.** The workflow at `.github/workflows/build-images.yml`
already exists and runs on every push to `main` (or manually via the
Actions tab).

Each push triggers:
1. Three parallel build jobs (medusa, storefront, strapi)
2. Each pushes to `ghcr.io/semi-infiknight/enteraveil-<app>:latest`
   (and a tag with the commit SHA)
3. Total wall time: ~8–12 min for a cold cache, ~3–5 min once GHA cache
   is warm

To deploy on the droplet after a push:

```bash
ssh deploy@<DROPLET_IP>
cd /opt/enteraveil-store
git pull                          # to refresh compose/scripts if changed
./scripts/deploy.sh               # pulls latest images, restarts changed services
```

That's the entire deploy loop. If the change includes a Medusa DB
migration:

```bash
./scripts/deploy.sh --migrate     # runs db:migrate before restart
```

### When you'd want Option A instead (laptop builds)

Only useful if you're editing offline or want to test image changes
without pushing to main first. Keep these for emergencies — you're
on Option B by default.

On your laptop (where `docker` is installed):

```bash
cd C:\Labs\EnteraVeil

# Build all three from the prod compose context
docker compose -f docker-compose.prod.yml build medusa storefront strapi

# Save to tarballs
docker save enteraveil-medusa enteraveil-storefront enteraveil-strapi \
  | gzip > /c/Labs/enteraveil-images.tar.gz

# scp to droplet (~600 MB compressed, ~5-15 min on Indian broadband)
scp /c/Labs/enteraveil-images.tar.gz deploy@<DROPLET_IP>:/opt/enteraveil-store/
```

On the droplet:

```bash
cd /opt/enteraveil-store
docker load < enteraveil-images.tar.gz
rm enteraveil-images.tar.gz

# Now use docker-compose.prod.images.yml that references image: instead of build:
docker compose -f docker-compose.prod.images.yml --env-file .env.prod up -d
```

Use `docker-compose.prod.yml` (the one with `build:` blocks), then
push tarballs to the droplet and load them. Slow because the
droplet has to receive ~600 MB over your home connection.

Just `git push` instead — Option B handles all this for free.

---

## When you ship a code change

Laptop:
```bash
git push origin main
```

Watch the build at https://github.com/semi-infiknight/EnteraVeil/actions
(takes ~8-12 min cold, 3-5 min warm).

Droplet:
```bash
ssh deploy@<DROPLET_IP>
cd /opt/enteraveil-store
./scripts/deploy.sh                          # add --migrate if you changed Medusa DB
```

That's the entire loop. Most pushes (CSS tweaks, copy edits in
frontmatter) finish to live in under 10 minutes door-to-door without
touching the droplet manually beyond running `deploy.sh`.

**For copy edits, gf doesn't need to deploy at all.** She edits in
Strapi or Medusa Admin (`https://cms.enteraveil.com/admin` and
`https://api.enteraveil.com/app`). Strapi calls the storefront's
revalidation webhook, the page re-renders. Live in seconds.
