# Plan de implementación de catálogo y cotizaciones VORTECH

## Auditoría inicial (2026-07-23)

- **Framework/router:** Next.js 15.2 con App Router y React 19; el proyecto usa TypeScript 5.8 en modo `strict`.
- **Estilos:** Tailwind CSS 3 y CSS global con el lenguaje azul oscuro/cyan actual. Las animaciones son Framer Motion y los iconos Lucide.
- **Rutas actuales:** únicamente `/`; no había catálogo, productos, panel administrativo, rutas API ni ruta pública de cotización.
- **Navegación:** `components/header.tsx` sólo mostraba enlaces de ancla de escritorio. No había menú móvil y sus `href` relativos no funcionaban al salir de la portada. Los IDs existentes eran `inicio`, `arquitectura`, `servicios`, `soluciones`, `proceso`, `tecnologia` y `proyectos`; tampoco existía `contacto`.
- **Datos/Supabase/autenticación/almacenamiento:** no había cliente Supabase, variables de entorno, migraciones, políticas RLS, almacenamiento ni autenticación. Por ello, se agregará una base Supabase opcional y no se ejecutará ninguna migración ni despliegue.
- **Catálogo/PDF/formularios:** no existían tablas ni componentes del catálogo, librerías de formularios/validación o PDF. Se implementará un catálogo local inicial, validación del lado servidor y un contrato de PDF/infraestructura preparado para un renderer compatible sin Chromium.
- **SSR, caché y despliegue:** las páginas eran Server Components estáticas por defecto, sin configuración de caché/revalidación personalizada. `next.config.ts` es el predeterminado con `reactStrictMode`; el README documenta Vercel sin `vercel.json`.
- **Calidad:** no había pruebas ni comando `test`. Los checks existentes son `typecheck`, `lint` y `build`; el script `lint` heredado usa `next lint`, que Next 15 ya no expone.

## Problemas y diseño propuesto

1. Centralizar enlaces del sitio en una configuración tipada con URLs absolutas de ruta (`/#seccion`), compartida por escritorio, móvil, catálogo y cotizaciones.
2. Añadir catálogo no transaccional y una solicitud persistida localmente. La solicitud formal llama a una ruta API validada que usa Supabase sólo en servidor; si no está configurado devuelve una explicación segura, sin perder el carrito.
3. Añadir migración aditiva con clientes, solicitudes, cotizaciones, partidas, eventos, métodos/sesiones de pago y documentos fiscales; todas las tablas nuevas tendrán RLS y políticas públicas mínimas para solicitudes.
4. Añadir dominio de cálculo entero (centavos) y adaptadores tipados de pago/facturación, con mocks explícitos. PayPal, Factura.com y Konta no se conectarán sin documentación y credenciales vigentes.
5. Crear rutas administrativas protegibles mediante la sesión Supabase existente cuando se configure. La protección efectiva dependerá de los roles de `admin_users` incluidos en la migración.

## Migraciones requeridas

- `202607230001_quotation_system.sql`: extensiones, tablas, restricciones, índices, triggers de `updated_at`, funciones de numeración/tokens, RLS y políticas. Es aditiva y no elimina ni altera tablas de catálogo existentes.

## Riesgos y dependencias

- No hay proyecto/credenciales de Supabase ni datos de catálogo en el repositorio; las rutas que necesitan persistencia quedarán preparadas y mostrarán un estado de configuración hasta aplicar la migración y definir variables.
- Los datos fiscales, banco, logo definitivo, cuentas PayPal y proveedor CFDI deben ser introducidos por un administrador; nunca se infieren ni se incluyen secretos.
- La generación final de PDF requiere elegir/configurar un renderer y datos de empresa. La arquitectura conserva una única fuente de cálculos.

## Fases

1. Documentación, configuración común y navegación accesible.
2. Catálogo, carrito de solicitud, WhatsApp y API de solicitud validada.
3. Migración/RLS, clientes, cotizaciones, dominio de cálculos y adaptadores.
4. Rutas administrativas, página pública y preparación de PDF/pagos/facturación.
5. Pruebas unitarias/regresión, revisión visual, lint, tipos y build.

## Criterios de aceptación

- El menú móvil contiene todas las secciones y catálogo, se controla por teclado, bloquea el scroll y emplea enlaces que funcionan desde cualquier ruta.
- La solicitud no es checkout, persiste localmente, incluye snapshot/WhatsApp y nunca compromete precio o disponibilidad.
- Las entidades nuevas son aditivas, con RLS y sin secretos en cliente.
- Las fórmulas se centralizan en un módulo tipado de centavos y se cubren con pruebas.
- Las integraciones externas quedan deshabilitadas hasta que existan variables/documentación oficiales.
