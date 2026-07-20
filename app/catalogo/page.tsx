import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CatalogGrid } from "@/components/catalog/catalog-grid";
import { Header } from "@/components/header";
import type { ProductFull } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Catálogo de Productos",
  description:
    "Explora el catálogo de productos VORTECH: sistemas de automatización, control industrial, tratamiento de agua y más.",
  openGraph: {
    title: "Catálogo de Productos | VORTECH",
    description:
      "Productos de automatización industrial, PLC, tratamiento de agua y medición de utilities.",
    type: "website",
  },
};

export const revalidate = 60;

export default async function CatalogoPage() {
  const supabase = await createServerSupabaseClient();

  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from("products")
      .select(
        `
        *,
        categories(*),
        product_images(*)
      `
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  const products = (productsRes.data ?? []) as ProductFull[];
  const categories = categoriesRes.data ?? [];

  // Sort product_images by sort_order within each product
  const productsWithSortedImages = products.map((p) => ({
    ...p,
    product_images: [...p.product_images].sort((a, b) => a.sort_order - b.sort_order),
  }));

  return (
    <>
      <Header />
      <main className="pt-28 pb-20">
        <div className="container-shell">
          <div className="mb-10">
            <span className="section-eyebrow">Catálogo</span>
            <h1 className="section-title mt-0">
              Productos y soluciones industriales
            </h1>
            <p className="section-copy mt-4">
              Equipos y sistemas para automatización, control, tratamiento de agua y medición de utilities.
              Consulta disponibilidad y precio directo por WhatsApp.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] py-24 text-center">
              <div className="mb-4 text-5xl" aria-hidden="true">⚙️</div>
              <h2 className="text-xl font-semibold text-white">Catálogo en preparación</h2>
              <p className="mt-3 max-w-md text-sm text-slate-400">
                Pronto tendremos disponible nuestro catálogo completo. Mientras tanto, escríbenos
                directamente para conocer nuestra oferta de productos.
              </p>
              <a
                href={`mailto:ventas@vortech.mx`}
                className="cta-button mt-6 bg-cyanx text-slate-950 shadow-glow hover:bg-white"
              >
                Contactar a VORTECH
              </a>
            </div>
          ) : (
            <CatalogGrid products={productsWithSortedImages} categories={categories} />
          )}
        </div>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="container-shell text-center text-sm text-slate-500">
          <Link href="/" className="hover:text-cyanx">← Regresar al sitio principal</Link>
        </div>
      </footer>
    </>
  );
}
