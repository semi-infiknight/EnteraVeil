# EnteraVeil — Production Deployment

End-to-end runbook for taking EnteraVeil live on a single DigitalOcean droplet in Bangalore.

---

## 1. Provision the droplet

DigitalOcean → Create Droplet:

- **Region:** Bangalore (BLR1)
- **Image:** Ubuntu 24.04 LTS
- **Plan:** Basic / Regular / **1 GB RAM / 1 vCPU / 25 GB SSD minimum**. If you're stocking 50+ SKUs with image-heavy Strapi content, jump to 2 GB.
- **Auth:** Add your SSH public key. Disable password auth.
- **Hostname:** `enteraveil-prod`

After it boots, SSH in as root and harden:

```bash
ssh root@<VPS_IP>

# Create deploy user
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# Firewall: only 22, 80, 443
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Install Docker + compose plugin
apt update && apt install -y docker.io docker-compose-plugin
usermod -aG docker deploy

# Repo location
mkdir -p /opt/enteraveil-store
chown -R deploy:deploy /opt/enteraveil-store
```

Then log out and back in as `deploy` for the rest.

## 2. DNS

In Cloudflare (or whatever DNS host) point three A records at the droplet IP:

| Subdomain                | Target           | Proxy           |
|--------------------------|------------------|-----------------|
| `enteraveil.com`         | `<VPS_IP>`       | Orange (proxied)|
| `cms.enteraveil.com`     | `<VPS_IP>`       | Orange (proxied)|
| **`api.enteraveil.com`** | `<VPS_IP>`       | **Gray (DNS only)** |

> **⚠ `api.<domain>` MUST be gray-cloud / DNS-only.**
> Razorpay's webhook signing uses the raw body; Cloudflare's proxy can mutate body bytes (compression, header normalization) and break HMAC verification. Letting the API origin hand TLS directly to Razorpay's IPs is the safe path. Caddy on the droplet provisions the cert via Let's Encrypt.

## 3. Initial clone + env

On the droplet as `deploy`:

```bash
cd /opt/enteraveil-store
git clone https://github.com/<owner>/EnteraVeil .

cp .env.prod.template .env.prod
vim .env.prod   # fill EVERY blank below
```

### Required values

| Key | Where to get it |
|-----|------------------|
| `BRAND_DOMAIN` | the apex domain you bought, e.g. `enteraveil.com` |
| `POSTGRES_PASSWORD` | `openssl rand -hex 24` |
| `JWT_SECRET`, `COOKIE_SECRET` | `openssl rand -hex 32` |
| `RAZORPAY_ID` / `_SECRET` / `_WEBHOOK_SECRET` | Razorpay Dashboard → Settings → API Keys (Test or Live) |
| `RESEND_API_KEY` | resend.com/api-keys (verified domain required for `RESEND_FROM_EMAIL`) |
| `ADMIN_EMAIL` | your real inbox |
| `DO_SPACE_*` | DigitalOcean Spaces (S3-compatible) bucket info |
| `APP_KEYS` etc. | Strapi secrets, regenerate per `openssl rand -base64 16` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | the same as `RAZORPAY_ID` |
| `STRAPI_API_TOKEN` | minted in Strapi admin AFTER first boot (Step 5) |
| `STRAPI_WEBHOOK_REVALIDATION_SECRET` | `openssl rand -hex 32` (also paste into Strapi webhook config) |

## 4. First deploy

From your local laptop:

```bash
echo "VPS_HOST=<ip>"  >> PROJECT_CONFIG.env
echo "VPS_USER=deploy" >> PROJECT_CONFIG.env
./deploy.sh
```

`deploy.sh` SSHes in, pulls main, builds the three images, brings up the stack, and runs Medusa migrations. Caddy will provision Let's Encrypt certs on the first inbound HTTPS hit (give it ~30 s).

## 5. Browser-only setup (the unavoidable one-time clicks)

1. **Strapi admin** — open `https://cms.<domain>/admin`, create the admin user. Then Settings → API Tokens → Create new token: name `storefront-read`, type Read-only, full access, no expiry. Copy and paste it into `.env.prod` as `STRAPI_API_TOKEN`. Re-run `./deploy.sh` so the storefront container picks it up.
2. **Razorpay webhook** — Razorpay Dashboard → Settings → Webhooks → Create new:
   - URL: `https://api.<domain>/webhooks/razorpay`
   - Secret: paste your `RAZORPAY_WEBHOOK_SECRET`
   - Events: `payment.captured`, `payment.failed`, `refund.processed`
3. **Medusa admin user** — `docker compose -f docker-compose.prod.yml exec medusa node_modules/.bin/medusa user --email <you> --password <strong>`
4. **India region** — `docker compose -f docker-compose.prod.yml exec medusa pnpm tsx src/scripts/setup-india.ts`

## 6. Smoke test from local

```bash
source PROJECT_CONFIG.env
curl -sI https://${BRAND_DOMAIN}            | head -1   # storefront
curl -sI https://api.${BRAND_DOMAIN}/health | head -1   # medusa
curl -sI https://cms.${BRAND_DOMAIN}/admin  | head -1   # strapi
```

All three should be `200 OK` over TLS.

## 7. Backups (cron)

```bash
ssh deploy@<ip>
crontab -e
# add:
0 3 * * *  /opt/enteraveil-store/scripts/backup-postgres.sh >> /var/log/enteraveil-backup.log 2>&1
```

This dumps both `medusa-store` and `strapi` databases nightly to `/var/backups/enteraveil` with 7-day retention.

## 8. Going from Razorpay TEST → LIVE

1. Complete Razorpay KYC.
2. Generate LIVE keys in Razorpay dashboard.
3. SSH in, edit `.env.prod`: replace `rzp_test_*` and the secret/webhook secret with the live equivalents.
4. **Update Razorpay webhook URL to the live endpoint** — it's the same URL, but you need to register a *new* webhook in the LIVE-mode tab of the dashboard. Don't reuse the test webhook secret; generate a new one and paste it into both Razorpay and `.env.prod`.
5. `./deploy.sh` to restart with new env.

## 9. Resend domain verification (before going live)

You can deploy with `RESEND_FROM_EMAIL=onboarding@resend.dev` for QA, but in test mode Resend only delivers to your own verified address. Before opening to customers:

1. resend.com → Domains → Add `enteraveil.com`.
2. Add the four DKIM TXT records + SPF MX/TXT records to Cloudflare DNS.
3. Wait for Resend to flip the domain status to "Verified" (usually <10 min).
4. Change `RESEND_FROM_EMAIL` in `.env.prod` to `orders@enteraveil.com`, redeploy.

## 10. Rolling forward / back

- Roll forward: just `./deploy.sh` after committing to main.
- Roll back: `ssh deploy@<ip> 'cd /opt/enteraveil-store && git reset --hard phase-N-done && docker compose -f docker-compose.prod.yml up -d --build'`. Each completed phase has a tag.

## 11. What can go wrong (quick reference)

- **Caddy can't get cert** → DNS A records not propagated yet (give it 5 min) or the port 80/443 firewall rule is missing.
- **Razorpay webhook 401** → wrong `RAZORPAY_WEBHOOK_SECRET` in `.env.prod`, OR `api.<domain>` is on orange-cloud Cloudflare proxy mode. Switch to gray.
- **Medusa migration fails** → check `docker compose logs postgres` for connection errors; verify `DATABASE_URL` uses the in-container `postgres` hostname not `localhost`.
- **Strapi crashes on first run** with "Knex: connection refused" → `strapi` database wasn't created. Confirm `scripts/postgres-init.sh` ran (`docker compose logs postgres | grep "creating database"`).
- **OOM on the droplet** → upgrade to 2 GB. Strapi's `develop` mode is hungry; in production we run `start` which is lighter, but image processing spikes.

See `docs/troubleshooting.md` for more.
