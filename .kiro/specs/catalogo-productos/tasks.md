# Tasks: Catálogo de Productos

## Phase 1: Infrastructure
- [x] Task 1: Install dependencies (@supabase/supabase-js, @supabase/ssr, zod, vitest, etc.)
- [x] Task 2: Create Supabase client utilities (browser, server, middleware)
- [x] Task 3: Create database migrations (categories, products, product_images, RLS, storage)
- [x] Task 4: Create TypeScript types for database schema
- [x] Task 5: Create .env.example with all required variables

## Phase 2: Authentication & Admin Shell
- [x] Task 6: Implement admin login page
- [x] Task 7: Create auth middleware for /admin routes
- [x] Task 8: Create admin layout (sidebar, navigation)
- [x] Task 9: Implement admin dashboard with stats

## Phase 3: Category Management
- [x] Task 10: Category CRUD (create, edit, toggle active, reorder)
- [x] Task 11: Category deletion with product check

## Phase 4: Product Management
- [x] Task 12: Product list page with search, filters, pagination
- [x] Task 13: Product create form (all fields, validation)
- [x] Task 14: Product edit form with existing data
- [x] Task 15: Product duplicate, activate/deactivate, delete

## Phase 5: Image Management
- [x] Task 16: Image upload with validation and progress
- [x] Task 17: Image reorder, cover selection, alt text editing
- [x] Task 18: Image deletion (storage + database)

## Phase 6: Public Catalog
- [x] Task 19: Catalog grid page (/catalogo) with filters and search
- [x] Task 20: Product detail page (/catalogo/[slug])
- [x] Task 21: WhatsApp click-to-chat button
- [x] Task 22: SEO metadata and Open Graph tags
- [x] Task 23: Add Catálogo to navigation

## Phase 7: Quality
- [x] Task 24: Write unit tests (WhatsApp URL, validation, slug generation)
- [x] Task 25: Write integration tests (CRUD operations, auth)
- [x] Task 26: Run build, lint, typecheck - fix all issues
- [x] Task 27: Update README with setup instructions
