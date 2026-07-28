import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const supabase = await createServerSupabaseClient();
  const { data: categories, error } = await supabase.from("categories").select("*").order("sort_order").order("name");

  return (
    <div>
      <Link href="/admin/productos" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyanx"><ArrowLeft className="size-4" />Volver al catálogo</Link>
      <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyanx">Catálogo</p><h1 className="mt-2 text-2xl font-bold text-white">Nuevo producto</h1></div>
      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">Supabase: {error.message}</div> : <ProductForm categories={categories ?? []} />}
    </div>
  );
}
