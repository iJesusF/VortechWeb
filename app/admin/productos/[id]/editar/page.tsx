import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const [productResult, categoriesResult, imagesResult] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order").order("name"),
    supabase.from("product_images").select("*").eq("product_id", id).order("sort_order"),
  ]);
  if (!productResult.data && !productResult.error) notFound();
  const error = productResult.error ?? categoriesResult.error ?? imagesResult.error;

  return (
    <div>
      <Link href="/admin/productos" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyanx"><ArrowLeft className="size-4" />Volver al catálogo</Link>
      <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyanx">Catálogo</p><h1 className="mt-2 text-2xl font-bold text-white">Editar producto</h1><p className="mt-1 text-sm text-slate-400">{productResult.data?.name}</p></div>
      {error || !productResult.data ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">Supabase: {error?.message ?? "Producto no encontrado"}</div> : <ProductForm categories={categoriesResult.data ?? []} product={productResult.data} images={imagesResult.data ?? []} />}
    </div>
  );
}
