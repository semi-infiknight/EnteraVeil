#!/usr/bin/env node
/*
 * Ensure the Strapi database exists before Strapi boots.
 *
 * Railway's Postgres template provisions a single default database, but this
 * service is configured with DATABASE_NAME=strapi. Connecting to the app's
 * target database fails if it has not been created yet, so this bootstrap
 * connects to the maintenance `postgres` database and issues CREATE DATABASE
 * when needed. It is idempotent and safe to run on every boot.
 */
const { Client } = require('pg');

const target = process.env.DATABASE_NAME || 'strapi';

const sslEnabled = String(process.env.DATABASE_SSL).toLowerCase() === 'true';

function quoteIdent(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

async function main() {
  if (!process.env.DATABASE_HOST) {
    console.log('[ensure-db] DATABASE_HOST not set; skipping database bootstrap.');
    return;
  }

  // The maintenance database always exists on a Postgres server.
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 5432),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: 'postgres',
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 15000,
  });

  await client.connect();
  try {
    const existing = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [target]
    );

    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE ${quoteIdent(target)}`);
      console.log(`[ensure-db] Created database "${target}".`);
    } else {
      console.log(`[ensure-db] Database "${target}" already exists.`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(`[ensure-db] Failed: ${error.message}`);
  process.exit(1);
});
