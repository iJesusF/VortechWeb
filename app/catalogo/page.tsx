import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CatalogClient } from "@/components/catalog/catalog-client";
import { Header } from "@/components/header";
import type { Category, ProductWithCategory, ProductImage } from "@/lib/types/database";

export const metadata: Metadata = {
  title: "Catálogo de Productos",
  description:
    "Explore nuestro catálogo de equipos y soluciones para automatización industrial, tratamiento de agua y medición de utilities.",
  openGraph: {
    title: "Catálogo de Productos | INTEGRA",
    description:
      "Equipos y soluciones para automatización industrial, tratamiento de agua y medición inteligente.",
  },
};

async function getProducts(): Promise<ProductWithCategory[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return (data || []) as unknown as ProductWithCategory[];
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return (data || []) as Category[];
}

async function getProductImages(): Promise<Record<string, string>> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("product_id, public_url, is_cover, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching product images:", error);
    return {};
  }

  // Get cover image or first image for each product
  const coverMap: Record<string, string> = {};
  if (data) {
    for (const img of data as Pick<ProductImage, "product_id" | "public_url" | "is_cover" | "sort_order">[]) {
      if (!coverMap[img.product_id] || img.is_cover) {
        coverMap[img.product_id] = img.public_url;
      }
    }
  }

  return coverMap;
}

export default async function CatalogoPage() {
  const [products, categories, coverImages] = await Promise.all([
    getProducts(),
    getCategories(),
    getProductImages(),
  ]);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-20">
        <div className="container-shell">
          <div className="mb-10">
            <span className="section-eyebrow">Catálogo</span>
            <h1 className="section-title">Nuestros Productos y Equipos</h1>
            <p className="section-copy">
              Explore nuestra línea de soluciones para automatización, control y
              tratamiento de agua.
            </p>
          </div>

          <CatalogClient
            products={products}
            categories={categories}
            coverImages={coverImages}
          />
        </div>
      </main>
    </>
  );
}
