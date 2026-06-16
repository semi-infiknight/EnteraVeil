-- Idempotent second-database setup for Strapi on shared Railway Postgres.
SELECT 'CREATE DATABASE strapi'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'strapi')\gexec