import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { CategoriesClient } from "@/components/admin/categories-client";
import type { Category } from "@/lib/types/database";

async function getCategories(): Promise<Category[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data || []) as Category[];
}

async function getProductCounts(): Promise<Record<string, number>> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("products")
    .select("category_id");

  const counts: Record<string, number> = {};
  if (data) {
    for (const row of data as { category_id: string | null }[]) {
      if (row.category_id) {
        counts[row.category_id] = (counts[row.category_id] || 0) + 1;
      }
    }
  }
  return counts;
}

export default async function AdminCategoriesPage() {
  const [categories, productCounts] = await Promise.all([
    getCategories(),
    getProductCounts(),
  ]);

  return (
    <AdminShell>
      <CategoriesClient categories={categories} productCounts={productCounts} />
    </AdminShell>
  );
}
