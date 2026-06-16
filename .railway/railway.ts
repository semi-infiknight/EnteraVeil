import {
  defineRailway,
  github,
  postgres,
  preserve,
  project,
  redis,
  service,
  volume,
} from "railway/iac";

export default defineRailway((_ctx, _project) => {
  const repo = github("semi-infiknight/EnteraVeil", { branch: "main" });

  const Postgres = postgres("Postgres");
  const Redis = redis("Redis");
  const strapiUploads = volume("strapi-uploads");

  const medusa = service("medusa", {
    source: repo,
    configFile: "apps/medusa/railway.toml",
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: "apps/medusa/Dockerfile",
      watchPatterns: [
        "apps/medusa/**",
        "pnpm-lock.yaml",
        "pnpm-workspace.yaml",
        "package.json",
      ],
    },
    healthcheck: "/health",
    healthcheckTimeout: 300,
    preDeploy: ["pnpm", "medusa", "db:migrate"],
    env: {
      NODE_ENV: "production",
      DATABASE_URL: Postgres.env.DATABASE_URL,
      REDIS_URL: Redis.env.REDIS_URL,
      JWT_SECRET: preserve(),
      COOKIE_SECRET: preserve(),
      MEDUSA_BACKEND_URL: "https://${{medusa.RAILWAY_PUBLIC_DOMAIN}}",
      STORE_CORS: "https://${{storefront.RAILWAY_PUBLIC_DOMAIN}}",
      ADMIN_CORS: "https://${{medusa.RAILWAY_PUBLIC_DOMAIN}}",
      AUTH_CORS:
        "https://${{storefront.RAILWAY_PUBLIC_DOMAIN}},https://${{medusa.RAILWAY_PUBLIC_DOMAIN}}",
      RAZORPAY_ID: preserve(),
      RAZORPAY_SECRET: preserve(),
      RAZORPAY_WEBHOOK_SECRET: preserve(),
      RESEND_API_KEY: preserve(),
      RESEND_FROM_EMAIL: preserve(),
      ADMIN_EMAIL: preserve(),
      NODE_OPTIONS: "--max-old-space-size=512",
    },
  });

  const storefront = service("storefront", {
    source: repo,
    configFile: "apps/storefront/railway.toml",
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: "apps/storefront/Dockerfile",
      watchPatterns: [
        "apps/storefront/**",
        "pnpm-lock.yaml",
        "pnpm-workspace.yaml",
        "package.json",
      ],
    },
    healthcheck: "/in",
    healthcheckTimeout: 300,
    env: {
      NODE_ENV: "production",
      NEXT_PUBLIC_MEDUSA_BACKEND_URL:
        "https://${{medusa.RAILWAY_PUBLIC_DOMAIN}}",
      NEXT_PUBLIC_STRAPI_URL: "https://${{strapi.RAILWAY_PUBLIC_DOMAIN}}",
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: preserve(),
      NEXT_PUBLIC_RAZORPAY_KEY_ID: preserve(),
      NEXT_PUBLIC_SHOP_NAME: "EnteraVeil",
      NEXT_PUBLIC_SHOP_DESCRIPTION: "Anime streetwear from beyond the veil",
      STRAPI_API_TOKEN: preserve(),
      STRAPI_WEBHOOK_REVALIDATION_SECRET: preserve(),
    },
  });

  const strapi = service("strapi", {
    source: repo,
    configFile: "apps/strapi/railway.toml",
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: "apps/strapi/Dockerfile",
      watchPatterns: [
        "apps/strapi/**",
        "pnpm-lock.yaml",
        "pnpm-workspace.yaml",
        "package.json",
      ],
    },
    healthcheck: "/admin",
    healthcheckTimeout: 300,
    volumeMounts: {
      "strapi-uploads": {
        mountPath: "/app/apps/strapi/public/uploads",
      },
    },
    env: {
      NODE_ENV: "production",
      HOST: "0.0.0.0",
      DATABASE_CLIENT: "postgres",
      DATABASE_HOST: Postgres.env.PGHOST,
      DATABASE_PORT: Postgres.env.PGPORT,
      DATABASE_NAME: "strapi",
      DATABASE_USERNAME: Postgres.env.PGUSER,
      DATABASE_PASSWORD: Postgres.env.PGPASSWORD,
      DATABASE_SSL: "false",
      APP_KEYS: preserve(),
      API_TOKEN_SALT: preserve(),
      ADMIN_JWT_SECRET: preserve(),
      TRANSFER_TOKEN_SALT: preserve(),
      ENCRYPTION_KEY: preserve(),
      STOREFRONT_REVALIDATION_URL:
        "https://${{storefront.RAILWAY_PUBLIC_DOMAIN}}/api/strapi-revalidate",
    },
  });

  return project("enteraveil", {
    resources: [Postgres, Redis, strapiUploads, medusa, storefront, strapi],
  });
});