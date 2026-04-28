# HANDOFF.md

Read CLAUDE.md first. This file documents recent work and open items.

---

## Last Session — What Was Done

### `prefetch={false}` sweep across all Link components — FIXED
**Problem**: Multiple 429 WAF errors in production:
- Fast sidebar navigation (11 prefetch requests per page load)
- Loading expenses page (one prefetch per table row — up to 50 requests)
- Adding a new expense (expenses page still fires row prefetches while form loads)
- Personal account registration (auth layout fired 5 prefetch requests; Personal users submit faster than Team/Family users so they hit the WAF window)

**Root cause**: Next.js prefetches every visible `<Link>` on viewport entry. Never one request — always a burst equal to the number of links visible at render time.

**Fix applied**: Added `prefetch={false}` to all `<Link>` components across the entire codebase:
- `components/layout/sidebar.tsx` — 11 nav links
- `components/expenses/expense-table.tsx` — edit link per row + 2 pagination
- `components/income/income-table.tsx` — edit link per row + 2 pagination
- `components/admin/user-management-table.tsx` — 2 links per user row
- `app/(auth)/layout.tsx` — 5 footer links (root cause of Personal reg 429)
- `components/layout/footer.tsx` — 5 footer links
- `app/(public)/layout.tsx` — 3 header links
- All remaining pages and form components (15+ single links)

**Rule going forward**: Every new `<Link>` must include `prefetch={false}`. See CLAUDE.md.

### Technical docs updated + Lessons Learned section added
- `/admin/docs` now has a full "Lessons Learned" section documenting all production issues encountered (WAF 429, Hyperlift OOM, GHCR visibility, Prisma WASM, Auth.js v5 signOut, CSRF allowedOrigins, SSL cert mismatch, Supabase free tier limits).

### Sign-out error fixed (previous session)
**Problem**: "Something went wrong — An unexpected error occurred" on sign-out.
**Root cause A**: Auth.js v5 beta — `signOut({ redirectTo })` throws a redirect that React error boundary catches as a real error.
**Root cause B**: `allowedOrigins` in `next.config.ts` had only one domain. Users arriving via `apphouse.app` (root) had server actions CSRF-rejected.
**Fix applied**:
- `actions/auth.ts`: changed to `signOut({ redirect: false })` then `redirect("/login")` separately.
- `next.config.ts`: `allowedOrigins` now includes `mybudget.apphouse.app`, `apphouse.app`, `www.apphouse.app`, `localhost:3000`, `localhost:8080`.

### 429 on second user login (same device) — WAF, not our app
**Root cause**: Hyperlift's ingress WAF (`ingress-vorlis.hyperlift.io`) — not our rate limiter.
**Evidence**: Error HTML page says "There has been a sudden influx of requests from your IP". Our app returns JSON `{ error: "..." }`.
**Status**: The prefetch fix significantly reduces total request count per session, which should prevent this from triggering. Our in-app rate limiter is bypassed locally via `RATE_LIMIT_DISABLED=true`.

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
| Hyperlift 429 WAF — navigation | **Fixed** | `prefetch={false}` on all Links eliminates prefetch bursts. |
| Hyperlift 429 WAF — login bursts | Mitigated | Prefetch fix reduces overall request density. If still triggered, contact Spaceship support to raise WAF threshold. |
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
