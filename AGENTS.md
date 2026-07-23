# VORTECH Web conventions

- Keep the existing Next.js App Router, TypeScript strict mode, Tailwind, and visual language intact.
- Use `@/` imports and server components by default; mark components as client-only only when browser state or events require it.
- Do not place secrets in source. Keep server-only Supabase configuration in server modules and document environment variables in `.env.example`.
- Database changes must be additive, versioned SQL migrations in `supabase/migrations`, with RLS enabled and explicit policies.
- Preserve the public catalogue and use quotation terminology rather than e-commerce terminology.
- Run `npm run typecheck`, `npm run lint`, and `npm run build` before delivery when the environment permits.
