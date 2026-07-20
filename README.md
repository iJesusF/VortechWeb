# VORTECH Web – Catálogo de Productos

Sitio corporativo de INTEGRA Controls & Water Systems con catálogo administrable de productos.

**No es una tienda en línea.** No incluye carrito, checkout, pagos ni cuentas de clientes.

## Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript (strict) |
| UI | React 19, Tailwind CSS 3.4 |
| Animaciones | Framer Motion 12 |
| Iconos | Lucide React |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Almacenamiento | Supabase Storage |
| Despliegue | Vercel |
| Testing | Vitest |

## Variables de Entorno Requeridas

Crea un archivo `.env.local` basado en `.env.example`:

```env
# Supabase (obligatorio)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# WhatsApp (formato internacional sin signo +)
NEXT_PUBLIC_WHATSAPP_NUMBER=521234567890

# Tamaño máximo de imagen en bytes (default: 5MB)
NEXT_PUBLIC_MAX_IMAGE_SIZE=5242880
```

## Configuración Inicial

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto.
2. Copia la **URL** y la **anon key** desde Settings > API.
3. Pégalas en tu `.env.local`.

### 2. Ejecutar migraciones

Ejecuta las migraciones SQL en orden desde el SQL Editor de Supabase:

```
supabase/migrations/001_categories.sql
supabase/migrations/002_products.sql
supabase/migrations/003_product_images.sql
supabase/migrations/005_updated_at_trigger.sql
```

### 3. Configurar Storage

1. En Supabase Dashboard → Storage, crea un bucket llamado **`product-images`**.
2. Marca el bucket como **público**.
3. Agrega las siguientes políticas al bucket:
   - **Public read access** (SELECT) para `anon` y `authenticated`
   - **Authenticated upload** (INSERT) para `authenticated`
   - **Authenticated update** (UPDATE) para `authenticated`
   - **Authenticated delete** (DELETE) para `authenticated`

### 4. Crear el primer administrador

1. En Supabase Dashboard → Authentication → Users, haz clic en **"Add user"** > **"Create new user"**.
2. Ingresa el correo del administrador y una contraseña segura.
3. Confirma el usuario (marca "Auto Confirm User" o envía email de confirmación).

> **Importante:** No existe registro público. Los administradores solo pueden ser creados manualmente desde el dashboard de Supabase.

### 5. Configurar WhatsApp

Cambia `NEXT_PUBLIC_WHATSAPP_NUMBER` al número de WhatsApp en formato internacional sin el signo `+`.

Ejemplo: Para +52 1 55 1234 5678 → `5215512345678`

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Ejecutar tests
npm test

# Verificar tipos
npm run typecheck

# Lint
npm run lint

# Build de producción
npm run build
```

## Estructura del Proyecto

```
app/
├── page.tsx                         # Landing page principal
├── catalogo/
│   ├── page.tsx                     # Catálogo público
│   └── [slug]/page.tsx             # Detalle de producto
├── admin/
│   ├── login/page.tsx              # Login admin
│   ├── page.tsx                     # Dashboard
│   ├── productos/
│   │   ├── page.tsx                # Lista de productos
│   │   ├── nuevo/page.tsx          # Crear producto
│   │   └── [id]/editar/page.tsx    # Editar producto
│   └── categorias/page.tsx         # Gestión de categorías
components/
├── catalog/                         # Componentes del catálogo público
├── admin/                           # Componentes del panel admin
├── header.tsx                       # Navegación principal
├── motion.tsx                       # Wrapper de animaciones
└── technical-visual.tsx            # Visual del hero
lib/
├── supabase/                        # Cliente Supabase (server + browser)
├── types/database.ts               # Tipos TypeScript
├── utils.ts                         # Utilidades (slug, validación, etc.)
├── whatsapp.ts                     # Generador de URL WhatsApp
└── site-config.ts                  # Configuración del sitio
supabase/
└── migrations/                      # Migraciones SQL versionadas
__tests__/                           # Tests unitarios
middleware.ts                        # Protección de rutas /admin
```

## Despliegue en Vercel

1. Conecta el repositorio desde [vercel.com](https://vercel.com).
2. Configura las variables de entorno en Settings > Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - `NEXT_PUBLIC_MAX_IMAGE_SIZE`
3. Deploy. El framework se detecta automáticamente como Next.js.

## Rutas

### Públicas
| Ruta | Descripción |
|---|---|
| `/` | Landing page |
| `/catalogo` | Catálogo de productos |
| `/catalogo/[slug]` | Detalle de producto |

### Admin (protegidas)
| Ruta | Descripción |
|---|---|
| `/admin/login` | Inicio de sesión |
| `/admin` | Dashboard |
| `/admin/productos` | Lista de productos |
| `/admin/productos/nuevo` | Crear producto |
| `/admin/productos/[id]/editar` | Editar producto |
| `/admin/categorias` | Gestión de categorías |

## Seguridad

- **Row Level Security (RLS)**: Las tablas tienen políticas que solo permiten lectura pública de registros activos.
- **Middleware**: Las rutas `/admin/*` requieren sesión autenticada.
- **Sin registro público**: Los administradores se crean exclusivamente desde Supabase Dashboard.
- **Validación de archivos**: Solo se aceptan imágenes JPG, PNG, WebP y AVIF con tamaño configurable.
- **Storage policies**: Solo usuarios autenticados pueden subir/modificar/eliminar archivos.

## Funcionalidades del Catálogo

- Cuadrícula responsive de productos con imagen, nombre, categoría y precio
- Búsqueda por nombre, SKU y descripción
- Filtro por categoría
- Galería de imágenes por producto
- Especificaciones técnicas
- Productos relacionados
- Botón de consulta por WhatsApp (click-to-chat)
- SEO metadata y Open Graph por producto

## Panel de Administración

- Dashboard con estadísticas
- CRUD completo de productos (crear, editar, duplicar, eliminar)
- Gestión de imágenes (subir, reordenar, portada, alt text, eliminar)
- Gestión de categorías (crear, editar, reordenar, activar/desactivar)
- Activar/desactivar productos
- Marcar como destacado
- Validaciones y confirmaciones

## Decisiones Técnicas

1. **Supabase sin generic types en cliente**: Se usan assertions de tipo en vez del genérico `Database` para compatibilidad con Supabase JS v2, evitando inferencia de `never` en mutations.
2. **Server Components para catálogo**: Las páginas públicas se renderizan del lado del servidor para SEO.
3. **Client Components para admin**: El panel usa client components para interactividad sin complicar la arquitectura.
4. **Middleware para auth**: Protección server-side de rutas admin antes de que lleguen al componente.
5. **Sin service_role key en frontend**: Solo se usa la anon key públicamente.
6. **Storage público con write protegido**: Las imágenes son leídas públicamente, pero solo admins pueden modificarlas.

## Riesgos y Tareas Manuales

- [ ] Configurar las variables de entorno en Supabase y Vercel antes del primer deploy
- [ ] Ejecutar las migraciones SQL manualmente en el SQL Editor de Supabase
- [ ] Crear el bucket `product-images` manualmente en Supabase Storage
- [ ] Crear el primer usuario administrador desde Supabase Auth Dashboard
- [ ] Configurar las políticas de storage manualmente en el dashboard
- [ ] Reemplazar el número de WhatsApp placeholder con el número real
- [ ] Personalizar el correo del administrador autorizado
