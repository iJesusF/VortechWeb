"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  Loader2,
  FolderOpen,
} from "lucide-react";
import type { Category } from "@/lib/types/database";
import { ConfirmDialog } from "./confirm-dialog";

interface Props {
  categories: Category[];
  productCounts: Record<string, number>;
}

export function CategoriesClient({ categories: initial, productCounts }: Props) {
  const [categories, setCategories] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Form state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
  }

  function startEdit(cat: Category) {
    setEditing(cat.id);
    setCreating(false);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || "");
  }

  function cancelForm() {
    setCreating(false);
    setEditing(null);
  }

  async function handleSave() {
    if (!formName.trim() || !formSlug.trim() || loading) return;
    setLoading(true);
    const supabase = createClient();

    if (creating) {
      const { error } = await supabase.from("categories").insert({
        name: formName.trim(),
        slug: formSlug.trim(),
        description: formDescription.trim() || null,
        sort_order: categories.length,
        is_active: true,
      });
      if (!error) {
        setCreating(false);
        router.refresh();
      }
    } else if (editing) {
      const { error } = await supabase
        .from("categories")
        .update({
          name: formName.trim(),
          slug: formSlug.trim(),
          description: formDescription.trim() || null,
        })
        .eq("id", editing);
      if (!error) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editing
              ? { ...c, name: formName.trim(), slug: formSlug.trim(), description: formDescription.trim() || null }
              : c
          )
        );
        setEditing(null);
      }
    }

    setLoading(false);
    // Refresh to get updated data
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setCategories(data as Category[]);
  }

  async function toggleActive(cat: Category) {
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({ is_active: !cat.is_active })
      .eq("id", cat.id);

    if (!error) {
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: !c.is_active } : c))
      );
    }
  }

  async function moveCategory(cat: Category, direction: "up" | "down") {
    const idx = categories.findIndex((c) => c.id === cat.id);
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    const supabase = createClient();
    await Promise.all([
      supabase.from("categories").update({ sort_order: targetIdx }).eq("id", categories[idx].id),
      supabase.from("categories").update({ sort_order: idx }).eq("id", categories[targetIdx].id),
    ]);

    const newCats = [...categories];
    [newCats[idx], newCats[targetIdx]] = [newCats[targetIdx], newCats[idx]];
    setCategories(newCats);
  }

  async function handleDelete() {
    if (!deleteTarget || loading) return;
    const count = productCounts[deleteTarget.id] || 0;
    if (count > 0) {
      setDeleteTarget(null);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", deleteTarget.id);
    if (!error) {
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categorías</h1>
          <p className="mt-1 text-sm text-slate-400">
            {categories.length} categoría{categories.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={startCreate}
          className="cta-button bg-cyanx text-slate-950 shadow-glow hover:-translate-y-0.5 hover:bg-white"
        >
          <Plus className="mr-2 size-4" />
          Nueva categoría
        </button>
      </div>

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <div className="mb-6 glass-panel rounded-2xl p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">
            {creating ? "Nueva categoría" : "Editar categoría"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              value={formName}
              onChange={(e) => {
                setFormName(e.target.value);
                if (creating) setFormSlug(generateSlug(e.target.value));
              }}
              placeholder="Nombre"
              className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyanx"
            />
            <input
              type="text"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              placeholder="slug"
              className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 font-mono text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyanx"
            />
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Descripción (opcional)"
              className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyanx"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading || !formName.trim()}
              className="flex items-center gap-1 rounded-xl bg-cyanx/15 px-3 py-2 text-xs font-medium text-cyanx transition hover:bg-cyanx/25 disabled:opacity-50"
            >
              {loading ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
              Guardar
            </button>
            <button
              onClick={cancelForm}
              className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/5"
            >
              <X className="size-3" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      {categories.length > 0 ? (
        <div className="glass-panel overflow-hidden rounded-2xl">
          <div className="divide-y divide-white/5">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.03]"
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveCategory(cat, "up")}
                    disabled={idx === 0}
                    className="text-slate-500 disabled:opacity-20 hover:text-white"
                  >
                    <ArrowUp className="size-3" />
                  </button>
                  <button
                    onClick={() => moveCategory(cat, "down")}
                    disabled={idx === categories.length - 1}
                    className="text-slate-500 disabled:opacity-20 hover:text-white"
                  >
                    <ArrowDown className="size-3" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{cat.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{cat.slug}</p>
                </div>
                <span className="text-xs text-slate-400">
                  {productCounts[cat.id] || 0} productos
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(cat)}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      cat.is_active
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {cat.is_active ? (
                      <Eye className="inline size-3 mr-1" />
                    ) : (
                      <EyeOff className="inline size-3 mr-1" />
                    )}
                    {cat.is_active ? "Activa" : "Oculta"}
                  </button>
                  <button
                    onClick={() => startEdit(cat)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                    title={
                      (productCounts[cat.id] || 0) > 0
                        ? "No se puede eliminar: tiene productos asignados"
                        : "Eliminar"
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-panel flex flex-col items-center justify-center rounded-2xl py-16 text-center">
          <FolderOpen className="mb-3 size-10 text-slate-500" />
          <p className="text-sm text-slate-400">No hay categorías. Crea la primera.</p>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar categoría"
        message={
          deleteTarget && (productCounts[deleteTarget.id] || 0) > 0
            ? `No se puede eliminar "${deleteTarget.name}" porque tiene ${productCounts[deleteTarget.id]} producto(s) asignado(s). Reasigne los productos primero.`
            : `¿Está seguro de eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`
        }
        confirmLabel={
          deleteTarget && (productCounts[deleteTarget.id] || 0) > 0
            ? "Entendido"
            : "Eliminar"
        }
        loading={loading}
        onConfirm={
          deleteTarget && (productCounts[deleteTarget.id] || 0) > 0
            ? () => setDeleteTarget(null)
            : handleDelete
        }
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
