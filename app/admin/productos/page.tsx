import Link from "next/link";
import { FolderTree, Plus } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProductList } from "@/components/admin/product-list";

export default async function AdminProductsPage() {
  const supabase = await createServerSupabaseClient();
  const [productsResult, categoriesResult] = await Promise.all([
    supabase.from("products").select("*").order("sort_order").order("name"),
    supabase.from("categories").select("*").order("sort_order").order("name"),
  ]);
  const error = productsResult.error ?? categoriesResult.error;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyanx">Catálogo</p><h1 className="mt-2 text-2xl font-bold text-white">Productos</h1><p className="mt-1 text-sm text-slate-400">Administra productos, precios, publicación e imágenes.</p></div>
        <div className="flex flex-wrap gap-2"><Link href="/admin/categorias" className="admin-btn-ghost"><FolderTree className="size-4" />Categorías</Link><Link href="/admin/productos/nuevo" className="admin-btn-primary"><Plus className="size-4" />Nuevo producto</Link></div>
      </div>
      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">Supabase: {error.message}</div> : <ProductList initialProducts={productsResult.data ?? []} categories={(categoriesResult.data ?? []).map(({ id, name }) => ({ id, name }))} />}
    </div>
  );
}
