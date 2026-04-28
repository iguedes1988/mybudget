# CLAUDE.md — MyBudget

> Update this file after every major change.

---

## Project Overview

**MyBudget** — private personal finance tracker.
Target users: individuals, families, small teams.
Single-tenant: one deployment per owner.
Production URL: `https://mybudget.apphouse.app`

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js App Router + Server Actions | ^16.2.2 |
| Language | TypeScript | ^5 |
| Auth | Auth.js v5 (next-auth beta) | ^5.0.0-beta.25 |
| ORM | Prisma | ^5.22.0 |
| Database | PostgreSQL 16 (Supabase cloud) | — |
| Validation | Zod (server-side in every action) | ^3.23.8 |
| UI | shadcn/ui + Radix UI + Tailwind CSS | ^3.4.17 |
| Charts | Recharts (`'use client'` required) | ^2.14.1 |
| Email | Nodemailer v7, SMTP (Spacemail port 465) | ^7.0.13 |
| Export | jsPDF + xlsx | — |
| CSV Import | papaparse | ^5.4.1 |
| Testing | Jest + ts-jest | — |
| Container | Docker multi-stage, standalone output, port 8080 | — |

---

## Key Commands

```bash
# Dev
npm run dev              # Next.js on localhost:3000
npm run db:studio        # Prisma Studio on localhost:5555

# Build
npm run build            # next build
docker compose up -d --build   # local Docker (port 8080)

# Database
npm run db:push          # prisma db push (requires DIRECT_URL set)
npm run db:seed          # seed admin + demo users
. .\scripts\set-db-env.ps1    # set Supabase env vars (Windows)
source ./scripts/set-db-env.sh # set Supabase env vars (Linux/Mac)

# Tests
npx jest --passWithNoTests

# Deploy
git push origin main
# → GitHub Actions builds image → pushes to ghcr.io/iguedes1988/mybudget:latest
# → Hyperlift: click Build → pulls pre-built image
```

---

## Project Structure

```
actions/          Server Actions ("use server") — auth, expenses, income,
                  import, contact, settings, team, users, verification
app/
  (auth)/         login, register, verify pages
  (dashboard)/    dashboard, expenses, income, reports, import,
                  settings, team, admin pages
  (public)/       terms, privacy, how-it-works, faq, contact
  api/            /api/auth/[...nextauth], /api/export, /api/export-template
  error.tsx       global error boundary
components/
  admin/          admin-specific UI
  auth/           login-form, register-form
  layout/         header, sidebar, footer, banners
  ui/             shadcn/ui primitives
lib/
  db.ts           Prisma client singleton
  mail.ts         Nodemailer transport, resolveSmtpPass()
  rate-limit.ts   in-memory rate limiter (Map-based)
  validations.ts  all Zod schemas
  constants.ts    expense/income categories
prisma/
  schema.prisma   data model
  seed.ts         admin + demo seed
types/
  next-auth.d.ts  session/JWT type augmentation
auth.ts           NextAuth config (JWT, credentials provider)
middleware.ts     route protection
next.config.ts    standalone output, allowedOrigins, security headers
Dockerfile        1-line puller (FROM ghcr.io/...) — used by Hyperlift
Dockerfile.build  full multi-stage build — used by GitHub Actions
docker-entrypoint.sh  schema push + seed + start
.github/workflows/docker-publish.yml  CI/CD pipeline
```

---

## Coding Conventions

- **Server Actions**: every action calls `auth()` first, validates with Zod `safeParse()`, returns `{ error: string }` on failure.
- **Data scoping**: always use `buildOwnerFilter()` — ADMIN sees all, TEAM sees team data, PERSONAL sees own.
- **No React Hook Form** — native `FormData` + Server Actions only.
- **Recharts components** must have `'use client'` directive.
- **Passwords**: bcrypt cost 12. Never store plain text.
- **SMTP password**: store as `SMTP_PASS_B64` (base64). Decoded by `resolveSmtpPass()` in `lib/mail.ts`.
- **DB password**: store as `DB_PASS_B64`. Decoded by `docker-entrypoint.sh` at runtime.
- **Error returns**: `return { error: "message" }` — never `throw` from Server Actions.
- **Redirects in actions**: use `redirect()` from `next/navigation` — keep separate from `signOut()` to avoid Auth.js v5 error boundary bug.

---

## Important Rules

### Never commit secrets
`.env` is gitignored. Never commit:
- `DATABASE_URL`, `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `SMTP_PASS`, `SMTP_PASS_B64`, `DB_PASS_B64`
- Any API key or token

Store secrets in: Hyperlift dashboard → Environment variables.

### Auth.js v5 (beta) quirks
- `emailVerified` conflicts with Auth.js core type — use `isEmailVerified` in JWT/session.
- `signOut({ redirectTo })` throws a redirect that React error boundaries can catch.
  **Fix**: always use `signOut({ redirect: false })` then `redirect("/login")` separately.
- `findUnique` does not accept non-unique fields — use `findFirst` for `ownerId`.

### Rate limiting
- In-memory `Map` in `lib/rate-limit.ts` — resets on container restart.
- `RATE_LIMIT_DISABLED=true` in local `.env` for testing. **Never set in production.**
- Production 429 errors that show an HTML page with "influx of requests" are from **Hyperlift's WAF**, not our app. Contact Spaceship support to adjust threshold.

### Sidebar prefetch — always keep `prefetch={false}`
All `<Link>` components in `components/layout/sidebar.tsx` **must** include `prefetch={false}`.
The sidebar is always fully visible, so Next.js would fire a prefetch request for every link simultaneously on every page load. With 11 links that's 11 concurrent requests per navigation — enough to trigger Hyperlift's WAF and return 429 to the user.
`prefetch={false}` disables this; pages still load instantly on click via the router cache.

### Supabase (cloud DB)
- `DATABASE_URL`: transaction pooler port 6543, `?pgbouncer=true`
- `DIRECT_URL`: session pooler port 5432 — for `prisma db push`
- Passwords with special chars must be URL-encoded (`@` → `%40`).
- Direct connection (`db.*.supabase.co:5432`) is blocked on free tier (IPv6).

### Docker / Hyperlift deployment
- Hyperlift Micro (0.5 GiB RAM) cannot build Next.js — OOMs.
- Build runs in **GitHub Actions** (7 GB RAM) via `Dockerfile.build`.
- Hyperlift uses thin `Dockerfile` (1 line: `FROM ghcr.io/...`) to pull pre-built image.
- GHCR package must be **Public** — Hyperlift pulls anonymously.
- `NEXTAUTH_URL` and `APP_URL` must match the production domain exactly.
- `allowedOrigins` in `next.config.ts` includes both `mybudget.apphouse.app` and `apphouse.app` to prevent CSRF errors on server actions.

### No self-hosted / infrastructure language in UI
User-facing pages (terms, faq, how-it-works, privacy) must not mention Docker, self-hosting, or infrastructure. Brand is "MyBudget" everywhere.

---

## Environment Variables Reference

| Variable | Where set | Notes |
|---|---|---|
| `DATABASE_URL` | Hyperlift / `.env` | Set by entrypoint if `SUPABASE_PROJECT_REF` present |
| `DIRECT_URL` | Hyperlift / `.env` | For prisma db push |
| `NEXTAUTH_SECRET` | Hyperlift | Min 32 chars. Same across deploys. |
| `NEXTAUTH_URL` | Hyperlift | `https://mybudget.apphouse.app` |
| `APP_URL` | Hyperlift | Same as NEXTAUTH_URL |
| `DB_PASS_B64` | Hyperlift | base64(Supabase password) |
| `SUPABASE_PROJECT_REF` | Hyperlift | Project ref ID |
| `SUPABASE_REGION` | Hyperlift | e.g. `aws-1-us-east-1` |
| `SMTP_HOST` | Hyperlift | `mail.spacemail.com` |
| `SMTP_PORT` | Hyperlift | `465` |
| `SMTP_SECURE` | Hyperlift | `true` |
| `SMTP_USER` | Hyperlift | `admin@apphouse.app` |
| `SMTP_PASS_B64` | Hyperlift | base64(SMTP password) |
| `FROM_EMAIL` | Hyperlift | `admin@apphouse.app` |
| `CONTACT_RECIPIENT_EMAIL` | Hyperlift | `admin@apphouse.app` |
| `ADMIN_EMAIL` | Hyperlift | Seed only |
| `ADMIN_PASSWORD` | Hyperlift | Seed only |
| `ADMIN_NAME` | Hyperlift | Seed only |
| `RATE_LIMIT_DISABLED` | `.env` only | `true` for local testing |
| `RATE_LIMIT_MULTIPLIER` | `.env` only | e.g. `10` for relaxed testing |
