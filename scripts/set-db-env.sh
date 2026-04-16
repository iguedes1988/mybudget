#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# MyBudget — Supabase environment setup (bash / Git Bash)
#
# Source this ONCE in your terminal before prisma commands:
#   source ./scripts/set-db-env.sh
#
# Then you can use:
#   npx prisma db push
#   npx prisma studio
#   npx tsx prisma/seed.ts
# ─────────────────────────────────────────────────────────────────────────────

B64="RHJlQGJpZ215YjIwMjY="
PROJECT_REF="jpeporvjrjdphoxxabfb"
REGION="aws-1-us-east-1"

PASS=$(echo "$B64" | base64 -d)
PASS_ENC=$(node -e "process.stdout.write(encodeURIComponent(process.argv[1]))" -- "$PASS")

export DATABASE_URL="postgresql://postgres.${PROJECT_REF}:${PASS_ENC}@${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true"
export DIRECT_URL="postgresql://postgres.${PROJECT_REF}:${PASS_ENC}@${REGION}.pooler.supabase.com:5432/postgres"

echo "✅ Supabase env vars set for this terminal session."
echo "   DATABASE_URL → pooler  ($REGION)"
echo "   DIRECT_URL   → direct  (db.$PROJECT_REF.supabase.co)"
echo ""
echo "Run: npx prisma db push"
