"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { generateSlug, getErrorMessage } from "@/lib/catalog/utils";
import { productSchema } from "@/lib/validations/product";
import { ImageManager } from "@/components/admin/image-manager";
import type { Category, DiscountType, PriceMode, Product, ProductImage } from "@/lib/types/database";

interface ProductFormProps {
  categories: Category[];
  product?: Product;
  images?: ProductImage[];
}

type SpecEntry = { key: string; value: string };
type FormState = {
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  short_description: string;
  description: string;
  price_mode: PriceMode;
  price: string;
  currency: string;
  unit: string;
  discount_type: DiscountType;
  discount_value: string;
  tax_rate: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: string;
  whatsapp_message_override: string;
};

export function ProductForm({ categories, product, images = [] }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = product !== undefined;
  const initialPrice = product?.price ?? product?.unit_price;
  const [form, setForm] = useState<FormState>({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    sku: product?.sku ?? "",
    category_id: product?.category_id ?? categories[0]?.id ?? "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    price_mode: product?.price_mode ?? "request_quote",
    price: initialPrice === null || initialPrice === undefined ? "" : String(initialPrice),
    currency: product?.currency ?? "MXN",
    unit: product?.unit ?? "pieza",
    discount_type: product?.discount_type ?? "none",
    discount_value: String(product?.discount_value ?? 0),
    tax_rate: String((product?.tax_rate ?? 0) * 100),
    is_active: product?.is_active ?? false,
    is_featured: product?.is_featured ?? false,
    sort_order: String(product?.sort_order ?? 0),
    whatsapp_message_override: product?.whatsapp_message_override ?? "",
  });
  const [specifications, setSpecifications] = useState<SpecEntry[]>(() => {
    if (!product?.specifications || Array.isArray(product.specifications) || typeof product.specifications !== "object") return [];
    return Object.entries(product.specifications).map(([key, value]) => ({ key, value: String(value ?? "") }));
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "name" && typeof value === "string" && !isEditing) next.slug = generateSlug(value);
      if (field === "discount_type" && value === "none") next.discount_value = "0";
      return next;
    });
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function addSpecification() {
    setSpecifications((current) => [...current, { key: "", value: "" }]);
  }

  function updateSpecification(index: number, field: keyof SpecEntry, value: string) {
    setSpecifications((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  }

  function removeSpecification(index: number) {
    setSpecifications((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function saveProduct(event: React.FormEvent) {
    event.preventDefault();
    setNotice(null);
    const duplicateSpec = specifications.find((spec, index) => {
      const key = spec.key.trim().toLowerCase();
      return key && specifications.findIndex((other) => other.key.trim().toLowerCase() === key) !== index;
    });
    if (duplicateSpec) {
      setNotice({ type: "error", message: `La especificación “${duplicateSpec.key}” está duplicada.` });
      return;
    }

    const specsObject = Object.fromEntries(
      specifications
        .filter((spec) => spec.key.trim() && spec.value.trim())
        .map((spec) => [spec.key.trim(), spec.value.trim()])
    );
    const showPrice = form.price_mode === "fixed" || form.price_mode === "from";
    const parsed = productSchema.safeParse({
      name: form.name,
      slug: form.slug,
      sku: form.sku.trim() || null,
      category_id: form.category_id,
      short_description: form.short_description.trim() || null,
      description: form.description.trim() || null,
      specifications: specsObject,
      price_mode: form.price_mode,
      price: showPrice && form.price.trim() ? Number(form.price) : null,
      currency: form.currency,
      unit: form.unit,
      discount_type: form.discount_type,
      discount_value: form.discount_type === "none" ? 0 : Number(form.discount_value),
      tax_rate: Number(form.tax_rate) / 100,
      is_active: form.is_active,
      is_featured: form.is_featured,
      sort_order: Number.parseInt(form.sort_order, 10) || 0,
      whatsapp_message_override: form.whatsapp_message_override.trim() || null,
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

    const payload = {
      category_id: parsed.data.category_id,
      name: parsed.data.name,
      slug: parsed.data.slug,
      sku: parsed.data.sku,
      description: parsed.data.description,
      short_description: parsed.data.short_description,
      unit_price: parsed.data.price,
      price: parsed.data.price,
      price_mode: parsed.data.price_mode,
      currency: parsed.data.currency.toUpperCase(),
      unit: parsed.data.unit,
      specifications: parsed.data.specifications,
      discount_type: parsed.data.discount_type,
      discount_value: parsed.data.discount_value,
      tax_rate: parsed.data.tax_rate,
      is_active: parsed.data.is_active,
      is_featured: parsed.data.is_featured,
      sort_order: parsed.data.sort_order,
      whatsapp_message_override: parsed.data.whatsapp_message_override,
    };

    setBusy(true);
    try {
      if (product) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id);
        if (error) throw error;
        setNotice({ type: "success", message: "Producto actualizado." });
        router.refresh();
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert({ ...payload, image_url: null, images: [] })
          .select("id")
          .single();
        if (error) throw error;
        router.replace(`/admin/productos/${data.id}/editar`);
        router.refresh();
      }
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error, "No se pudo guardar el producto.") });
    } finally {
      setBusy(false);
    }
  }

  const showPrice = form.price_mode === "fixed" || form.price_mode === "from";

  return (
    <form onSubmit={saveProduct} className="space-y-6">
      {notice && <div className={`rounded-xl border px-4 py-3 text-sm ${notice.type === "error" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>{notice.message}</div>}
      {categories.length === 0 && <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Crea primero una categoría activa o inactiva.</div>}

      <section className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white">Información del producto</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Nombre *" error={errors.name}><input value={form.name} onChange={(event) => update("name", event.target.value)} className="admin-input" /></Field>
          <Field label="Slug *" error={errors.slug}><input value={form.slug} onChange={(event) => update("slug", event.target.value)} className="admin-input" /></Field>
          <Field label="SKU"><input value={form.sku} onChange={(event) => update("sku", event.target.value)} className="admin-input" /></Field>
          <Field label="Categoría *" error={errors.category_id}><select value={form.category_id} onChange={(event) => update("category_id", event.target.value)} className="admin-input"><option value="">Seleccionar categoría</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.is_active ? "" : " (inactiva)"}</option>)}</select></Field>
          <Field label="Descripción corta" error={errors.short_description} className="sm:col-span-2"><textarea value={form.short_description} onChange={(event) => update("short_description", event.target.value)} rows={2} maxLength={300} className="admin-input resize-y" /><span className="mt-1 block text-right text-xs text-slate-500">{form.short_description.length}/300</span></Field>
          <Field label="Descripción completa" error={errors.description} className="sm:col-span-2"><textarea value={form.description} onChange={(event) => update("description", event.target.value)} rows={6} className="admin-input resize-y" /></Field>
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white">Precio, descuento e IVA</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Comportamiento del precio" error={errors.price_mode} className="sm:col-span-2"><select value={form.price_mode} onChange={(event) => update("price_mode", event.target.value as PriceMode)} className="admin-input"><option value="request_quote">Solicitar cotización / WhatsApp</option><option value="fixed">Precio visible</option><option value="from">Precio desde</option><option value="hidden">Precio oculto</option></select></Field>
          {showPrice && <Field label="Precio *" error={errors.price}><input type="number" min="0" step="0.01" value={form.price} onChange={(event) => update("price", event.target.value)} className="admin-input" /></Field>}
          {showPrice && <Field label="Moneda"><select value={form.currency} onChange={(event) => update("currency", event.target.value)} className="admin-input"><option value="MXN">MXN</option><option value="USD">USD</option></select></Field>}
          <Field label="Unidad"><input value={form.unit} onChange={(event) => update("unit", event.target.value)} className="admin-input" placeholder="pieza" /></Field>
          <Field label="Tipo de descuento" error={errors.discount_type}><select value={form.discount_type} onChange={(event) => update("discount_type", event.target.value as DiscountType)} className="admin-input"><option value="none">Sin descuento</option><option value="percentage">Porcentaje</option><option value="fixed">Importe</option></select></Field>
          {form.discount_type !== "none" && <Field label={form.discount_type === "percentage" ? "Descuento (%)" : "Descuento (importe)"} error={errors.discount_value}><input type="number" min="0" step="0.01" max={form.discount_type === "percentage" ? 100 : undefined} value={form.discount_value} onChange={(event) => update("discount_value", event.target.value)} className="admin-input" /></Field>}
          <Field label="IVA / impuesto (%)" error={errors.tax_rate}><input type="number" min="0" max="100" step="0.01" value={form.tax_rate} onChange={(event) => update("tax_rate", event.target.value)} className="admin-input" /></Field>
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-white">Especificaciones técnicas</h2><button type="button" onClick={addSpecification} className="admin-btn-ghost"><Plus className="size-4" />Agregar</button></div>
        <div className="mt-5 space-y-3">
          {specifications.map((specification, index) => <div key={`${index}-${specification.key}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"><input value={specification.key} onChange={(event) => updateSpecification(index, "key", event.target.value)} className="admin-input" placeholder="Propiedad" /><input value={specification.value} onChange={(event) => updateSpecification(index, "value", event.target.value)} className="admin-input" placeholder="Valor" /><button type="button" onClick={() => removeSpecification(index)} className="icon-btn text-red-400" aria-label="Eliminar especificación"><Trash2 className="size-4" /></button></div>)}
          {specifications.length === 0 && <p className="text-sm text-slate-500">Sin especificaciones técnicas.</p>}
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white">WhatsApp</h2>
        <Field label="Mensaje personalizado (opcional)" error={errors.whatsapp_message_override} className="mt-5"><textarea value={form.whatsapp_message_override} onChange={(event) => update("whatsapp_message_override", event.target.value)} rows={3} maxLength={500} className="admin-input resize-y" /></Field>
      </section>

      <section className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white">Publicación</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300"><input type="checkbox" checked={form.is_active} onChange={(event) => update("is_active", event.target.checked)} className="size-4 accent-cyanx" />Producto activo</label>
          <label className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300"><input type="checkbox" checked={form.is_featured} onChange={(event) => update("is_featured", event.target.checked)} className="size-4 accent-cyanx" />Producto destacado</label>
          <Field label="Orden" error={errors.sort_order}><input type="number" min="0" value={form.sort_order} onChange={(event) => update("sort_order", event.target.value)} className="admin-input" /></Field>
        </div>
      </section>

      {product && <section className="glass-panel rounded-2xl p-6"><h2 className="mb-5 text-lg font-semibold text-white">Imágenes</h2><ImageManager productId={product.id} initialImages={images} /></section>}
      {!product && <p className="rounded-xl border border-cyanx/20 bg-cyanx/5 px-4 py-3 text-sm text-cyanx">Guarda primero el producto para habilitar la carga de imágenes.</p>}

      <div className="sticky bottom-4 z-20 flex justify-end"><button type="submit" disabled={busy || categories.length === 0} className="admin-btn-primary shadow-lg"><Check className="size-4" />{busy ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"}</button></div>
    </form>
  );
}

function Field({ label, error, className = "", children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return <label className={`block text-sm text-slate-300 ${className}`}><span className="mb-1.5 block font-medium">{label}</span>{children}{error && <span className="mt-1 block text-xs text-red-400">{error}</span>}</label>;
}
