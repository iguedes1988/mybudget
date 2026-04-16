# LocalBudget 💰

A beautiful, private, self-hosted personal finance tracker — built with Next.js 15, Prisma, and PostgreSQL. All data stays on your machine.

## Features

- **Multi-user** with role-based access (User / Admin)
- **Full CRUD** expense tracking (Date, Category, Vendor, Amount, Notes)
- **Dashboard** with YTD totals, monthly trends, category breakdown charts
- **Monthly/Yearly Reports** matching your Excel spreadsheet workflow
- **Import** from Excel/CSV with auto column mapping
- **Export** to Excel (monthly sheets) or CSV
- **Dark/Light mode** — responsive on all devices
- **Admin panel** — user management, system-wide stats, data for any user
- **First registered user** becomes Admin automatically

---

## Quick Start (Docker — Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Clone / Download the project

```bash
git clone <repo-url> localbudget
cd localbudget
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set a strong `NEXTAUTH_SECRET`:

```bash
# Generate a secret:
openssl rand -base64 32
```

Minimum required changes in `.env`:
```
NEXTAUTH_SECRET="paste-your-generated-secret-here"
ADMIN_EMAIL="your-admin@email.com"
ADMIN_PASSWORD="YourStrongPassword1"
```

### 3. Start everything

```bash
docker compose up --build -d
```

This will:
1. Start a PostgreSQL 16 database
2. Build and start the Next.js app
3. Run database migrations automatically
4. Seed the database with the admin user and demo data

### 4. Open LocalBudget

Visit [http://localhost:3000](http://localhost:3000)

**Default credentials:**
| Role  | Email                          | Password      |
|-------|-------------------------------|---------------|
| Admin | admin@localbudget.local        | Admin@123456  |
| Demo  | demo@localbudget.local         | Demo@123456   |

> ⚠️ Change these immediately via Admin → User Management!

---

## Manual Setup (Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your PostgreSQL connection:
```
DATABASE_URL="postgresql://username:password@localhost:5432/localbudget"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set up database

```bash
# Create database & run migrations
npm run db:migrate

# Seed with default users and sample data
npm run db:seed
```

### 4. Start development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Docker Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f app

# Database shell
docker compose exec postgres psql -U localbudget -d localbudget

# Prisma Studio (DB GUI) — run from host with DATABASE_URL set
npx prisma studio

# Rebuild after code changes
docker compose up --build -d

# Full reset (WARNING: deletes all data)
docker compose down -v
docker compose up --build -d
```

---

## Project Structure

```
localbudget/
├── app/
│   ├── (auth)/              # Login & Register pages
│   ├── (dashboard)/         # Protected app pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── expenses/        # Expense CRUD
│   │   ├── reports/         # Monthly/yearly reports
│   │   ├── import/          # Import/Export
│   │   └── admin/           # Admin panel
│   └── api/
│       ├── auth/            # NextAuth handler
│       └── export/          # Excel/CSV export
├── actions/                 # Server Actions (mutations)
├── components/
│   ├── ui/                  # shadcn/ui base components
│   ├── auth/                # Login/Register forms
│   ├── dashboard/           # Dashboard widgets
│   ├── expenses/            # Expense table, form, filters
│   ├── reports/             # Report charts & tables
│   ├── import/              # Import wizard
│   ├── admin/               # Admin components
│   └── layout/              # Sidebar, Header
├── lib/
│   ├── auth.ts              # NextAuth v5 config
│   ├── db.ts                # Prisma client
│   ├── utils.ts             # Helpers (formatCurrency, etc.)
│   ├── constants.ts         # Categories, colors
│   └── validations.ts       # Zod schemas
├── prisma/
│   ├── schema.prisma        # Database models
│   └── seed.ts              # Seed script
├── auth.ts                  # NextAuth config (root)
├── middleware.ts             # Route protection
├── docker-compose.yml
└── Dockerfile
```

---

## Import File Format

When importing expenses, your file must have columns that map to:

| Field    | Required | Example Values                        |
|----------|----------|---------------------------------------|
| Date     | ✅       | 2025-01-15, 01/15/2025, Jan 15 2025  |
| Category | ✅       | Housing, Groceries, Dining...         |
| Vendor   | ✅       | Whole Foods, Netflix, Landlord...     |
| Amount   | ✅       | 125.50, $125.50, 125                  |
| Notes    | ❌       | Any text                              |

The import wizard auto-detects column names and lets you remap them.

---

## Categories

Pre-configured categories (matching the 2025 US Expenses spreadsheet):

Housing · Transportation · Healthcare · Utilities · Personal Care · Personal Spendings · Groceries · Dining · Leisure · Offerings · Studies · Education · Entertainment · Travel · Insurance · Subscriptions · Clothing · Gifts · Other

---

## Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Framework     | Next.js 15 (App Router)             |
| Language      | TypeScript                          |
| Styling       | Tailwind CSS + shadcn/ui            |
| Database      | PostgreSQL (via Docker)             |
| ORM           | Prisma                              |
| Auth          | Auth.js v5 (Credentials provider)  |
| Validation    | Zod                                 |
| Charts        | Recharts                            |
| Import/Export | xlsx                                |
| Deployment    | Docker Compose                      |

---

## Security

- All passwords hashed with bcrypt (12 rounds)
- JWT sessions with 30-day expiry
- Row-level security: users can only access their own data
- Admin-only routes protected in middleware
- Server Actions validate all inputs with Zod
- Suspended users cannot log in

---

## Backup

Your data lives in the `postgres_data` Docker volume. To back it up:

```bash
docker compose exec postgres pg_dump -U localbudget localbudget > backup-$(date +%Y%m%d).sql
```

To restore:
```bash
cat backup-20250101.sql | docker compose exec -T postgres psql -U localbudget -d localbudget
```
