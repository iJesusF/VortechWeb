"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/utils";
import { categorySchema } from "@/lib/validations/category";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { Category } from "@/lib/supabase/types";
import { Plus, Pencil, Trash2, Check, X, ChevronUp, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

interface CategoryManagerProps {
  initialCategories: Category[];
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  is_active: true,
  sort_order: 0,
};

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const supabase = createClient();

  function updateForm(field: keyof FormState, value: string | boolean | number) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && typeof value === "string" && !editingId) {
        next.slug = generateSlug(value);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function startCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: categories.length });
    setErrors({});
    setShowForm(true);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      is_active: cat.is_active,
      sort_order: cat.sort_order,
    });
    setErrors({});
    setShowForm(true);
  }

  function cancel() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = categorySchema.safeParse({
      ...form,
      description: form.description || null,
    });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) errs[String(issue.path[0])] = issue.message;
      });
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const { data, error } = await supabase
          .from("categories")
          .update(result.data as Record<string, unknown>)
          .eq("id", editingId)
          .select()
          .single();
        if (error) throw error;
        setCategories((prev) => prev.map((c) => (c.id === editingId ? (data as Category) : c)));
        toast.success("Categoría actualizada");
      } else {
        const { data, error } = await supabase
          .from("categories")
          .insert(result.data as Record<string, unknown>)
          .select()
          .single();
        if (error) throw error;
        setCategories((prev) => [...prev, data as Category]);
        toast.success("Categoría creada");
      }
      cancel();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      if (msg.includes("unique") || msg.includes("duplicate")) {
        setErrors({ slug: "Este slug ya existe" });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(cat: Category) {
    const { data, error } = await supabase
      .from("categories")
      .update({ is_active: !cat.is_active } as Record<string, unknown>)
      .eq("id", cat.id)
      .select()
      .single();
    if (error) { toast.error("Error al actualizar"); return; }
    const updated = data as Category;
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
    toast.success(updated.is_active ? "Categoría activada" : "Categoría desactivada");
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase.from("categories").delete().eq("id", deleteTarget.id);
    if (error) {
      if (error.message.includes("foreign key") || error.message.includes("violates")) {
        toast.error("No se puede eliminar: tiene productos asignados. Reasígnalos primero.");
      } else {
        toast.error("Error al eliminar");
      }
      setDeleteTarget(null);
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    toast.success("Categoría eliminada");
    setDeleteTarget(null);
  }

  async function moveCategory(cat: Category, direction: "up" | "down") {
    const idx = categories.findIndex((c) => c.id === cat.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categories.length) return;

    const other = categories[swapIdx];
    const newOrder = [...categories];
    newOrder[idx] = { ...cat, sort_order: other.sort_order };
    newOrder[swapIdx] = { ...other, sort_order: cat.sort_order };
    newOrder.sort((a, b) => a.sort_order - b.sort_order);

    setCategories(newOrder);
    await Promise.all([
      supabase.from("categories").update({ sort_order: other.sort_order } as Record<string, unknown>).eq("id", cat.id),
      supabase.from("categories").update({ sort_order: cat.sort_order } as Record<string, unknown>).eq("id", other.id),
    ]);
  }

  return (
    <div className="space-y-6">
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6">
          <h2 className="mb-5 text-lg font-semibold text-white">
            {editingId ? "Editar categoría" : "Nueva categoría"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                className="admin-input"
                placeholder="Ej: Automatización Industrial"
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Slug <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateForm("slug", e.target.value)}
                className="admin-input"
                placeholder="automatizacion-industrial"
              />
              {errors.slug && <p className="mt-1 text-xs text-red-400">{errors.slug}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Descripción
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                rows={2}
                className="admin-input resize-none"
                placeholder="Descripción opcional de la categoría"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => updateForm("is_active", e.target.checked)}
                className="size-4 rounded border-white/20 bg-white/5 accent-cyanx"
              />
              <label htmlFor="is_active" className="text-sm text-slate-300">
                Categoría activa
              </label>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={cancel} className="admin-btn-ghost">
              <X className="size-4" /> Cancelar
            </button>
            <button type="submit" disabled={loading} className="admin-btn-primary">
              <Check className="size-4" /> {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <button onClick={startCreate} className="admin-btn-primary">
          <Plus className="size-4" /> Nueva categoría
        </button>
      )}

      {categories.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <p className="text-slate-400">No hay categorías todavía</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden rounded-2xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Nombre</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Slug</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Estado</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map((cat, idx) => (
                <tr key={cat.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-medium text-white">{cat.name}</td>
                  <td className="px-5 py-4 font-mono text-sm text-slate-400">{cat.slug}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleActive(cat)} className="group">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium transition group-hover:opacity-80 ${cat.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-500/15 text-slate-400"}`}>
                        {cat.is_active ? "Activa" : "Inactiva"}
                      </span>
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => moveCategory(cat, "up")} disabled={idx === 0} className="icon-btn" title="Subir">
                        <ChevronUp className="size-4" />
                      </button>
                      <button onClick={() => moveCategory(cat, "down")} disabled={idx === categories.length - 1} className="icon-btn" title="Bajar">
                        <ChevronDown className="size-4" />
                      </button>
                      <button onClick={() => startEdit(cat)} className="icon-btn" title="Editar">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(cat)} className="icon-btn text-red-400 hover:bg-red-500/10" title="Eliminar">
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
        title="Eliminar categoría"
        message={`¿Estás seguro de eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer. Si hay productos en esta categoría, deberás reasignarlos primero.`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />
    </div>
  );
}
