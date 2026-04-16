#!/bin/sh
set -e

# ─────────────────────────────────────────────────────────────────────────────
# Database URL construction
# If DB_PASS_B64 + SUPABASE_PROJECT_REF are set → connect to Supabase
# Otherwise → use DATABASE_URL as-is (local postgres)
# ─────────────────────────────────────────────────────────────────────────────
if [ -n "$DB_PASS_B64" ] && [ -n "$SUPABASE_PROJECT_REF" ]; then
  _PASS=$(echo "$DB_PASS_B64" | base64 -d)
  _PASS_ENC=$(node -e "process.stdout.write(encodeURIComponent(process.argv[1]))" -- "$_PASS")
  REGION="${SUPABASE_REGION:-aws-1-us-east-1}"
  export DATABASE_URL="postgresql://postgres.${SUPABASE_PROJECT_REF}:${_PASS_ENC}@${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true"
  # Session pooler (port 5432) used for DIRECT_URL — IPv4, supports DDL
  export DIRECT_URL="postgresql://postgres.${SUPABASE_PROJECT_REF}:${_PASS_ENC}@${REGION}.pooler.supabase.com:5432/postgres"
  echo "▶ Database: Supabase (${SUPABASE_PROJECT_REF})"
else
  export DIRECT_URL="${DATABASE_URL}"
  echo "▶ Database: local postgres"
fi

echo "▶ Applying database schema..."
node -e "
const { execSync } = require('child_process');
try {
  execSync('node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss', { stdio: 'inherit', env: { ...process.env, PATH: process.env.PATH } });
} catch (e) {
  console.error('Warning: Could not apply schema. DB may already be set up.');
}
"

echo "▶ Seeding database (safe — skips if data exists)..."
if [ -f "prisma/dist/seed.js" ]; then
  node prisma/dist/seed.js || echo "Seed skipped (data may already exist)."
else
  echo "No compiled seed found, skipping."
fi

echo "▶ Starting MyBudget..."
exec node server.js
