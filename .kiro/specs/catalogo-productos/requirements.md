# Feature: Catálogo de Productos Administrable

## Overview
Add an administrable product catalog to the existing VORTECH website. This is NOT an e-commerce store - it's a product showcase with WhatsApp-based price inquiries.

## Functional Requirements

### FR-1: Public Product Catalog
- Display products in a responsive grid at `/catalogo`
- Show product image, name, category, short description
- Filter by category
- Search by name, SKU, and description
- Show skeleton loading states
- Show empty states when no results
- Only display active products and categories

### FR-2: Product Detail Page
- Individual product pages at `/catalogo/[slug]`
- Show full gallery, description, specifications
- Show related products from same category
- Display price based on `price_mode`
- SEO metadata and Open Graph tags per product

### FR-3: WhatsApp Integration
- Click-to-chat button on every product page
- Pre-filled message with product name, SKU, URL
- Opens in new tab with `rel="noopener noreferrer"`
- Custom message override per product (admin-configurable)
- WhatsApp number stored in environment variable

### FR-4: Admin Authentication
- Login page at `/admin/login`
- Supabase Auth email/password
- No public registration
- Protected `/admin/*` routes via middleware
- Session-based authentication

### FR-5: Admin Dashboard
- Statistics: total/active/hidden/featured products, categories
- Recently modified products

### FR-6: Product Management
- Create, edit, duplicate, delete products
- Toggle active/featured status
- Auto-generate editable slugs
- Rich text or markdown description
- Structured specifications (JSON)
- Image management (upload, reorder, cover, alt text, delete)
- Form validation and error handling
- Prevent double-submission

### FR-7: Category Management
- Create, edit, activate/deactivate categories
- Reorder categories
- Prevent deletion of categories with products (or require reassignment)

### FR-8: Database & Security
- Supabase PostgreSQL with migrations
- Row Level Security policies
- Anonymous: read active records only
- Authenticated admin: full CRUD
- File upload validation (type, size, unique names)

## Non-Functional Requirements

### NFR-1: Performance
- Lazy loading for images
- No N+1 queries
- Server-side rendering where appropriate
- Image optimization

### NFR-2: SEO
- Friendly URLs with slugs
- Proper metadata per page
- Open Graph tags

### NFR-3: Accessibility
- Keyboard navigation
- Alt text for images
- ARIA labels where needed

### NFR-4: Compatibility
- Mobile-first design
- Works on desktop, tablet, mobile
- Admin usable on desktop and tablet

### NFR-5: Visual Consistency
- Match existing VORTECH dark theme
- Use existing color palette (graphite, navy, cyanx, steel)
- Maintain glass-panel, shadow-glow patterns
- Professional, technical, industrial aesthetic
