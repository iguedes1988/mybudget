import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Technical Docs — MyBudget",
  description: "System architecture and deployment documentation",
};

export default async function AdminDocsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div>
      <Header title="Technical Documentation" description="System architecture, deployment, and configuration reference" />

      <div className="space-y-6 max-w-4xl">

        {/* Architecture Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Architecture Overview</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium text-muted-foreground w-48">Framework</td>
                  <td className="py-2">Next.js 16 (App Router, Server Actions, TypeScript)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-muted-foreground">Database</td>
                  <td className="py-2">PostgreSQL 16 via Prisma ORM 5.22 — <code className="bg-muted px-1 rounded text-xs">prisma db push</code> (no migrations)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-muted-foreground">Authentication</td>
                  <td className="py-2">Auth.js v5 (next-auth beta) — JWT strategy, credentials provider. No password reset — locked-out users contact admin.</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-muted-foreground">Validation</td>
                  <td className="py-2">Zod — schemas in <code className="bg-muted px-1 rounded text-xs">lib/validations.ts</code>, enforced server-side in every Server Action</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-muted-foreground">UI Library</td>
                  <td className="py-2">shadcn/ui + Radix UI + Tailwind CSS + lucide-react</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-muted-foreground">Charts</td>
                  <td className="py-2">Recharts (React 19 peer dep fixed via <code className="bg-muted px-1 rounded text-xs">overrides: react-is@^19</code>)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-muted-foreground">Export</td>
                  <td className="py-2">jsPDF (PDF) + xlsx (Excel/CSV)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-muted-foreground">Import</td>
                  <td className="py-2">papaparse (CSV) + xlsx (Excel) — flexible date/amount format support</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-muted-foreground">Email</td>
                  <td className="py-2">Nodemailer v7, SMTP transport (Spacemail port 465 SSL)</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-muted-foreground">Deployment</td>
                  <td className="py-2">Docker multi-stage build, standalone output, port 8080 (Spaceship Hyperlift)</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Data Model */}
        <Card>
          <CardHeader>
            <CardTitle>Data Model</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="font-semibold mb-1">User</p>
                <p className="text-muted-foreground text-xs">
                  Core entity. Fields: role (USER/ADMIN), accountType (PERSONAL/TEAM/FAMILY), incomeEnabled, emailVerified, verificationToken/Expiry, pendingDeletion, deletionScheduledAt, optional teamId. Owns expenses and incomes.
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="font-semibold mb-1">Team</p>
                <p className="text-muted-foreground text-xs">
                  Groups users. Has an owner (ownerId, unique), type, and members. When the owner deletes their account, the team is auto-disbanded: members reset to PERSONAL, expenses/incomes unlinked (preserved).
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="font-semibold mb-1">Expense</p>
                <p className="text-muted-foreground text-xs">
                  date, category (19 types), vendor, amount (Decimal 10,2), notes. Linked to userId, optional teamId and createdById for team attribution.
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="font-semibold mb-1">Income</p>
                <p className="text-muted-foreground text-xs">
                  date, category (5 types), source, amount (Decimal 10,2), notes. Same ownership model as Expense. Feature-flagged via user.incomeEnabled.
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="font-semibold mb-1">TeamMember</p>
                <p className="text-muted-foreground text-xs">
                  Join table: teamId + userId (unique). Tracks joinedAt.
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="font-semibold mb-1">TeamInvitation</p>
                <p className="text-muted-foreground text-xs">
                  email, token (unique), status (PENDING/ACCEPTED/DECLINED/EXPIRED), expiresAt. Used for team invite flow.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Control */}
        <Card>
          <CardHeader>
            <CardTitle>Access Control</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <div>
              <p className="font-semibold mb-2">Middleware Rules</p>
              <ul className="space-y-1 text-muted-foreground text-xs list-disc pl-4">
                <li><strong>Static pages</strong> (/terms, /privacy, /how-it-works, /faq, /contact, /verify) — accessible to everyone</li>
                <li><strong>Auth pages</strong> (/login, /register) — redirect logged-in users to /dashboard</li>
                <li><strong>Protected pages</strong> — redirect unauthenticated users to /login with callbackUrl</li>
                <li><strong>Admin pages</strong> (/admin/*) — redirect non-admin users to /dashboard</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Data Scoping (buildOwnerFilter)</p>
              <ul className="space-y-1 text-muted-foreground text-xs list-disc pl-4">
                <li><strong>ADMIN</strong> — can view/manage all users&apos; data, filter by userId</li>
                <li><strong>TEAM member</strong> — sees team-scoped data, can filter by memberId</li>
                <li><strong>PERSONAL</strong> — sees only own data (userId filter)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Server Action Security</p>
              <p className="text-muted-foreground text-xs">
                Every Server Action independently calls <code className="bg-muted px-1 rounded">auth()</code> and validates the session. Middleware is not relied upon for authorization. All inputs are re-validated with Zod <code className="bg-muted px-1 rounded">safeParse()</code> server-side.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email Verification */}
        <Card>
          <CardHeader>
            <CardTitle>Email Verification Flow</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <p className="font-semibold mb-1">Registration</p>
              <p className="text-muted-foreground text-xs">
                After registration, a <code className="bg-muted px-1 rounded">verificationToken</code> (32-byte hex, 24h expiry) is generated and stored on the user. A branded HTML email is sent via SMTP with a link to <code className="bg-muted px-1 rounded">{`${process.env.APP_URL || "APP_URL"}/verify?token=...`}</code>. If SMTP is not configured, the link is logged to the server console (dev mode).
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Verification Page</p>
              <p className="text-muted-foreground text-xs">
                <code className="bg-muted px-1 rounded">/verify?token=...</code> — public route (listed in middleware staticRoutes). Validates the token, sets <code className="bg-muted px-1 rounded">emailVerified=true</code> on the user record, and clears the token fields.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Session Field</p>
              <p className="text-muted-foreground text-xs">
                The JWT token and session carry <code className="bg-muted px-1 rounded">isEmailVerified: boolean</code> (renamed from <code className="bg-muted px-1 rounded">emailVerified</code> to avoid the Auth.js v5 <code className="bg-muted px-1 rounded">Date</code> type conflict). The dashboard layout reads directly from the DB for the verification banner check.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Dashboard Banner</p>
              <p className="text-muted-foreground text-xs">
                Unverified users see an amber dismissible banner in the dashboard layout with a resend button. Rate-limited to 1 resend per 2 minutes per user. Seeded admin and demo users have <code className="bg-muted px-1 rounded">emailVerified: true</code>.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">SMTP Config (Spacemail)</p>
              <p className="text-muted-foreground text-xs">
                Host: <code className="bg-muted px-1 rounded">mail.spacemail.com</code> · Port: <code className="bg-muted px-1 rounded">465</code> · SSL: <code className="bg-muted px-1 rounded">true</code> · FROM: <code className="bg-muted px-1 rounded">no-reply@apphouse.app</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle>Import</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <p className="font-semibold mb-1">File Parsing</p>
              <p className="text-muted-foreground text-xs">
                CSV files use <strong>papaparse</strong> (robust quoting, encoding, BOM handling). Excel (.xlsx/.xls) files use <strong>xlsx</strong>. Column headers are auto-trimmed and mapped heuristically.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Flexible Date Formats</p>
              <p className="text-muted-foreground text-xs">
                Supports ISO (<code className="bg-muted px-1 rounded">YYYY-MM-DD</code>), European (<code className="bg-muted px-1 rounded">DD/MM/YYYY</code>), and US (<code className="bg-muted px-1 rounded">MM-DD-YYYY</code>, <code className="bg-muted px-1 rounded">MM/DD/YYYY</code>) date formats. Dates are stored at noon UTC to avoid timezone boundary shifts.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Flexible Amount Formats</p>
              <p className="text-muted-foreground text-xs">
                Supports US (<code className="bg-muted px-1 rounded">1,234.56</code>), European (<code className="bg-muted px-1 rounded">1.234,56</code>), and currency-prefixed (<code className="bg-muted px-1 rounded">$1,234.56</code>, €, £, ¥) amount formats. Invalid rows are skipped with a per-row error message returned to the user.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Limits</p>
              <p className="text-muted-foreground text-xs">
                Maximum 5,000 rows per import. Valid rows are bulk-inserted via <code className="bg-muted px-1 rounded">createMany</code>. The result includes imported count, skipped count, and per-row error messages.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold">Variable</th>
                    <th className="text-left py-2 font-semibold">Required</th>
                    <th className="text-left py-2 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-1.5 font-mono">DATABASE_URL</td>
                    <td className="py-1.5"><Badge variant="destructive" className="text-[10px] px-1 py-0">Required</Badge></td>
                    <td className="py-1.5">PostgreSQL connection string</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 font-mono">NEXTAUTH_SECRET</td>
                    <td className="py-1.5"><Badge variant="destructive" className="text-[10px] px-1 py-0">Required</Badge></td>
                    <td className="py-1.5">JWT signing secret (min 32 chars). Generate: <code className="bg-muted px-0.5 rounded">openssl rand -base64 32</code></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 font-mono">NEXTAUTH_URL</td>
                    <td className="py-1.5"><Badge variant="destructive" className="text-[10px] px-1 py-0">Required</Badge></td>
                    <td className="py-1.5">Full app URL (e.g. https://mybudget.apphouse.app). Used for Server Actions allowedOrigins.</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 font-mono">APP_URL</td>
                    <td className="py-1.5"><Badge variant="destructive" className="text-[10px] px-1 py-0">Required</Badge></td>
                    <td className="py-1.5">Same as NEXTAUTH_URL. Used in email verification links.</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 font-mono">ADMIN_EMAIL</td>
                    <td className="py-1.5"><Badge variant="secondary" className="text-[10px] px-1 py-0">Seed</Badge></td>
                    <td className="py-1.5">Admin account email for initial seed</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 font-mono">ADMIN_PASSWORD</td>
                    <td className="py-1.5"><Badge variant="secondary" className="text-[10px] px-1 py-0">Seed</Badge></td>
                    <td className="py-1.5">Admin account password for initial seed</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 font-mono">ADMIN_NAME</td>
                    <td className="py-1.5"><Badge variant="secondary" className="text-[10px] px-1 py-0">Seed</Badge></td>
                    <td className="py-1.5">Admin account display name</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 font-mono">SMTP_HOST</td>
                    <td className="py-1.5"><Badge variant="outline" className="text-[10px] px-1 py-0">Optional</Badge></td>
                    <td className="py-1.5">SMTP hostname. Production: <code className="bg-muted px-0.5 rounded">mail.spacemail.com</code>. If unset, emails are logged to console.</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 font-mono">SMTP_PORT</td>
                    <td className="py-1.5"><Badge variant="outline" className="text-[10px] px-1 py-0">Optional</Badge></td>
                    <td className="py-1.5">SMTP port. Default: <code className="bg-muted px-0.5 rounded">465</code> (SSL/TLS). Use <code className="bg-muted px-0.5 rounded">587</code> for STARTTLS.</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 font-mono">SMTP_SECURE</td>
                    <td className="py-1.5"><Badge variant="outline" className="text-[10px] px-1 py-0">Optional</Badge></td>
                    <td className="py-1.5">Default: <code className="bg-muted px-0.5 rounded">true</code> (SSL). Set <code className="bg-muted px-0.5 rounded">false</code> for STARTTLS on port 587.</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 font-mono">SMTP_USER / SMTP_PASS</td>
                    <td className="py-1.5"><Badge variant="outline" className="text-[10px] px-1 py-0">Optional</Badge></td>
                    <td className="py-1.5">SMTP authentication credentials</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 font-mono">FROM_EMAIL</td>
                    <td className="py-1.5"><Badge variant="outline" className="text-[10px] px-1 py-0">Optional</Badge></td>
                    <td className="py-1.5">Sender address for outgoing emails. Falls back to SMTP_USER.</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-mono">CONTACT_RECIPIENT_EMAIL</td>
                    <td className="py-1.5"><Badge variant="outline" className="text-[10px] px-1 py-0">Optional</Badge></td>
                    <td className="py-1.5">Recipient for contact form submissions. Falls back to ADMIN_EMAIL then <code className="bg-muted px-0.5 rounded">admin@appbox.app</code>.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Docker Deployment */}
        <Card>
          <CardHeader>
            <CardTitle>Docker Deployment</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <p className="font-semibold mb-1">Build Process</p>
              <p className="text-muted-foreground text-xs">
                Multi-stage Dockerfile: <strong>deps</strong> (npm ci + prisma generate via postinstall) → <strong>builder</strong> (prisma generate + next build + compile seed.ts → prisma/dist/seed.js) → <strong>runner</strong> (standalone output, non-root <code className="bg-muted px-1 rounded">nextjs</code> user, port <strong>8080</strong>).
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Startup (docker-entrypoint.sh)</p>
              <p className="text-muted-foreground text-xs">
                On every container start: runs <code className="bg-muted px-1 rounded">prisma db push --skip-generate --accept-data-loss</code> to sync schema, then seeds the admin/demo users if not present, then <code className="bg-muted px-1 rounded">exec node server.js</code>.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Spaceship Hyperlift</p>
              <p className="text-muted-foreground text-xs mb-1">
                Production runs on Spaceship Starlight Hyperlift (pure Docker PaaS). All env vars are set in the Hyperlift dashboard — no docker-compose in production.
              </p>
              <p className="text-muted-foreground text-xs">
                Domain: <code className="bg-muted px-1 rounded">mybudget.apphouse.app</code> · Set <code className="bg-muted px-1 rounded">NEXTAUTH_URL=https://mybudget.apphouse.app</code>
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Local Dev Commands</p>
              <div className="bg-muted rounded-lg p-3 font-mono text-xs space-y-1">
                <p># Build and start (port 8080)</p>
                <p>docker compose up -d --build</p>
                <p className="pt-1"># Tail logs</p>
                <p>docker compose logs -f app</p>
                <p className="pt-1"># Full reset (drops DB volume)</p>
                <p>docker compose down -v &amp;&amp; docker compose up -d --build</p>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1">Security Headers</p>
              <p className="text-muted-foreground text-xs">
                Configured in <code className="bg-muted px-1 rounded">next.config.ts</code>: X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin), Permissions-Policy (camera/mic/geo disabled), Content-Security-Policy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cloud Readiness */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Cloud Readiness Notes
              <Badge variant="outline">Audit</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">Rate Limiting: In-Memory</p>
              <p className="text-muted-foreground text-xs">
                <code className="bg-muted px-1 rounded">lib/rate-limit.ts</code> uses an in-memory Map. Works for single-instance Docker but does not persist across restarts or replicas. For multi-instance deployments, replace with Redis or Upstash.
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-semibold mb-1">JWT Sessions — Stateless</p>
              <p className="text-muted-foreground text-xs">
                No server-side session store. Compatible with horizontal scaling. Session max age: 30 days. Token refresh triggered on <code className="bg-muted px-1 rounded">trigger === &quot;update&quot;</code> (e.g. after team invite accept or email verification).
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-semibold mb-1">File System — None</p>
              <p className="text-muted-foreground text-xs">
                No file system writes in application code. All persistence is via PostgreSQL. Safe for read-only containers.
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-semibold mb-1">Server Actions Origin</p>
              <p className="text-muted-foreground text-xs">
                <code className="bg-muted px-1 rounded">allowedOrigins</code> in <code className="bg-muted px-1 rounded">next.config.ts</code> is derived from <code className="bg-muted px-1 rounded">NEXTAUTH_URL</code>. Must match the production domain exactly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* API Routes */}
        <Card>
          <CardHeader>
            <CardTitle>API Routes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">Route</th>
                  <th className="text-left py-2 font-semibold">Method</th>
                  <th className="text-left py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-1.5 font-mono">/api/auth/[...nextauth]</td>
                  <td className="py-1.5">GET/POST</td>
                  <td className="py-1.5">Auth.js handler (login, session, callbacks)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 font-mono">/api/export</td>
                  <td className="py-1.5">GET</td>
                  <td className="py-1.5">Export expenses/income as Excel, CSV, or PDF with filters</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono">/api/export-template</td>
                  <td className="py-1.5">GET</td>
                  <td className="py-1.5">Download import template (Excel with valid categories listed)</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Testing</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="text-muted-foreground text-xs">
              Unit tests use Jest + ts-jest. Run with <code className="bg-muted px-1 rounded">npx jest --passWithNoTests</code>.
            </p>
            <p className="text-muted-foreground text-xs">
              Test suites cover: Zod validation schemas, utility functions, category constants, in-memory rate limiter, export formatting helpers, and <code className="bg-muted px-1 rounded">buildOwnerFilter()</code> data scoping logic.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
