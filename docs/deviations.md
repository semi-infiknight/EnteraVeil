# Deviations Log

Every non-trivial decision deviating from PLAN.md is recorded here with a one-line reason.

## Phase 0 — Skeleton

- **Existing repo is `rigby-sh/solace-medusa-starter`, not empty.** The C:\Labs\EnteraVeil directory was already populated as the Solace storefront repo (no `medusa/` subfolder; that lives in a separate repo `rigby-sh/solace-medusa-starter-api`). Reason: plan's `cp -r reference/solace/medusa` / `storefront` paths do not exist in the source repo. Adaptation: kept existing git history; moved existing storefront files into `apps/storefront/`; will clone `solace-medusa-starter-api` into `apps/medusa/` in Phase 1.
- **Skipped `git init -b main`**: repo already initialized with main branch and commit history. No fresh init.
- **`PROJECT_CONFIG.env` was missing**: plan states the user pre-created it, but it did not exist. Created from the canonical values inline in Section 2 of PLAN.md.
- **Windows host**: bash heredocs and POSIX commands adapted to Windows + git-bash where possible; some commands (Docker, pnpm install, db:migrate) will be Windows-equivalent or deferred when not runnable in this environment.
- **`pnpm@10.0.0` → `pnpm@10.34.1`**: plan declared `pnpm@10.0.0` but corepack tried to fetch that exact version and failed. Bumped to actually installed `pnpm@10.34.1`. Also added `pnpm-workspace.yaml` (pnpm 10 no longer reads the `workspaces` field from package.json) and removed that field.

## Phase 1 — Solace baseline

- **Cloned `rigby-sh/solace-medusa-starter-api` into `apps/medusa/`** (storefront already in place from Phase 0). Removed its embedded `.git` so it merges into monorepo.
- **Local runtime unavailable**: Docker Desktop is NOT installed on this Windows machine (`docker`/`psql`/`redis-server` all missing); pnpm was missing and I installed it via `npm i -g pnpm@10`. Therefore the plan's `docker compose up -d`, `pnpm medusa db:migrate`, `pnpm seed`, admin user creation, publishable-key auto-fetch, and `pnpm dev` smoke test **cannot run in this environment**. All these steps are deferred until the user installs Docker Desktop. The configuration files (docker-compose.yml, .env files, scripts) are still authored per plan so they will work once Docker is up.
- **Skipped `pnpm install`** at this point: the Medusa starter uses yarn (presence of `yarn.lock` + `.yarnrc.yml`), and installing through pnpm in the workspace would either need overrides or risk corrupting native build deps. Will be done by user after Docker comes up; documented in Phase 1 README addendum.
- **Publishable key autofetch deferred to runtime**: the SQL query approach is preserved in `scripts/fetch-publishable-key.sh` so user can run it once Postgres is reachable.
