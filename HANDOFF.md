# HANDOFF.md

Read CLAUDE.md first. This file documents recent work and open items.

---

## Last Session — What Was Done

### Sign-out error fixed
**Problem**: "Something went wrong — An unexpected error occurred" on sign-out.
**Root cause A**: Auth.js v5 beta — `signOut({ redirectTo })` throws a redirect that React error boundary catches as a real error.
**Root cause B**: `allowedOrigins` in `next.config.ts` had only one domain. Users arriving via `apphouse.app` (root) had server actions CSRF-rejected.

**Fix applied**:
- `actions/auth.ts`: changed to `signOut({ redirect: false })` then `redirect("/login")` separately.
- `next.config.ts`: `allowedOrigins` now includes `mybudget.apphouse.app`, `apphouse.app`, `www.apphouse.app`, `localhost:3000`, `localhost:8080`.

### 429 on second user login (same device)
**Root cause**: Hyperlift's ingress WAF (`ingress-vorlis.hyperlift.io`) — not our app.
**Evidence**: Error HTML page says "There has been a sudden influx of requests from your IP". Our app returns JSON `{ error: "..." }`.
**Our rate limiter**: `RATE_LIMIT_DISABLED=true` in local `.env` bypasses it locally. On Hyperlift, it uses production defaults (10 login / 15 min).
**Action required**: Contact Spaceship/Hyperlift support to raise WAF threshold for the account, or test less aggressively in production.

### Terms acceptance added
Checkbox on register form linking to `/terms` and `/privacy`.
Validated server-side via `z.literal(true)` in `registerSchema`.

### Rate limit env vars added
`RATE_LIMIT_DISABLED`, `RATE_LIMIT_MULTIPLIER`, per-endpoint vars.
See `.env.example` for full list.

### CLAUDE.md created
Full project reference — read it before making any changes.

---

## Current Git State

Branch: `main`
Remote: `https://github.com/iguedes1988/mybudget.git`
Last commit: sign-out fix + CLAUDE.md + HANDOFF.md

---

## Deployment State

- **GitHub Actions**: pushes Docker image to `ghcr.io/iguedes1988/mybudget:latest` on every push to `main`.
- **Hyperlift**: manual Build click required after GitHub Actions completes.
- **Database**: Supabase free tier, seeded with admin (`admin@localbudget.local`) and demo user.
- **Domain**: `mybudget.apphouse.app` → CNAME → `ingress-vorlis.hyperlift.io`

---

## Known Issues / Open Items

| Issue | Status | Notes |
|---|---|---|
| Hyperlift 429 WAF | Open | Contact Spaceship support. Not fixable from code. |
| Prisma WASM missing in runner | Mitigated | Entrypoint uses `node node_modules/prisma/build/index.js` instead of `.bin/prisma`. Falls back gracefully. |
| Auth.js v5 still in beta | Ongoing | Upgrade to stable when released. Watch for breaking changes in session/JWT types. |

---

## How to Resume Development

```bash
cd C:\Users\guedes\.claude\meBudget
# Read CLAUDE.md for full context
# Start dev server:
npm run dev
# Or Docker:
docker compose up -d --build
```

To deploy: `git push origin main` → wait for GitHub Actions ✅ → click Build in Hyperlift.
