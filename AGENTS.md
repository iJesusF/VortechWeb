# AGENTS.md — VORTECH Development Conventions

## Project Overview
VORTECH is a corporate website for an industrial automation, water treatment, and utilities integration company. It includes a product catalog, quotation request system, and admin panel.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.4 with custom design tokens
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Validation**: Zod
- **PDF**: PDFKit
- **Testing**: Vitest + Testing Library
- **Deploy**: Vercel

## Architecture
- App Router with file-based routing
- Server Components by default; `"use client"` only when needed
- API Routes for server-side operations (e.g., PDF generation, webhooks)
- Supabase client (`createBrowserClient`) for client components
- Supabase server client (`createServerClient`) for server components/routes
- Service role client only in API routes, never exposed to browser

## Code Conventions
- Path alias: `@/*` maps to project root
- Barrel exports for related modules
- Zod schemas colocated with types
- Domain logic in `lib/` (pure functions, no framework deps)
- UI components in `components/`
- Page-specific components in route folders
- Database types auto-generated or manually maintained in `lib/types/database.ts`

## Design System
- Colors: graphite (#070b12), navy (#071a33), cyanx (#13d8ff), steel (#9fb3c8)
- Dark theme only
- Glass panel style: `border border-white/10 bg-white/[0.055] backdrop-blur-xl`
- CTA buttons: rounded-full with cyanx accent
- Typography: Inter font family
- Mobile-first responsive design

## Naming
- Files: kebab-case
- Components: PascalCase
- Functions/variables: camelCase
- Database columns: snake_case
- Routes: lowercase with hyphens

## Security Rules
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- All public inputs validated with Zod
- RLS policies on all tables
- Tokens: cryptographically random, non-sequential
- No PII in logs or error messages
- Rate limiting on public API endpoints

## Git
- Conventional commits
- Feature branches from main
- No force pushes to main
- No destructive migrations without explicit authorization

## Testing
- Unit tests for calculation logic
- Integration tests for API routes
- Component tests for critical UI flows
- `vitest run` for CI, `vitest` for watch mode
