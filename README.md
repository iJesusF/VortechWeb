# INTEGRA Controls & Water Systems

Landing page corporativa para una empresa contratista especializada en automatización, control industrial, tratamiento de agua y medición de utilities.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React icons
- Preparado para despliegue en Vercel

## Correr localmente

```bash
npm install
npm run dev
```

Luego abre `http://localhost:3000`.

## Checks recomendados

```bash
npm run typecheck
npm run lint
npm run build
```

## Subir a GitHub

```bash
git init
git add .
git commit -m "Initial INTEGRA landing page"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

Si el repositorio ya existe localmente, solo configura el remote y ejecuta el push.

## Desplegar en Vercel

1. Entra a https://vercel.com y selecciona **Add New Project**.
2. Importa el repositorio de GitHub.
3. Vercel detectará Next.js automáticamente.
4. Usa los valores por defecto:
   - Build command: `next build`
   - Output: gestionado por Next.js
5. Haz clic en **Deploy**.

## Próximos pasos recomendados

- Reemplazar placeholders de contacto por datos reales.
- Conectar el formulario a una API route con Resend, EmailJS u otro proveedor.
- Añadir analítica, eventos de conversión y seguimiento de CTA.
- Ajustar copy según casos de éxito, industrias objetivo y certificaciones.
- Incorporar fotografías reales de tableros, skid de tratamiento o proyectos ejecutados si están disponibles.
