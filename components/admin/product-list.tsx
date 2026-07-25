"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/catalog/utils";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { Category, Product } from "@/lib/types/database";

interface ProductListProps {
  initialProducts: Product[];
  categories: Pick<Category, "id" | "name">[];
}

type Notice = { type: "success" | "error"; message: string } | null;

export function ProductList({ initialProducts, categories }: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const supabase = createClient();

  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        (product.sku ?? "").toLowerCase().includes(query);
      const matchesCategory = !categoryId || product.category_id === categoryId;
      const matchesStatus =
        !status ||
        (status === "active" && product.is_active) ||
        (status === "inactive" && !product.is_active);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryId, status]);

  async function toggleActive(product: Product) {
    setBusyId(product.id);
    setNotice(null);
    const { data, error } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id)
      .select("is_active")
      .single();

    if (error) {
      setNotice({ type: "error", message: error.message });
    } else {
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, is_active: data.is_active } : item
        )
      );
      setNotice({
        type: "success",
        message: data.is_active ? "Producto activado." : "Producto desactivado.",
      });
    }
    setBusyId(null);
  }

  async function deleteProduct() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    setNotice(null);

    try {
      const { data: imageRows, error: imageError } = await supabase
        .from("product_images")
        .select("storage_path")
        .eq("product_id", deleteTarget.id);
      if (imageError) throw imageError;

      const paths = imageRows.map((image) => image.storage_path);
      if (paths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("product-images")
          .remove(paths);
        if (storageError) throw storageError;
      }

      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", deleteTarget.id);
      if (deleteError) throw deleteError;

      setProducts((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      setNotice({ type: "success", message: "Producto e imágenes eliminados." });
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error, "No se pudo eliminar el producto.") });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      {notice && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${notice.type === "error" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>
          {notice.message}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px]">
        <input value={search} onChange={(event) => setSearch(event.target.value)} className="admin-input" placeholder="Buscar por nombre, slug o SKU" aria-label="Buscar productos" />
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="admin-input" aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="admin-input" aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      <div className="glass-panel overflow-x-auto rounded-2xl">
        <table className="min-w-full">
          <thead className="border-b border-white/10">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Producto</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Categoría</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Precio</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Estado</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-white/[0.025]">
                <td className="px-5 py-4">
                  <Link href={`/admin/productos/${product.id}/editar`} className="font-medium text-white hover:text-cyanx">{product.name}</Link>
                  <p className="mt-1 font-mono text-xs text-slate-500">{product.sku || product.slug}</p>
                </td>
                <td className="px-5 py-4 text-sm text-slate-300">{categoryNames.get(product.category_id) ?? "Sin categoría"}</td>
                <td className="px-5 py-4 text-sm text-slate-300">{product.price_mode === "hidden" ? "Oculto" : product.price_mode === "request_quote" ? "Cotización" : product.price_mode === "from" ? "Desde" : "Visible"}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${product.is_active ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/15 text-slate-400"}`}>{product.is_active ? "Activo" : "Inactivo"}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => void toggleActive(product)} disabled={busyId === product.id} className="icon-btn" title={product.is_active ? "Desactivar" : "Activar"} aria-label={product.is_active ? `Desactivar ${product.name}` : `Activar ${product.name}`}>
                      {product.is_active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                    <Link href={`/admin/productos/${product.id}/editar`} className="icon-btn" title="Editar" aria-label={`Editar ${product.name}`}><Pencil className="size-4" /></Link>
                    <button type="button" onClick={() => setDeleteTarget(product)} disabled={busyId === product.id} className="icon-btn text-red-400 hover:bg-red-500/10" title="Eliminar" aria-label={`Eliminar ${product.name}`}><Trash2 className="size-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && <p className="p-10 text-center text-sm text-slate-400">No se encontraron productos.</p>}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar producto"
        message={`¿Eliminar “${deleteTarget?.name ?? ""}”? También se eliminarán sus imágenes. Esta acción no se puede deshacer.`}
        onConfirm={deleteProduct}
        onCancel={() => setDeleteTarget(null)}
        busy={deleteTarget !== null && busyId === deleteTarget.id}
      />
    </div>
  );
}
