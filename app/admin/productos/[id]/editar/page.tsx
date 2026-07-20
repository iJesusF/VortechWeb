import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import { notFound } from "next/navigation";
import type { Product, Category, ProductImage } from "@/lib/supabase/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const [productRes, categoriesRes, imagesRes] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("product_images")
      .select("*")
      .eq("product_id", id)
      .order("sort_order"),
  ]);

  if (productRes.error || !productRes.data) {
    notFound();
  }

  const product = productRes.data as unknown as Product;
  const categories = (categoriesRes.data ?? []) as unknown as Category[];
  const images = (imagesRes.data ?? []) as unknown as ProductImage[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Editar producto</h1>
        <p className="mt-1 text-sm text-slate-400">{product.name}</p>
      </div>
      <ProductForm
        categories={categories}
        product={product}
        images={images}
      />
    </div>
  );
}
