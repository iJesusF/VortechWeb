"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Search,
  Eye,
  EyeOff,
  Star,
  Pencil,
  Trash2,
  Copy,
  Package,
} from "lucide-react";
import { ConfirmDialog } from "./confirm-dialog";
import type { Product } from "@/lib/types/database";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  is_active: boolean;
  is_featured: boolean;
  updated_at: string;
  category: { name: string } | null;
}

interface Props {
  products: ProductRow[];
  categories: { id: string; name: string }[];
}

export function ProductsListClient({ products: initialProducts, categories }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !filterCategory || (p.category && p.category.name === filterCategory);
    return matchesSearch && matchesCategory;
  });

  async function toggleActive(product: ProductRow) {
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);

    if (!error) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_active: !p.is_active } : p
        )
      );
    }
  }

  async function toggleFeatured(product: ProductRow) {
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update({ is_featured: !product.is_featured })
      .eq("id", product.id);

    if (!error) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_featured: !p.is_featured } : p
        )
      );
    }
  }

  async function handleDelete() {
    if (!deleteTarget || loading) return;
    setLoading(true);
    const supabase = createClient();

    // Delete associated images from storage
    const { data: images } = await supabase
      .from("product_images")
      .select("storage_path")
      .eq("product_id", deleteTarget.id);

    if (images && images.length > 0) {
      const paths = (images as { storage_path: string }[]).map((img) => img.storage_path);
      await supabase.storage.from("product-images").remove(paths);
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", deleteTarget.id);

    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    }

    setDeleteTarget(null);
    setLoading(false);
  }

  async function duplicateProduct(product: ProductRow) {
    const supabase = createClient();
    const { data: original } = await supabase
      .from("products")
      .select("*")
      .eq("id", product.id)
      .single();

    if (!original) return;

    const orig = original as Product;
    const newSlug = `${orig.slug}-copia-${Date.now()}`;

    const { error } = await supabase.from("products").insert({
      name: `${orig.name} (copia)`,
      slug: newSlug,
      sku: orig.sku,
      category_id: orig.category_id,
      short_description: orig.short_description,
      description: orig.description,
      specifications: orig.specifications,
      price_mode: orig.price_mode,
      price: orig.price,
      currency: orig.currency,
      is_active: false,
      is_featured: false,
      sort_order: orig.sort_order,
      whatsapp_message_override: orig.whatsapp_message_override,
    });

    if (!error) {
      router.refresh();
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Productos</h1>
          <p className="mt-1 text-sm text-slate-400">
            {products.length} producto{products.length !== 1 ? "s" : ""} en total
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="cta-button bg-cyanx text-slate-950 shadow-glow hover:-translate-y-0.5 hover:bg-white"
        >
          <Plus className="mr-2 size-4" />
          Nuevo producto
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyanx"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none focus:border-cyanx"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Products Table */}
      {filtered.length > 0 ? (
        <div className="glass-panel overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Producto
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Categoría
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Estado
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((product) => (
                  <tr key={product.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white">
                        {product.name}
                      </p>
                      {product.sku && (
                        <p className="text-xs text-slate-500 font-mono">{product.sku}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-400">
                        {product.category?.name || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleActive(product)}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
                            product.is_active
                              ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                              : "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
                          }`}
                          title={product.is_active ? "Desactivar" : "Activar"}
                        >
                          {product.is_active ? (
                            <Eye className="inline size-3 mr-1" />
                          ) : (
                            <EyeOff className="inline size-3 mr-1" />
                          )}
                          {product.is_active ? "Activo" : "Oculto"}
                        </button>
                        <button
                          onClick={() => toggleFeatured(product)}
                          className={`rounded-full p-1 transition ${
                            product.is_featured
                              ? "text-cyanx hover:text-cyanx/70"
                              : "text-slate-600 hover:text-slate-400"
                          }`}
                          title={product.is_featured ? "Quitar destacado" : "Marcar destacado"}
                        >
                          <Star className={`size-4 ${product.is_featured ? "fill-cyanx" : ""}`} />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/productos/${product.id}/editar`}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                          title="Editar"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <button
                          onClick={() => duplicateProduct(product)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                          title="Duplicar"
                        >
                          <Copy className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                          title="Eliminar"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel flex flex-col items-center justify-center rounded-2xl py-16 text-center">
          <Package className="mb-3 size-10 text-slate-500" />
          <p className="text-sm text-slate-400">
            {search || filterCategory
              ? "No se encontraron productos con esos filtros."
              : "No hay productos. Crea el primero."}
          </p>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar producto"
        message={`¿Está seguro de eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer. Las imágenes asociadas también se eliminarán.`}
        confirmLabel="Eliminar"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
