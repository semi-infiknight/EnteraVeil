# Deviations Log

Every non-trivial decision deviating from PLAN.md is recorded here with a one-line reason.

## Phase 0 — Skeleton

- **Existing repo is `rigby-sh/solace-medusa-starter`, not empty.** The C:\Labs\EnteraVeil directory was already populated as the Solace storefront repo (no `medusa/` subfolder; that lives in a separate repo `rigby-sh/solace-medusa-starter-api`). Reason: plan's `cp -r reference/solace/medusa` / `storefront` paths do not exist in the source repo. Adaptation: kept existing git history; moved existing storefront files into `apps/storefront/`; will clone `solace-medusa-starter-api` into `apps/medusa/` in Phase 1.
- **Skipped `git init -b main`**: repo already initialized with main branch and commit history. No fresh init.
- **`PROJECT_CONFIG.env` was missing**: plan states the user pre-created it, but it did not exist. Created from the canonical values inline in Section 2 of PLAN.md.
- **Windows host**: bash heredocs and POSIX commands adapted to Windows + git-bash where possible; some commands (Docker, pnpm install, db:migrate) will be Windows-equivalent or deferred when not runnable in this environment.
- **`pnpm@10.0.0`**: kept as declared in plan despite being a future-version request. If install fails, will fall back to latest stable pnpm 9.x and log.
