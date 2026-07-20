import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProductList } from "@/components/admin/product-list";
import { Plus } from "lucide-react";

export default async function AdminProductosPage() {
  const supabase = await createServerSupabaseClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, sku, is_active, is_featured, sort_order, updated_at, category_id, categories(name)")
    .order("sort_order", { ascending: true });

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Productos</h1>
          <p className="mt-1 text-sm text-slate-400">Administra el catálogo de productos</p>
        </div>
        <a href="/admin/productos/nuevo" className="admin-btn-primary">
          <Plus className="size-4" /> Nuevo producto
        </a>
      </div>
      <ProductList
        initialProducts={(products ?? []) as Parameters<typeof ProductList>[0]["initialProducts"]}
        categories={categories ?? []}
      />
    </div>
  );
}
