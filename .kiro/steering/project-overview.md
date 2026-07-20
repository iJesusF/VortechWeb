# VORTECH Web - Project Overview

## Product
VORTECH is a corporate website for an industrial automation, water treatment, and building control systems integrator based in Baja California, Mexico. The site serves as a professional landing page showcasing services, architecture, and recent projects.

## Stack
- **Framework**: Next.js 15.2 (App Router)
- **Language**: TypeScript (strict mode)
- **Runtime**: React 19
- **Styling**: Tailwind CSS 3.4 with custom theme
- **Animations**: Framer Motion 12
- **Icons**: Lucide React
- **Package Manager**: npm
- **Deployment**: Vercel
- **Database**: Supabase (PostgreSQL + Auth + Storage)

## Project Structure
```
/app          - Next.js App Router pages and layouts
/components   - Shared React components
/lib          - Utilities, configurations, Supabase clients
/supabase     - Migrations and seed data
```

## Design Conventions
- Dark theme with `graphite` (#070b12) background
- Accent color: `cyanx` (#13d8ff)
- Navy tones: `navy` (#071a33)
- Text: white headings, `slate-300` body, `slate-400` secondary
- Glass panels: `border-white/10 bg-white/[0.055] backdrop-blur-xl`
- Rounded corners: `rounded-2xl` to `rounded-[2rem]`
- Shadow glow effect: `shadow-glow` for accents
- Typography: Inter font family
- Mobile-first responsive design
- Industrial/technical aesthetic

## Component Patterns
- Use `"use client"` directive only when needed (animations, interactivity)
- Server components by default
- `Reveal` component for scroll-triggered animations
- `container-shell` class for page width constraints
- `glass-panel` class for card-like containers
- `cta-button` class for action buttons
- `section-eyebrow`, `section-title`, `section-copy` for headings

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server only)
- `NEXT_PUBLIC_WHATSAPP_NUMBER` - WhatsApp number for click-to-chat
- `NEXT_PUBLIC_SITE_URL` - Production site URL

## Deployment
- Hosted on Vercel
- Automatic deployments from main branch
- Environment variables configured in Vercel dashboard
