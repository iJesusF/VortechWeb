import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductsListClient } from "@/components/admin/products-list-client";

async function getProducts() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data || [];
}

async function getCategories() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name")
    .order("sort_order", { ascending: true });
  return data || [];
}

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <AdminShell>
      <ProductsListClient products={products} categories={categories} />
    </AdminShell>
  );
}
