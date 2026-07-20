"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/utils";
import { productSchema } from "@/lib/validations/product";
import { ImageManager } from "@/components/admin/image-manager";
import { Plus, Trash2, Check } from "lucide-react";
import toast from "react-hot-toast";
import type { Category, Product, ProductImage } from "@/lib/supabase/types";

interface ProductFormProps {
  categories: Category[];
  product?: Product;
  images?: ProductImage[];
}

type SpecEntry = { key: string; value: string };

function specsObjectToEntries(specs: Record<string, unknown>): SpecEntry[] {
  return Object.entries(specs).map(([key, value]) => ({ key, value: String(value) }));
}

export function ProductForm({ categories, product, images = [] }: ProductFormProps) {
  const isEditing = !!product;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    sku: product?.sku ?? "",
    category_id: product?.category_id ?? (categories[0]?.id ?? ""),
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    price_mode: product?.price_mode ?? ("request_quote" as const),
    price: product?.price ? String(product.price) : "",
    currency: product?.currency ?? "MXN",
    is_active: product?.is_active ?? false,
    is_featured: product?.is_featured ?? false,
    sort_order: String(product?.sort_order ?? 0),
    whatsapp_message_override: product?.whatsapp_message_override ?? "",
  });

  const [specs, setSpecs] = useState<SpecEntry[]>(
    product?.specifications
      ? specsObjectToEntries(product.specifications as Record<string, unknown>)
      : []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && typeof value === "string" && !isEditing) {
        next.slug = generateSlug(value);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function addSpec() {
    setSpecs((prev) => [...prev, { key: "", value: "" }]);
  }

  function updateSpec(idx: number, field: "key" | "value", val: string) {
    setSpecs((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));
  }

  function removeSpec(idx: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const specsObj = Object.fromEntries(
      specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value.trim()])
    );

    const parsed = productSchema.safeParse({
      name: form.name,
      slug: form.slug,
      sku: form.sku || null,
      category_id: form.category_id,
      short_description: form.short_description,
      description: form.description,
      specifications: specsObj,
      price_mode: form.price_mode,
      price: form.price ? parseFloat(form.price) : null,
      currency: form.currency,
      is_active: form.is_active,
      is_featured: form.is_featured,
      sort_order: parseInt(form.sort_order) || 0,
      whatsapp_message_override: form.whatsapp_message_override || null,
    });

    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0]) errs[String(issue.path[0])] = issue.message;
      });
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from("products")
          .update(parsed.data as Record<string, unknown>)
          .eq("id", product.id);
        if (error) throw error;
        toast.success("Producto actualizado");
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(parsed.data as Record<string, unknown>)
          .select()
          .single();
        if (error) throw error;
        toast.success("Producto creado");
        const created = data as { id: string };
        startTransition(() => {
          router.push(`/admin/productos/${created.id}/editar`);
        });
        return;
      }
      startTransition(() => { router.refresh(); });
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

  const showPrice = form.price_mode === "fixed" || form.price_mode === "from";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="mb-5 text-base font-semibold text-white">Información básica</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Nombre <span className="text-red-400">*</span>
            </label>
            <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className="admin-input" placeholder="Nombre del producto" />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Slug <span className="text-red-400">*</span>
            </label>
            <input type="text" value={form.slug} onChange={(e) => update("slug", e.target.value)} className="admin-input" placeholder="nombre-del-producto" />
            {errors.slug && <p className="mt-1 text-xs text-red-400">{errors.slug}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">SKU</label>
            <input type="text" value={form.sku} onChange={(e) => update("sku", e.target.value)} className="admin-input" placeholder="PRD-001" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Categoría <span className="text-red-400">*</span>
            </label>
            <select value={form.category_id} onChange={(e) => update("category_id", e.target.value)} className="admin-input">
              <option value="">Seleccionar categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1 text-xs text-red-400">{errors.category_id}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Descripción corta <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.short_description}
              onChange={(e) => update("short_description", e.target.value)}
              rows={2}
              className="admin-input resize-none"
              placeholder="Resumen del producto (máx. 300 caracteres)"
              maxLength={300}
            />
            <p className="mt-1 text-right text-xs text-slate-500">{form.short_description.length}/300</p>
            {errors.short_description && <p className="mt-1 text-xs text-red-400">{errors.short_description}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Descripción completa <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={6}
              className="admin-input resize-y"
              placeholder="Descripción detallada del producto. Soporta Markdown."
            />
            {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description}</p>}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="mb-5 text-base font-semibold text-white">Precio</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Modo de precio</label>
            <select value={form.price_mode} onChange={(e) => update("price_mode", e.target.value)} className="admin-input">
              <option value="request_quote">Consultar precio</option>
              <option value="fixed">Precio fijo</option>
              <option value="from">Desde $X</option>
              <option value="hidden">Oculto</option>
            </select>
          </div>
          {showPrice && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Precio</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} className="admin-input" placeholder="0.00" />
                {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Moneda</label>
                <select value={form.currency} onChange={(e) => update("currency", e.target.value)} className="admin-input">
                  <option value="MXN">MXN</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Specs */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Especificaciones técnicas</h2>
          <button type="button" onClick={addSpec} className="admin-btn-ghost text-xs">
            <Plus className="size-3.5" /> Agregar
          </button>
        </div>
        {specs.length === 0 ? (
          <p className="text-sm text-slate-500">Sin especificaciones. Haz clic en &ldquo;Agregar&rdquo; para añadir.</p>
        ) : (
          <div className="space-y-3">
            {specs.map((spec, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => updateSpec(idx, "key", e.target.value)}
                  placeholder="Propiedad (ej: Voltaje)"
                  className="admin-input flex-1"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => updateSpec(idx, "value", e.target.value)}
                  placeholder="Valor (ej: 220V)"
                  className="admin-input flex-1"
                />
                <button type="button" onClick={() => removeSpec(idx)} className="icon-btn text-red-400 hover:bg-red-500/10">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="mb-5 text-base font-semibold text-white">WhatsApp</h2>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Mensaje personalizado (opcional)
          </label>
          <textarea
            value={form.whatsapp_message_override}
            onChange={(e) => update("whatsapp_message_override", e.target.value)}
            rows={3}
            className="admin-input resize-none"
            placeholder="Si se deja vacío se usará el mensaje predeterminado con el nombre, SKU y URL del producto."
            maxLength={500}
          />
          <p className="mt-1 text-right text-xs text-slate-500">{form.whatsapp_message_override.length}/500</p>
        </div>
      </div>

      {/* Publishing */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="mb-5 text-base font-semibold text-white">Publicación</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => update("is_active", e.target.checked)}
              className="size-4 rounded accent-cyanx"
            />
            <span className="text-sm text-slate-300">Producto activo (visible en el catálogo)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => update("is_featured", e.target.checked)}
              className="size-4 rounded accent-cyanx"
            />
            <span className="text-sm text-slate-300">Producto destacado</span>
          </label>
        </div>
        <div className="mt-4 max-w-xs">
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Orden de visualización</label>
          <input type="number" min="0" value={form.sort_order} onChange={(e) => update("sort_order", e.target.value)} className="admin-input" />
        </div>
      </div>

      {/* Images - only shown when editing */}
      {isEditing && (
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="mb-5 text-base font-semibold text-white">Imágenes</h2>
          <ImageManager productId={product.id} initialImages={images} />
        </div>
      )}

      {!isEditing && (
        <div className="rounded-xl border border-cyanx/20 bg-cyanx/5 p-4 text-sm text-slate-300">
          <strong className="text-cyanx">Nota:</strong> Podrás subir imágenes después de guardar el producto.
        </div>
      )}

      <div className="flex items-center justify-between">
        <a href="/admin/productos" className="admin-btn-ghost">
          Cancelar
        </a>
        {isEditing && (
          <a
            href={`/catalogo/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn-ghost text-xs"
          >
            Vista previa ↗
          </a>
        )}
        <button type="submit" disabled={loading || isPending} className="admin-btn-primary px-6 py-2.5">
          <Check className="size-4" />
          {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
