# VORTECH Web

Corporate website + product catalog for VORTECH — industrial automation, water treatment, and building control systems integrator based in Baja California, Mexico.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS 3** with custom dark theme
- **Framer Motion** for animations
- **Supabase** — PostgreSQL, Auth, Storage, RLS
- **Zod** — schema validation
- **Vitest** — unit + integration tests
- **Vercel** — deployment

---

## Required Environment Variables

Create `.env.local` at the project root with the following values:

```env
# Supabase — find these in your Supabase project settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # Server-only, NEVER expose to client

# WhatsApp click-to-chat (international format, no + sign)
NEXT_PUBLIC_WHATSAPP_NUMBER=526861455822

# Production URL (used for WhatsApp message links)
NEXT_PUBLIC_SITE_URL=https://vortech.mx
```

See `.env.example` for the complete template (no real secrets).

---

## Local Development

### Prerequisites

- Node.js 20+
- npm
- A Supabase project (free tier works)

### Setup

```bash
# 1. Clone and install
git clone https://github.com/iJesusF/VortechWeb.git
cd VortechWeb
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Run database migrations (see Database Setup below)

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Setup (Supabase)

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → New Project.

### 2. Run Migration 001

In the Supabase dashboard → **SQL Editor**, paste and run the contents of:

```
supabase/migrations/001_create_catalog_tables.sql
```

This creates:
- `categories` table
- `products` table
- `product_images` table
- Indexes and foreign keys
- Row Level Security policies

### 3. Run Migration 002 (Storage)

In the same SQL Editor, run:

```
supabase/migrations/002_storage_policies.sql
```

This creates the `product-images` storage bucket with public read access and authenticated write/delete.

> **Alternative for storage:** Go to Supabase Dashboard → Storage → New bucket → name it `product-images`, set it to **Public**. Then add the storage policies from the migration file manually.

### 4. Verify

In Supabase → Table Editor, you should see `categories`, `products`, and `product_images` tables.

---

## Creating the First Administrator

Supabase Auth is used for admin login. There is **no public registration**.

### Option A: Supabase Dashboard (recommended)

1. Go to your Supabase project → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter the admin email and a secure password
4. Click **Create user**

### Option B: SQL (service role only)

```sql
-- Run in Supabase SQL Editor with service role
SELECT auth.create_user(
  '{"email": "admin@vortech.mx", "password": "your-secure-password", "email_confirm": true}'
);
```

### Logging in

Navigate to `/admin/login` and use the credentials you created.

---

## Storage Configuration

The `product-images` bucket should be:
- **Public** (images served with public URLs)
- **Max file size**: 5 MB
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `image/avif`

These are set automatically by Migration 002. If setting up manually:

1. Supabase Dashboard → **Storage** → **product-images bucket** → **Configuration**
2. Set file size limit to `5242880` bytes (5 MB)
3. Set allowed MIME types

---

## Deployment on Vercel

### 1. Connect repository

Import the GitHub repo at [vercel.com/new](https://vercel.com/new).

### 2. Configure environment variables

In Vercel project settings → **Environment Variables**, add:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Production, Preview, Development |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `526861455822` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://vortech.mx` | Production |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` is sensitive. Never expose it on the client side.

### 3. Deploy

Push to `main` branch triggers automatic deployment.

---

## Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript type checking
npm run test         # Run tests (single pass)
npm run test:watch   # Run tests in watch mode
```

---

## Route Overview

### Public

| Route | Description |
|-------|-------------|
| `/` | Corporate landing page |
| `/catalogo` | Product catalog grid |
| `/catalogo/[slug]` | Product detail page |

### Admin (authenticated)

| Route | Description |
|-------|-------------|
| `/admin/login` | Admin login |
| `/admin` | Dashboard with stats |
| `/admin/productos` | Product list |
| `/admin/productos/nuevo` | Create product |
| `/admin/productos/[id]/editar` | Edit product + manage images |
| `/admin/categorias` | Category management |

---

## Modified Files Summary

### New files (feature/catalogo-productos)

**Infrastructure**
- `middleware.ts` — Admin route protection
- `lib/supabase/client.ts` — Browser Supabase client
- `lib/supabase/server.ts` — Server Supabase client
- `lib/supabase/middleware.ts` — Session refresh middleware
- `lib/supabase/types.ts` — TypeScript DB types
- `lib/validations/category.ts` — Zod category schema
- `lib/validations/product.ts` — Zod product schema
- `lib/utils.ts` — Slug generator, WhatsApp URL, price formatter
- `supabase/migrations/001_create_catalog_tables.sql`
- `supabase/migrations/002_storage_policies.sql`

**Admin pages**
- `app/admin/layout.tsx`
- `app/admin/page.tsx`
- `app/admin/login/page.tsx`
- `app/admin/productos/page.tsx`
- `app/admin/productos/nuevo/page.tsx`
- `app/admin/productos/[id]/editar/page.tsx`
- `app/admin/categorias/page.tsx`

**Admin components**
- `components/admin/admin-nav.tsx`
- `components/admin/stats-card.tsx`
- `components/admin/confirm-dialog.tsx`
- `components/admin/category-manager.tsx`
- `components/admin/product-list.tsx`
- `components/admin/product-form.tsx`
- `components/admin/image-manager.tsx`

**Public catalog**
- `app/catalogo/page.tsx`
- `app/catalogo/[slug]/page.tsx`
- `components/catalog/catalog-grid.tsx`
- `components/catalog/catalog-skeleton.tsx`
- `components/catalog/product-card.tsx`
- `components/catalog/product-gallery.tsx`
- `components/catalog/price-display.tsx`
- `components/catalog/whatsapp-button.tsx`
- `components/toast-provider.tsx`

**Tests**
- `lib/__tests__/utils.test.ts`
- `lib/__tests__/validations.test.ts`

### Modified files

- `app/layout.tsx` — Added ToastProvider
- `app/globals.css` — Added admin CSS utilities
- `lib/site-config.ts` — Added Catálogo nav item
- `next.config.ts` — Added Supabase image domain
- `package.json` — Added dependencies and test scripts
- `.env.example` — New file with all required vars

---

## Technical Decisions

1. **Supabase** chosen for PostgreSQL + Auth + Storage in one platform, with built-in RLS and Vercel-compatible.
2. **@supabase/ssr** used (not deprecated `@supabase/auth-helpers-nextjs`) for proper Next.js 15 App Router cookie handling.
3. **Server components** used for all data-fetching pages; client components only for interactivity (forms, filters, image upload).
4. **Slug auto-generation** from product/category name on create; editable after creation.
5. **WhatsApp** uses click-to-chat URL (`wa.me`) — no API required.
6. **Image optimization** via Next.js `<Image>` component with Supabase storage domain whitelisted.
7. **RLS** enforces authorization at the database layer; middleware adds route-level protection.
8. **`revalidate = 60`** on catalog pages for ISR — fresh data within 60 seconds without sacrificing performance.

---

## Known Manual Tasks / Risks

1. **Supabase project must be created manually** — credentials added to `.env.local` and Vercel.
2. **SQL migrations must be run manually** in Supabase SQL Editor (no Supabase CLI configured).
3. **First admin created manually** in Supabase Auth dashboard.
4. **Storage bucket** created by Migration 002; if it fails, create manually in dashboard.
5. **Custom domain** (`vortech.mx`) DNS must be configured separately in Vercel.
6. **WhatsApp number** (`NEXT_PUBLIC_WHATSAPP_NUMBER`) must be set in production env vars.
