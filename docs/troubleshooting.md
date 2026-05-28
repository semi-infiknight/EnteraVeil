# EnteraVeil — Troubleshooting

Developer-facing playbook for the things that break in production.

For first-time deploy questions, see `docs/DEPLOY.md`. For everyday store ops, see `docs/admin-guide.md`. This doc covers when something is on fire.

---

## SSH access

```bash
ssh deploy@${VPS_HOST}
cd /opt/enteraveil-store
```

Almost every debugging session starts there.

Compose shorthand:

```bash
alias dc='docker compose -f docker-compose.prod.yml'
dc ps         # what's running
dc logs -f medusa     # tail a service
dc restart medusa     # restart a service
dc exec medusa sh     # shell into container
```

---

## OOM on the VPS

Symptoms: containers restart loop, `dmesg` shows "killed process … (medusa|strapi|node)".

```bash
free -m              # check available
dc stats             # check per-container
```

Fixes, in order of preference:

1. **Resize the droplet** to 2 GB RAM. DigitalOcean → droplet → Resize. Costs ~$6/month more.
2. **Drop Strapi build cache**: `dc exec strapi rm -rf .strapi/client .cache` then restart. Strapi rebuilds the admin bundle on next start.
3. **Reduce Medusa worker count**: not currently configurable without code change. Open an issue.

Permanent fix: add a swapfile (cheap, no downtime):
```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Razorpay webhook failures

Symptoms: orders show "Payment pending" in Medusa even though Razorpay dashboard shows the payment succeeded. Customer emails them money but Medusa doesn't capture.

### Diagnosis

```bash
dc logs medusa | grep -i razorpay | tail -50
```

Look for:

- `Razorpay webhook signature mismatch` → your `RAZORPAY_WEBHOOK_SECRET` in `.env.prod` doesn't match what's set in the Razorpay dashboard. Most common cause: forgot to update one of them after generating a new secret. Fix: regenerate in Razorpay dashboard, paste BOTH into `.env.prod` AND save in dashboard, `./deploy.sh`.
- `payment.captured (rzp:...) has no medusa session id in notes` → the storefront didn't write `notes.session_id` when creating the Razorpay order. Either an old build of the storefront is deployed (redeploy) or a manual Razorpay order was created outside our flow (ignore).
- No log entries at all → Razorpay can't reach the webhook URL. Check from your laptop:
  ```bash
  curl -v https://api.${BRAND_DOMAIN}/webhooks/razorpay -d '{}' -H 'content-type: application/json'
  ```
  Should return 400 (missing signature) — that's healthy, means the route is up.

### Cloudflare proxy mode

`api.<domain>` MUST be **DNS-only** (gray cloud) in Cloudflare. If it's orange:

- Cloudflare can mutate request bodies (compression, header rewrites) → HMAC verification fails.
- Cloudflare may rate-limit Razorpay's IPs → webhooks dropped.

Fix in Cloudflare DNS panel: click the orange cloud next to the `api` A record → it goes gray. Propagation is instant.

### Replay missed webhooks

Razorpay dashboard → Webhooks → click the webhook → "Recent deliveries". Failed events can be replayed individually. For mass-replay, use the Razorpay API directly:

```bash
curl -u $RAZORPAY_ID:$RAZORPAY_SECRET https://api.razorpay.com/v1/webhooks/<webhook_id>/deliveries?status=failed
```

---

## Resend rate limits / domain issues

Symptoms: `Failed to send email` in medusa logs. Resend dashboard shows recent sends as "Bounced" or "Soft bounced".

### Quick checks

- **Domain not verified** → Resend will only deliver to your own verified address. Confirm `enteraveil.com` shows "Verified" in Resend → Domains. If pending, the DKIM/SPF DNS records haven't propagated or are typo'd. Use `dig +short txt enteraveil.com` to verify.
- **Rate limit (100/hour on free tier)** → upgrade Resend plan, or queue sends. Volume hint: assume one customer email + one admin email per order, so 50 orders/hour = 100 emails/hour.
- **From address mismatch** → `RESEND_FROM_EMAIL=onboarding@resend.dev` only works in test mode and only delivers to your verified address. For real customers, change to `orders@enteraveil.com` and redeploy.

### Check what we sent

```bash
dc exec medusa env | grep RESEND
dc logs medusa | grep -i "send email\|resend" | tail -50
```

---

## Strapi crashes

Symptoms: `cms.<domain>` returns 502, `dc ps` shows strapi exited.

### Most common: Postgres connection refused

```bash
dc logs strapi | grep -i "knex\|database\|connection"
```

- Strapi can't reach the `postgres` service → Postgres container is unhealthy. `dc logs postgres` to investigate.
- `database "strapi" does not exist` → the init script didn't run because the postgres volume already had data. Manual fix:
  ```bash
  dc exec postgres psql -U postgres -c 'CREATE DATABASE strapi'
  dc restart strapi
  ```

### Sharp / native image build errors

```
Module did not self-register
```

Means `sharp` was compiled for the wrong architecture or libvips is missing in the container. The Strapi Dockerfile installs libvips already, so this usually means a botched cache. Force rebuild:

```bash
dc build --no-cache strapi
dc up -d strapi
```

### Admin bundle missing

`/admin` returns 404 inside a working Strapi. Means the build step produced no admin assets. Rebuild:

```bash
dc exec strapi node_modules/.bin/strapi build
dc restart strapi
```

---

## Postgres connection refused

Symptom: every other service is in a restart loop with "ECONNREFUSED 5432" in logs.

```bash
dc ps postgres
dc logs postgres | tail -40
```

Common causes:

- **Volume corrupted**: `dc down && docker volume rm enteraveil-store_postgres-data && dc up -d`. **Destructive — only do this if you have a backup.** Restore from `/var/backups/enteraveil/` via:
  ```bash
  gunzip -c /var/backups/enteraveil/<latest>.sql.gz | dc exec -T postgres psql -U postgres
  ```
- **Disk full**: `df -h`. If `/var/lib/docker` is >90%, prune unused images: `docker image prune -a -f`. Old backups: `find /var/backups/enteraveil -mtime +30 -delete`.
- **Healthcheck failing** but Postgres logs look fine: the healthcheck uses `pg_isready -U ${POSTGRES_USER}`. Verify `POSTGRES_USER` matches in both `.env.prod` and the compose file's interpolation.

---

## SSL renewal failure

Caddy auto-provisions and auto-renews Let's Encrypt certs. Renewal failure usually means the ACME challenge can't reach the server.

```bash
dc logs caddy | grep -i "renew\|certificate\|acme"
```

- **Port 80 firewall closed** → `sudo ufw status` to confirm both 80 and 443 are open.
- **DNS changed** → Cloudflare proxy turned ON for the apex or `cms.` subdomain → ACME challenge fails because Cloudflare intercepts. Set those back to DNS-only (gray) to renew, then optionally turn proxy back on after.
- **Rate-limited by Let's Encrypt** (too many cert requests in 7 days) → wait. Or use the Let's Encrypt staging server for testing, then back to prod once stable.

Manual renewal trigger: `dc exec caddy caddy reload --config /etc/caddy/Caddyfile`.

---

## Rollback to a previous phase

```bash
# On the VPS as deploy user:
cd /opt/enteraveil-store
git fetch --tags
git reset --hard phase-7-done   # or whichever tag was last known-good
dc up -d --build
# If schema changed, you may need to manually downmigrate Medusa
# or restore Postgres from a backup taken before the bad deploy.
```

Tags are immutable. Every completed phase has one.

---

## Storefront stuck on stale content

Symptoms: edited the About page in Strapi, but the live site still shows old content after 60 seconds.

```bash
# Manually trigger revalidation
curl -X POST "https://${BRAND_DOMAIN}/api/strapi-revalidate?secret=${STRAPI_WEBHOOK_REVALIDATION_SECRET}" \
  -H 'content-type: application/json' \
  -d '{"model":"about","entry":{}}'
```

If this works, the Strapi webhook is misconfigured. Strapi admin → Settings → Webhooks → your storefront webhook → check the URL, secret, and events (entry.publish, entry.unpublish, entry.update, entry.delete should all be checked).

If the curl fails with 401, your `STRAPI_WEBHOOK_REVALIDATION_SECRET` in storefront env doesn't match the secret in the Strapi webhook URL.

---

## Quick reference

```bash
# Logs (replace SERVICE with one of: postgres, redis, medusa, storefront, strapi, caddy)
dc logs -f SERVICE

# Restart everything
dc restart

# Full rebuild without cache (slow)
dc build --no-cache && dc up -d

# Open a Medusa CLI shell
dc exec medusa node_modules/.bin/medusa

# Postgres psql
dc exec postgres psql -U postgres medusa-store

# Strapi build admin bundle
dc exec strapi node_modules/.bin/strapi build

# Show running env (DON'T paste secrets into logs)
dc exec medusa env | grep -v -E "SECRET|PASSWORD|KEY"

# Total disk usage
docker system df

# Free up space
docker system prune -af --volumes   # destructive on unused volumes!
```
