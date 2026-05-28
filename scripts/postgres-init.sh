#!/bin/bash
# Initializes additional Postgres databases listed in POSTGRES_MULTIPLE_DATABASES (comma-separated).
# Mounted into the official postgres image's /docker-entrypoint-initdb.d, runs on first container boot only.
set -e

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
  IFS=',' read -ra dbs <<< "$POSTGRES_MULTIPLE_DATABASES"
  for db in "${dbs[@]}"; do
    db_trimmed="$(echo -n "$db" | xargs)"
    if [ "$db_trimmed" != "$POSTGRES_DB" ]; then
      echo "  → creating database '$db_trimmed'"
      psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
        CREATE DATABASE "$db_trimmed";
        GRANT ALL PRIVILEGES ON DATABASE "$db_trimmed" TO "$POSTGRES_USER";
EOSQL
    fi
  done
fi
