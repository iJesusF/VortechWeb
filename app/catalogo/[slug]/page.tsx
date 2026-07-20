import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { ProductDetail } from "@/components/catalog/product-detail";
import type { ProductWithImages, ProductWithCategory, ProductImage } from "@/lib/types/database";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<ProductWithImages | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), product_images(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as unknown as ProductWithImages;
}

async function getRelatedProducts(
  categoryId: string | null,
  currentId: string
): Promise<ProductWithCategory[]> {
  if (!categoryId) return [];
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .neq("id", currentId)
    .order("sort_order", { ascending: true })
    .limit(4);

  return (data || []) as unknown as ProductWithCategory[];
}

async function getRelatedCoverImages(productIds: string[]): Promise<Record<string, string>> {
  if (productIds.length === 0) return {};
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("product_images")
    .select("product_id, public_url, is_cover, sort_order")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const coverImage = product.product_images?.find((img) => img.is_cover) || product.product_images?.[0];

  return {
    title: product.name,
    description: product.short_description,
    openGraph: {
      title: `${product.name} | INTEGRA`,
      description: product.short_description,
      type: "website",
      ...(coverImage && {
        images: [{ url: coverImage.public_url, alt: coverImage.alt_text || product.name }],
      }),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category_id, product.id);
  const relatedCoverImages = await getRelatedCoverImages(relatedProducts.map((p) => p.id));

  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-20">
        <div className="container-shell">
          <ProductDetail
            product={product}
            relatedProducts={relatedProducts}
            relatedCoverImages={relatedCoverImages}
          />
        </div>
      </main>
    </>
  );
}
