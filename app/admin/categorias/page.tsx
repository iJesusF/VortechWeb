import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function AdminCategoriasPage() {
  const supabase = await createServerSupabaseClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categorías</h1>
          <p className="mt-1 text-sm text-slate-400">Administra las categorías del catálogo</p>
        </div>
      </div>
      <CategoryManager initialCategories={categories ?? []} />
    </div>
  );
}
