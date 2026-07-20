# Design: Catálogo de Productos

## Architecture

### Data Layer
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth (email/password for admins)
- **Storage**: Supabase Storage (product images bucket)
- **Client**: @supabase/ssr for Next.js App Router integration

### Tables
1. `categories` - Product categories with slug, sort_order, active status
2. `products` - Full product data with FK to categories
3. `product_images` - Images linked to products with ordering

### Security Model
- RLS policies on all tables
- Anonymous: SELECT where `is_active = true`
- Authenticated: Full CRUD (admin role check via auth.uid())
- Storage: Public read for product-images bucket, authenticated write

## Route Structure

### Public Routes
- `/catalogo` - Product grid with filters
- `/catalogo/[slug]` - Product detail page

### Admin Routes (Protected)
- `/admin/login` - Authentication
- `/admin` - Dashboard
- `/admin/productos` - Product list
- `/admin/productos/nuevo` - Create product
- `/admin/productos/[id]/editar` - Edit product
- `/admin/categorias` - Category management

## Component Architecture

### Public Components
- `CatalogGrid` - Responsive product grid
- `ProductCard` - Individual product card
- `ProductGallery` - Image gallery with cover
- `ProductSpecs` - Specifications table
- `CategoryFilter` - Category filter chips
- `SearchBar` - Search input
- `WhatsAppButton` - Click-to-chat CTA
- `PriceDisplay` - Price rendering by mode
- `CatalogSkeleton` - Loading state

### Admin Components
- `AdminLayout` - Sidebar + content layout
- `AdminNav` - Navigation sidebar
- `ProductForm` - Create/edit product form
- `CategoryForm` - Create/edit category form
- `ImageUploader` - Multi-image upload with preview
- `ImageSortable` - Drag-to-reorder images
- `DataTable` - Reusable admin table
- `ConfirmDialog` - Destructive action confirmation
- `StatsCard` - Dashboard metric card

## Key Libraries
- `@supabase/supabase-js` - Database client
- `@supabase/ssr` - Next.js SSR integration
- `zod` - Schema validation
- `react-hot-toast` - Notifications (lightweight)

## WhatsApp Integration
- URL format: `https://wa.me/{number}?text={encodedMessage}`
- Default message template includes product name, SKU (if exists), and full URL
- Admin can override message per product
- Number from `NEXT_PUBLIC_WHATSAPP_NUMBER` env var

## Image Strategy
- Upload to Supabase Storage `product-images` bucket
- Store path and generate public URL
- Next.js Image component for optimization
- Unique filenames: `{productId}/{uuid}.{ext}`
- Max 5MB per file
- Accepted: jpg, png, webp, avif

## Migration Strategy
- Versioned SQL files in `/supabase/migrations/`
- Each migration is idempotent where possible
- RLS policies included in migrations
- Storage bucket creation in migrations
