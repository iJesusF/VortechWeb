import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";

async function getCategories() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data || [];
}

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <AdminShell>
      <ProductForm categories={categories} mode="create" />
    </AdminShell>
  );
}
