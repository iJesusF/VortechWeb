import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/stats-card";
import { Package, Eye, EyeOff, Star, FolderOpen, Clock } from "lucide-react";
import type { Product } from "@/lib/supabase/types";

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient();

  const [productsRes, categoriesRes, recentRes] = await Promise.all([
    supabase.from("products").select("id, is_active, is_featured"),
    supabase.from("categories").select("id"),
    supabase
      .from("products")
      .select("id, name, slug, is_active, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const products = (productsRes.data || []) as Pick<Product, "id" | "is_active" | "is_featured">[];
  const categories = categoriesRes.data || [];
  const recentProducts = (recentRes.data || []) as Pick<Product, "id" | "name" | "slug" | "is_active" | "updated_at">[];

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.is_active).length;
  const hiddenProducts = products.filter((p) => !p.is_active).length;
  const featuredProducts = products.filter((p) => p.is_featured).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Resumen del catálogo de productos</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard title="Total productos" value={totalProducts} icon={Package} />
        <StatsCard title="Activos" value={activeProducts} icon={Eye} />
        <StatsCard title="Ocultos" value={hiddenProducts} icon={EyeOff} />
        <StatsCard title="Destacados" value={featuredProducts} icon={Star} />
        <StatsCard title="Categorías" value={categories.length} icon={FolderOpen} />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Clock className="size-5 text-cyanx" />
          Modificados recientemente
        </h2>
        {recentProducts.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center">
            <p className="text-slate-400">No hay productos todavía</p>
            <a
              href="/admin/productos/nuevo"
              className="cta-button mt-4 inline-flex bg-cyanx text-slate-950 shadow-glow hover:bg-white"
            >
              Crear primer producto
            </a>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden rounded-2xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Producto
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Estado
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Actualizado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentProducts.map((product) => (
                  <tr key={product.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <a
                        href={`/admin/productos/${product.id}/editar`}
                        className="font-medium text-white hover:text-cyanx"
                      >
                        {product.name}
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.is_active
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-slate-500/15 text-slate-400"
                        }`}
                      >
                        {product.is_active ? "Activo" : "Oculto"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {new Date(product.updated_at).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
