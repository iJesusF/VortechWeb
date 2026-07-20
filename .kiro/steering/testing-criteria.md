# Testing Criteria

## Testing Stack
- **Unit tests**: Vitest
- **Component tests**: Vitest + React Testing Library
- **Integration tests**: Vitest with Supabase mocks

## What to Test
1. WhatsApp URL generation (encoding, format, optional fields)
2. Data validation schemas (Zod)
3. Image file validation (type, size)
4. Slug generation utility
5. Price display logic (price_mode variants)
6. Authorization middleware behavior
7. CRUD operations (with mocked Supabase)
8. RLS policy verification (SQL-level)

## Conventions
- Test files alongside source: `*.test.ts` or `*.test.tsx`
- Use descriptive test names in Spanish when testing user-facing features
- Mock external services (Supabase) at the module level
- Prefer `--run` flag for CI (no watch mode)

## Quality Gates
- `npm run build` must succeed
- `npm run lint` must pass
- `npm run typecheck` must pass
- All tests must pass
