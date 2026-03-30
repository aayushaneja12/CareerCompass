#!/bin/bash

set -euo pipefail

# Resolve directories
SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Load env
if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
else
  echo ".env not found at $ROOT_DIR/.env"
  exit 1
fi

# Require DB URL
: "${SUPABASE_DB_URL:?SUPABASE_DB_URL is not set}"

# Paths to SQL (adjust if your script lives inside supabase/)
SQL_DIR="$ROOT_DIR/supabase"

echo "Running schema setup against $SUPABASE_DB_URL ..."
psql "$SUPABASE_DB_URL" -f "$SQL_DIR/schema_enums.sql"
psql "$SUPABASE_DB_URL" -f "$SQL_DIR/core_tables.sql"
psql "$SUPABASE_DB_URL" -f "$SQL_DIR/booking_system.sql"
psql "$SUPABASE_DB_URL" -f "$SQL_DIR/career_copilot_schema.sql"
psql "$SUPABASE_DB_URL" -f "$SQL_DIR/indexes.sql"
psql "$SUPABASE_DB_URL" -f "$SQL_DIR/rls_policies.sql"
psql "$SUPABASE_DB_URL" -f "$SQL_DIR/views.sql"
psql "$SUPABASE_DB_URL" -f "$SQL_DIR/seed_data.sql"
echo "Database setup complete."