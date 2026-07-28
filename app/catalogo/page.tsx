import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductCard } from "@/components/catalog/product-card";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProductWithRelations } from "@/lib/types/database";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Productos y soluciones industriales VORTECH con solicitud de cotización y atención por WhatsApp.",
};
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const supabase = await createServerSupabaseClient();
  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order").order("name"),
    supabase.from("products").select("*, categories(id, name, slug), product_images(*)").eq("is_active", true).order("sort_order").order("name"),
  ]);
  const categories = categoriesResult.data ?? [];
  const products: ProductWithRelations[] = productsResult.data ?? [];
  const error = categoriesResult.error ?? productsResult.error;

  return <><Header /><main className="overflow-hidden pt-24 sm:pt-32"><section className="container-shell pb-10"><span className="section-eyebrow">Catálogo de productos</span><h1 className="section-title">Equipos y soluciones para tu operación</h1><p className="section-copy">Consulta información técnica, precios publicados y solicita una cotización formal sin salir del catálogo.</p></section>{error ? <section className="container-shell py-10"><div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">No se pudo cargar el catálogo: {error.message}</div></section> : categories.map((category) => { const categoryProducts = products.filter((product) => product.category_id === category.id); if (categoryProducts.length === 0) return null; return <section key={category.id} className="container-shell scroll-mt-28 py-10"><h2 className="text-2xl font-bold text-white">{category.name}</h2>{category.description && <p className="mb-8 mt-2 text-sm text-slate-400">{category.description}</p>}<div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{categoryProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>; })}<section className="container-shell py-16"><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center text-sm text-slate-400">La disponibilidad, impuestos y condiciones finales se confirman en la cotización formal.</div></section></main><Footer /></>;
}
