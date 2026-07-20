import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";

export default async function NuevoProductoPage() {
  const supabase = await createServerSupabaseClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Nuevo producto</h1>
        <p className="mt-1 text-sm text-slate-400">Completa los datos del producto</p>
      </div>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
