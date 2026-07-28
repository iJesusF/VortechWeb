# VORTECH — Plan de Implementación: Sistema de Cotizaciones

## Estado Actual

| Aspecto | Estado |
|---------|--------|
| Framework | Next.js 15.2 (App Router) |
| Lenguaje | TypeScript strict |
| Estilos | Tailwind CSS 3.4 |
| Animaciones | Framer Motion 12 |
| Iconos | Lucide React |
| Router | App Router (file-based) |
| Database | **No existe** — sin Supabase |
| Auth | **No existe** |
| Catálogo | **No existe** — solo landing page |
| Admin | **No existe** |
| Tests | **No existen** — sin framework |
| PDF | **No existe** |
| Forms/Validation | **No existe** |
| Email provider | **No existe** — solo mailto: links |
| Deploy | Vercel (configurado) |
| Dominio | vortech.mx |

### Estructura Actual
```
app/
  layout.tsx       — RootLayout con metadata
  page.tsx         — Landing page completa (single page)
  globals.css      — Tailwind + custom CSS

components/
  header.tsx       — Navbar (desktop only, sin mobile menu)
  motion.tsx       — Reveal animation component
  technical-visual.tsx — Animated hero visual

lib/
  site-config.ts   — Company info + navItems
```

### Identificadores de Sección Reales
- `#inicio` — main tag id
- `#arquitectura` — Arquitectura integrada
- `#servicios` — Servicios
- `#soluciones` — Soluciones llave en mano
- `#proceso` — Timeline (dentro de sección soluciones)
- `#tecnologia` — Tecnología
- `#proyectos` — Proyectos recientes

### Problemas Encontrados
1. **No hay menú móvil** — `div.hidden.lg:flex` oculta la nav completamente en mobile.
2. **No hay catálogo** — No existe ruta /catalogo ni productos.
3. **Enlaces son anclas relativas** (`#servicios`) — No funcionan desde otras rutas.
4. **No hay enlace de WhatsApp** — Solo mailto.
5. **No hay Supabase** — Todo debe agregarse desde cero.
6. **No hay tests** — Debe instalarse framework.
7. **No hay validación** — Debe instalarse zod o similar.

## Diseño Propuesto

### Dependencias a Agregar
- `@supabase/supabase-js` + `@supabase/ssr` — Database & auth
- `zod` — Schema validation
- `pdfkit` — PDF generation (lightweight, no Chromium)
- `vitest` + `@testing-library/react` — Tests
- `nanoid` — Secure token generation

### Migraciones Requeridas
1. `001_create_catalog_tables.sql` — categories, products
2. `002_create_clients_table.sql`
3. `003_create_quote_requests.sql`
4. `004_create_quotes_tables.sql` — quotes, quote_items, quote_events
5. `005_create_payment_tables.sql` — payment_methods, payment_sessions
6. `006_create_billing_documents.sql`
7. `007_create_company_settings.sql`
8. `008_rls_policies.sql`

### Nuevas Rutas
```
/catalogo                    — Catálogo público
/catalogo/[slug]             — Producto individual
/solicitud                   — Carrito de cotización
/cotizacion/[token]          — Cotización pública
/admin                       — Dashboard
/admin/solicitudes           — Quote requests
/admin/clientes              — Clients CRUD
/admin/cotizaciones          — Quotes list
/admin/cotizaciones/nueva    — Quote builder
/admin/cotizaciones/[id]     — Quote detail/edit
/admin/configuracion/empresa — Company settings
/admin/configuracion/pagos   — Payment methods
/admin/configuracion/facturacion — Billing config
```

### Variables de Entorno Requeridas
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

### Riesgos
1. Sin Supabase project, las migraciones son scripts preparados pero no ejecutables.
2. Sin credenciales PayPal, el módulo de pagos será scaffold + mock.
3. Sin credenciales Factura.com/Konta, la facturación será solo interfaz.
4. PDFKit no soporta fuentes custom sin embed — usaremos Helvetica.

## Tareas por Fase

### Fase 2 — Navegación
- [ ] Crear MobileMenu component con sheet/drawer
- [ ] Unificar navItems para desktop y mobile
- [ ] Convertir hrefs a rutas absolutas (/#servicios)
- [ ] Agregar "Catálogo" a navItems
- [ ] Agregar "Contacto" a navItems
- [ ] Implementar scroll-to-section con router push
- [ ] Agregar ARIA, focus trap, body scroll lock
- [ ] Agregar badge de carrito

### Fase 3 — Carrito
- [ ] Crear QuoteCartProvider con localStorage
- [ ] Crear componentes de carrito
- [ ] Crear página /solicitud
- [ ] Implementar WhatsApp share
- [ ] Implementar modal de solicitud formal
- [ ] Crear API route POST /api/quote-requests

### Fase 4 — Modelo de datos
- [ ] Crear schema SQL completo
- [ ] Crear tipos TypeScript
- [ ] Crear Supabase clients
- [ ] Crear RLS policies

### Fases 5-13 — (ver requisitos detallados en prompt)

## Criterios de Aceptación
- Catálogo visible en móvil
- Navegación funcional desde todas las rutas
- Carrito persistente con WhatsApp y solicitud formal
- Admin CRUD completo para clientes y cotizaciones
- Cálculos centralizados y testeados
- PDF profesional generado server-side
- Enlaces públicos seguros con token
- Métodos de pago configurables
- RLS implementado
- Build limpio sin errores
