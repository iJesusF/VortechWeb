"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { generateSlug, getErrorMessage } from "@/lib/catalog/utils";
import { categorySchema } from "@/lib/validations/category";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { Category } from "@/lib/types/database";

interface CategoryManagerProps {
  initialCategories: Category[];
}

type FormState = {
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  sort_order: string;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  is_active: true,
  sort_order: "0",
};

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const supabase = createClient();

  function update(field: keyof FormState, value: string | boolean) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "name" && typeof value === "string" && !editingId) next.slug = generateSlug(value);
      return next;
    });
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function startCreate() {
    const nextOrder = categories.length ? Math.max(...categories.map((category) => category.sort_order)) + 1 : 0;
    setForm({ ...emptyForm, sort_order: String(nextOrder) });
    setEditingId(null);
    setErrors({});
    setNotice(null);
    setShowForm(true);
  }

  function startEdit(category: Category) {
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      is_active: category.is_active,
      sort_order: String(category.sort_order),
    });
    setEditingId(category.id);
    setErrors({});
    setNotice(null);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setErrors({});
  }

  async function saveCategory(event: React.FormEvent) {
    event.preventDefault();
    setNotice(null);
    const parsed = categorySchema.safeParse({
      name: form.name,
      slug: form.slug,
      description: form.description.trim() || null,
      is_active: form.is_active,
      sort_order: Number.parseInt(form.sort_order, 10) || 0,
    });

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = String(issue.path[0] ?? "form");
        nextErrors[field] ??= issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    setBusy(true);
    try {
      if (editingId) {
        const { data, error } = await supabase
          .from("categories")
          .update(parsed.data)
          .eq("id", editingId)
          .select()
          .single();
        if (error) throw error;
        setCategories((current) => current.map((category) => category.id === editingId ? data : category).sort((a, b) => a.sort_order - b.sort_order));
        setNotice({ type: "success", message: "Categoría actualizada." });
      } else {
        const { data, error } = await supabase
          .from("categories")
          .insert({ ...parsed.data, image_url: null })
          .select()
          .single();
        if (error) throw error;
        setCategories((current) => [...current, data].sort((a, b) => a.sort_order - b.sort_order));
        setNotice({ type: "success", message: "Categoría creada." });
      }
      cancelForm();
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error, "No se pudo guardar la categoría.") });
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(category: Category) {
    setNotice(null);
    const { data, error } = await supabase
      .from("categories")
      .update({ is_active: !category.is_active })
      .eq("id", category.id)
      .select()
      .single();
    if (error) {
      setNotice({ type: "error", message: error.message });
      return;
    }
    setCategories((current) => current.map((item) => item.id === category.id ? data : item));
    setNotice({ type: "success", message: data.is_active ? "Categoría activada." : "Categoría desactivada." });
  }

  async function deleteCategory() {
    if (!deleteTarget) return;
    setBusy(true);
    setNotice(null);
    try {
      const { error } = await supabase.from("categories").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      setCategories((current) => current.filter((category) => category.id !== deleteTarget.id));
      setDeleteTarget(null);
      setNotice({ type: "success", message: "Categoría eliminada." });
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error, "No se pudo eliminar. Reasigna primero sus productos.") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {notice && <div className={`rounded-xl border px-4 py-3 text-sm ${notice.type === "error" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>{notice.message}</div>}

      {!showForm && <button type="button" onClick={startCreate} className="admin-btn-primary"><Plus className="size-4" />Nueva categoría</button>}

      {showForm && (
        <form onSubmit={saveCategory} className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white">{editingId ? "Editar categoría" : "Nueva categoría"}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-300">Nombre *<input value={form.name} onChange={(event) => update("name", event.target.value)} className="admin-input mt-1.5" />{errors.name && <span className="mt-1 block text-xs text-red-400">{errors.name}</span>}</label>
            <label className="text-sm text-slate-300">Slug *<input value={form.slug} onChange={(event) => update("slug", event.target.value)} className="admin-input mt-1.5" />{errors.slug && <span className="mt-1 block text-xs text-red-400">{errors.slug}</span>}</label>
            <label className="text-sm text-slate-300 sm:col-span-2">Descripción<textarea value={form.description} onChange={(event) => update("description", event.target.value)} rows={3} className="admin-input mt-1.5 resize-y" />{errors.description && <span className="mt-1 block text-xs text-red-400">{errors.description}</span>}</label>
            <label className="text-sm text-slate-300">Orden<input type="number" min="0" value={form.sort_order} onChange={(event) => update("sort_order", event.target.value)} className="admin-input mt-1.5" /></label>
            <label className="flex items-center gap-3 self-end rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300"><input type="checkbox" checked={form.is_active} onChange={(event) => update("is_active", event.target.checked)} className="size-4 accent-cyanx" />Categoría activa</label>
          </div>
          <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={cancelForm} className="admin-btn-ghost"><X className="size-4" />Cancelar</button><button type="submit" disabled={busy} className="admin-btn-primary"><Check className="size-4" />{busy ? "Guardando..." : "Guardar"}</button></div>
        </form>
      )}

      <div className="glass-panel overflow-x-auto rounded-2xl">
        <table className="min-w-full">
          <thead className="border-b border-white/10"><tr><th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-400">Categoría</th><th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-400">Orden</th><th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-400">Estado</th><th className="px-5 py-3 text-right text-xs uppercase tracking-wider text-slate-400">Acciones</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {categories.map((category) => <tr key={category.id} className="hover:bg-white/[0.025]"><td className="px-5 py-4"><p className="font-medium text-white">{category.name}</p><p className="font-mono text-xs text-slate-500">{category.slug}</p></td><td className="px-5 py-4 text-sm text-slate-300">{category.sort_order}</td><td className="px-5 py-4"><button type="button" onClick={() => void toggleActive(category)} className={`rounded-full px-2.5 py-1 text-xs ${category.is_active ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/15 text-slate-400"}`}>{category.is_active ? "Activa" : "Inactiva"}</button></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => startEdit(category)} className="icon-btn" aria-label={`Editar ${category.name}`}><Pencil className="size-4" /></button><button type="button" onClick={() => setDeleteTarget(category)} className="icon-btn text-red-400" aria-label={`Eliminar ${category.name}`}><Trash2 className="size-4" /></button></div></td></tr>)}
          </tbody>
        </table>
        {categories.length === 0 && <p className="p-10 text-center text-sm text-slate-400">No hay categorías.</p>}
      </div>

      <ConfirmDialog open={deleteTarget !== null} title="Eliminar categoría" message={`¿Eliminar “${deleteTarget?.name ?? ""}”? Si contiene productos, Supabase impedirá la eliminación hasta que sean reasignados.`} onConfirm={deleteCategory} onCancel={() => setDeleteTarget(null)} busy={busy} />
    </div>
  );
}
