# ─────────────────────────────────────────────────────────────────────────────
# MyBudget — Supabase environment setup (Windows PowerShell)
#
# Run this ONCE in your terminal before prisma commands:
#   . .\scripts\set-db-env.ps1
#
# Then you can use:
#   npx prisma db push
#   npx prisma studio
#   npx tsx prisma/seed.ts
# ─────────────────────────────────────────────────────────────────────────────

$B64 = "RHJlQGJpZ215YjIwMjY="
$PROJECT_REF = "jpeporvjrjdphoxxabfb"
$REGION = "aws-1-us-east-1"

$PASS = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($B64))
$PASS_ENC = [Uri]::EscapeDataString($PASS)

$env:DATABASE_URL = "postgresql://postgres.$PROJECT_REF`:$PASS_ENC@$REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
$env:DIRECT_URL   = "postgresql://postgres.$PROJECT_REF`:$PASS_ENC@$REGION.pooler.supabase.com:5432/postgres"

Write-Host "✅ Supabase env vars set for this terminal session." -ForegroundColor Green
Write-Host "   DATABASE_URL → pooler  ($REGION)"
Write-Host "   DIRECT_URL   → direct  (db.$PROJECT_REF.supabase.co)"
Write-Host ""
Write-Host "Run: npx prisma db push"
