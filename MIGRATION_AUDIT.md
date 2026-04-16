# Migration Readiness Audit Report

**Generated:** 2026-04-06
**Application:** LocalBudget (meBudget)
**Stack:** Next.js 15, React 19, Prisma 5, PostgreSQL 16, Docker

---

## Summary

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Security | 2 | 1 | 1 | 0 |
| Performance | 0 | 0 | 1 | 0 |
| Usability | 0 | 3 | 2 | 3 |
| Privacy | 0 | 0 | 0 | 1 |
| **Total** | **2** | **4** | **4** | **4** |

---

## 5a. Usability

### USR-001 — Missing page metadata on dashboard routes
- **Severity:** HIGH
- **Description:** Only auth pages export `metadata`. All dashboard pages (`/dashboard`, `/expenses`, `/reports`, `/import`, `/team`, `/admin/*`) use the root layout title "LocalBudget — Personal Finance Tracker", making browser tabs indistinguishable.
- **Fix:** Add `export const metadata: Metadata` to every page.tsx under `(dashboard)/`.

### USR-002 — Missing loading.tsx for async server component routes
- **Severity:** HIGH
- **Description:** Dashboard, expenses, reports, team, and admin pages are async server components that fetch data without `<Suspense>` boundaries or `loading.tsx` files. Users see a blank page while data loads.
- **Fix:** Add `loading.tsx` skeleton files to each route segment.

### USR-003 — Missing aria-labels on icon-only buttons
- **Severity:** HIGH
- **Description:** Icon-only buttons (copy invite link, table action menus, password visibility toggles, clear filters) lack `aria-label`. Screen readers announce them as unlabeled.
- **Files:** `team-management.tsx`, `user-management-table.tsx`, `login-form.tsx`, `register-form.tsx`, `expense-filters.tsx`
- **Fix:** Add `aria-label` to all icon-only `<Button>` elements.

### USR-004 — Expense filters search input has no label
- **Severity:** MEDIUM
- **Description:** The search input in `expense-filters.tsx` uses placeholder text only ("Search vendor or notes…") with no `<Label>` or `aria-label`.
- **Fix:** Add `aria-label="Search expenses"` to the input.

### USR-005 — Touch targets below 44×44px
- **Severity:** MEDIUM
- **Description:** Several icon buttons use `h-7 w-7` (28px) or `h-8 w-8` (32px): table action triggers, invite copy/revoke buttons, theme toggle.
- **Fix:** Increase to `h-9 w-9` minimum with additional padding, or wrap in larger hit areas.

### USR-006 — Form errors displayed only at top of form
- **Severity:** LOW
- **Description:** Validation errors are shown in a top-level `<Alert>` rather than inline with the offending field. Users must scroll up to see errors on longer forms.
- **Fix:** Add inline field-level error messages with `aria-invalid` and `aria-describedby`.

### USR-007 — Color-only category indicators
- **Severity:** LOW
- **Description:** Category badges in recent-expenses use color dots without text in some compact views. Colorblind users cannot distinguish categories.
- **Fix:** Ensure text labels always accompany color indicators.

### USR-008 — Missing empty state in admin user table
- **Severity:** LOW
- **Description:** `UserManagementTable` renders an empty table body when no users match (unlikely but possible after deletion).
- **Fix:** Add "No users found" empty state row.

---

## 5b. Response Time & Performance

### PERF-001 — getMonthlyReport fetches all yearly expenses in memory
- **Severity:** MEDIUM
- **Description:** `getMonthlyReport()` in `actions/expenses.ts` fetches every expense for a year without pagination, then aggregates in-memory. For users with 50k+ annual transactions this could cause memory pressure.
- **Fix:** Replace with Prisma `groupBy` aggregations at the database level for category-month breakdowns, fetch individual expenses only when needed.

**All other performance checks passed:**
- ✅ No N+1 query patterns detected
- ✅ Proper eager loading (`include`) on all relation queries
- ✅ Expense list paginated (50 per page)
- ✅ Dashboard stats use `aggregate()` and `groupBy()` — efficient
- ✅ Database indexes present on all WHERE/ORDER BY columns (userId, date, category, teamId, createdById, email, role, token)

---

## 5c. Security Vulnerabilities

### SEC-001 — Critical dependency vulnerabilities (Next.js)
- **Severity:** CRITICAL
- **Description:** `npm audit` reports 1 critical vulnerability in `next@15.1.3` covering 14 CVEs including RCE via React flight protocol (GHSA-9qr9-h5gf-34mp), authorization bypass in middleware (GHSA-f82v-jwr5-mffw), and SSRF via middleware redirect (GHSA-4342-x723-ch2f).
- **Fix:** Upgrade to `next@15.5.14` via `npm audit fix --force`.

### SEC-002 — No rate limiting on authentication endpoints
- **Severity:** CRITICAL
- **Description:** Login and registration endpoints have no rate limiting. Vulnerable to brute-force attacks, credential stuffing, and account enumeration.
- **Fix:** Implement rate limiting middleware. For self-hosted Docker: in-memory rate limiter with IP-based tracking (5 failed logins per 15 min, 10 registrations per hour).

### SEC-003 — No server-side file validation on import
- **Severity:** HIGH
- **Description:** `importExpenses()` in `actions/import.ts` accepts file uploads without server-side file type validation or size limits. Only the HTML `accept` attribute on the client restricts file types.
- **Fix:** Add file size limit (5MB), validate MIME type and file extension server-side before parsing.

### SEC-004 — xlsx library has known prototype pollution vulnerability
- **Severity:** MEDIUM
- **Description:** `xlsx@0.18.5` has a high-severity prototype pollution vulnerability (GHSA-4r6h-8v6p-xvw6) and ReDoS vulnerability (GHSA-5pgg-2g8v-p4x9). No fix available from upstream.
- **Fix:** Consider migrating to `sheetjs-ce` (community edition) or `exceljs`. For now, the risk is mitigated by server-side usage only with authenticated users.

### SEC-005 — Missing HTTP security headers
- **Severity:** HIGH (downgraded to MEDIUM after fix)
- **Description:** No Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, or Permissions-Policy headers configured.
- **Fix:** Add security headers in `next.config.ts`.

**Security checks that passed:**
- ✅ All inputs validated with Zod before database access
- ✅ No raw SQL — Prisma ORM used exclusively (parameterized queries)
- ✅ Password hashing: bcryptjs with cost factor 12
- ✅ CSRF protection via NextAuth JWT + SameSite cookies
- ✅ Session: JWT strategy, 30-day maxAge, HttpOnly cookies (NextAuth defaults)
- ✅ Error responses return generic messages, no stack traces leaked
- ✅ Proper RBAC: admin routes protected in middleware, data access scoped per user/team
- ✅ No IDOR vulnerabilities — `buildOwnerFilter()` enforces ownership

---

## 5d. Privacy

### PRV-001 — Prisma query logging enabled in development
- **Severity:** LOW
- **Description:** `lib/db.ts` enables `query` logging in development mode, which logs full SQL queries including parameter values (email addresses, amounts). Acceptable for dev but should be documented.
- **Fix:** Document in README that dev mode logs queries. No production risk (production only logs errors).

**Privacy checks that passed:**
- ✅ No PII written to application logs in production
- ✅ No analytics or error-tracking integrations present
- ✅ No cross-user data leakage — queries scoped by userId/teamId
- ✅ No shared cache keys — no Redis or external cache layer
- ✅ Invitation tokens are cryptographic CUIDs (non-guessable)
- ✅ Database backups handled by PostgreSQL volume (encryption depends on host OS)

---

## Auto-Applied Fixes

The following critical and high severity issues were automatically fixed:

1. **SEC-001:** Next.js upgraded to latest secure version
2. **SEC-002:** Rate limiting added to auth endpoints
3. **SEC-003:** Server-side file validation added to import action
4. **SEC-005:** HTTP security headers added to next.config.ts
5. **USR-001:** Page metadata added to all dashboard routes
6. **USR-002:** Loading skeletons added to all dashboard routes
7. **USR-003:** Aria-labels added to icon-only buttons
