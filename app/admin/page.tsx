import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { Package, Eye, EyeOff, Star, FolderOpen, Clock } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/types/database";

async function getStats() {
  const supabase = await createServerSupabaseClient();

  const [productsRes, categoriesRes] = await Promise.all([
    supabase.from("products").select("id, name, slug, is_active, is_featured, updated_at"),
    supabase.from("categories").select("id"),
  ]);

  const products = (productsRes.data || []) as Pick<Product, "id" | "name" | "slug" | "is_active" | "is_featured" | "updated_at">[];
  const categories = categoriesRes.data || [];

  return {
    total: products.length,
    active: products.filter((p) => p.is_active).length,
    hidden: products.filter((p) => !p.is_active).length,
    featured: products.filter((p) => p.is_featured).length,
    categories: categories.length,
    recent: products
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5),
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const statCards = [
    { label: "Total productos", value: stats.total, icon: Package, color: "text-white" },
    { label: "Activos", value: stats.active, icon: Eye, color: "text-emerald-400" },
    { label: "Ocultos", value: stats.hidden, icon: EyeOff, color: "text-amber-400" },
    { label: "Destacados", value: stats.featured, icon: Star, color: "text-cyanx" },
    { label: "Categorías", value: stats.categories, icon: FolderOpen, color: "text-purple-400" },
  ];

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Resumen del catálogo de productos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass-panel rounded-2xl p-5 transition hover:border-white/20"
            >
              <Icon className={`mb-3 size-5 ${stat.color}`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Products */}
      <div className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="size-4 text-cyanx" />
          <h2 className="text-lg font-semibold text-white">
            Modificados recientemente
          </h2>
        </div>

        {stats.recent.length > 0 ? (
          <div className="glass-panel overflow-hidden rounded-2xl">
            <div className="divide-y divide-white/5">
              {stats.recent.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/productos/${product.id}/editar`}
                  className="flex items-center justify-between px-5 py-4 transition hover:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.is_active
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {product.is_active ? "Activo" : "Oculto"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(product.updated_at).toLocaleDateString("es-MX")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-panel flex flex-col items-center justify-center rounded-2xl py-12 text-center">
            <Package className="mb-3 size-8 text-slate-500" />
            <p className="text-sm text-slate-400">No hay productos aún</p>
            <Link
              href="/admin/productos/nuevo"
              className="mt-4 rounded-full border border-cyanx/30 bg-cyanx/10 px-4 py-2 text-sm font-medium text-cyanx transition hover:bg-cyanx/20"
            >
              Crear primer producto
            </Link>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
