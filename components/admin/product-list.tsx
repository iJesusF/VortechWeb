"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Pencil, Trash2, Copy, Eye, EyeOff, Star } from "lucide-react";
import toast from "react-hot-toast";
import type { Category } from "@/lib/supabase/types";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  updated_at: string;
  category_id: string;
  categories: { name: string } | null;
};

interface ProductListProps {
  initialProducts: ProductRow[];
  categories: Pick<Category, "id" | "name">[];
}

export function ProductList({ initialProducts, categories }: ProductListProps) {
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const supabase = createClient();

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.sku ?? "").toLowerCase().includes(q);
    const matchesCategory = !filterCategory || p.category_id === filterCategory;
    const matchesStatus =
      !filterStatus ||
      (filterStatus === "active" && p.is_active) ||
      (filterStatus === "hidden" && !p.is_active) ||
      (filterStatus === "featured" && p.is_featured);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  async function toggleActive(p: ProductRow) {
    const { data, error } = await supabase
      .from("products")
      .update({ is_active: !p.is_active } as Record<string, unknown>)
      .eq("id", p.id)
      .select()
      .single();
    if (error) { toast.error("Error al actualizar"); return; }
    const updated = data as { is_active: boolean };
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_active: updated.is_active } : x)));
    toast.success(updated.is_active ? "Producto activado" : "Producto ocultado");
  }

  async function toggleFeatured(p: ProductRow) {
    const { data, error } = await supabase
      .from("products")
      .update({ is_featured: !p.is_featured } as Record<string, unknown>)
      .eq("id", p.id)
      .select()
      .single();
    if (error) { toast.error("Error al actualizar"); return; }
    const updated = data as { is_featured: boolean };
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_featured: updated.is_featured } : x)));
    toast.success(updated.is_featured ? "Marcado como destacado" : "Destacado removido");
  }

  async function handleDuplicate(p: ProductRow) {
    const { data: original } = await supabase.from("products").select("*").eq("id", p.id).single();
    if (!original) { toast.error("No se pudo cargar el producto"); return; }
    const orig = original as Record<string, unknown>;
    const { id: _, created_at: _ca, updated_at: _ua, slug, name, sku, ...rest } = orig;
    void _; void _ca; void _ua;
    const { error } = await supabase.from("products").insert({
      ...rest,
      name: `${name} (copia)`,
      slug: `${slug}-copia-${Date.now()}`,
      sku: sku ? `${sku}-COPIA` : null,
      is_active: false,
    } as Record<string, unknown>);
    if (error) { toast.error("Error al duplicar"); return; }
    toast.success("Producto duplicado (inactivo)");
    window.location.reload();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase.from("products").delete().eq("id", deleteTarget.id);
    if (error) { toast.error("Error al eliminar"); setDeleteTarget(null); return; }
    setProducts((prev) => prev.filter((x) => x.id !== deleteTarget.id));
    toast.success("Producto eliminado");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o SKU..."
          className="admin-input max-w-xs"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="admin-input max-w-[180px]"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="admin-input max-w-[160px]"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="hidden">Ocultos</option>
          <option value="featured">Destacados</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <p className="text-slate-400">No se encontraron productos</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden rounded-2xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Producto</th>
                <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 md:table-cell">Categoría</th>
                <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:table-cell">SKU</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Estado</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => (
                <tr key={p.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {p.is_featured && <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />}
                      <a href={`/admin/productos/${p.id}/editar`} className="font-medium text-white hover:text-cyanx">
                        {p.name}
                      </a>
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 text-sm text-slate-400 md:table-cell">
                    {p.categories?.name ?? "—"}
                  </td>
                  <td className="hidden px-5 py-4 font-mono text-sm text-slate-400 sm:table-cell">
                    {p.sku ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${p.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-500/15 text-slate-400"}`}>
                      {p.is_active ? "Activo" : "Oculto"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleActive(p)} className="icon-btn" title={p.is_active ? "Ocultar" : "Activar"}>
                        {p.is_active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                      <button onClick={() => toggleFeatured(p)} className={`icon-btn ${p.is_featured ? "text-yellow-400" : ""}`} title={p.is_featured ? "Quitar destacado" : "Destacar"}>
                        <Star className={`size-4 ${p.is_featured ? "fill-yellow-400" : ""}`} />
                      </button>
                      <button onClick={() => handleDuplicate(p)} className="icon-btn" title="Duplicar">
                        <Copy className="size-4" />
                      </button>
                      <a href={`/admin/productos/${p.id}/editar`} className="icon-btn" title="Editar">
                        <Pencil className="size-4" />
                      </a>
                      <button onClick={() => setDeleteTarget(p)} className="icon-btn text-red-400 hover:bg-red-500/10" title="Eliminar">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar producto"
        message={`¿Estás seguro de eliminar "${deleteTarget?.name}"? Se eliminarán también sus imágenes. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />
    </div>
  );
}
