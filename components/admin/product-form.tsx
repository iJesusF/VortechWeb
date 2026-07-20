"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/utils";
import { Save, Loader2, AlertCircle, Eye } from "lucide-react";
import Link from "next/link";
import type { Product, Category, PriceMode } from "@/lib/types/database";
import { ImageManager } from "./image-manager";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  mode: "create" | "edit";
}

type Specs = Record<string, string>;

export function ProductForm({ product, categories, mode }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [sku, setSku] = useState(product?.sku || "");
  const [categoryId, setCategoryId] = useState(product?.category_id || "");
  const [shortDescription, setShortDescription] = useState(product?.short_description || "");
  const [description, setDescription] = useState(product?.description || "");
  const [specifications, setSpecifications] = useState<Specs>(
    (product?.specifications as Specs) || {}
  );
  const [priceMode, setPriceMode] = useState<PriceMode>(product?.price_mode || "request_quote");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [currency, setCurrency] = useState(product?.currency || "MXN");
  const [isActive, setIsActive] = useState(product?.is_active ?? false);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [sortOrder, setSortOrder] = useState(product?.sort_order?.toString() || "0");
  const [whatsappOverride, setWhatsappOverride] = useState(product?.whatsapp_message_override || "");

  // Auto-generate slug from name
  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      if (mode === "create" || slug === generateSlug(name)) {
        setSlug(generateSlug(value));
      }
    },
    [mode, name, slug]
  );

  // Specifications management
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  function addSpec() {
    if (!specKey.trim()) return;
    setSpecifications((prev) => ({ ...prev, [specKey.trim()]: specValue.trim() }));
    setSpecKey("");
    setSpecValue("");
  }

  function removeSpec(key: string) {
    setSpecifications((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!name.trim() || !slug.trim() || !shortDescription.trim()) {
        setError("Nombre, slug y descripción corta son obligatorios.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const productData = {
        name: name.trim(),
        slug: slug.trim(),
        sku: sku.trim() || null,
        category_id: categoryId || null,
        short_description: shortDescription.trim(),
        description: description.trim() || null,
        specifications,
        price_mode: priceMode,
        price: price ? parseFloat(price) : null,
        currency,
        is_active: isActive,
        is_featured: isFeatured,
        sort_order: parseInt(sortOrder) || 0,
        whatsapp_message_override: whatsappOverride.trim() || null,
      };

      if (mode === "edit" && product) {
        const { error: updateError } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (updateError) {
          if (updateError.message.includes("duplicate") || updateError.message.includes("unique")) {
            setError("El slug ya existe. Elija otro.");
          } else {
            setError(`Error al actualizar: ${updateError.message}`);
          }
          setLoading(false);
          return;
        }
      } else {
        const { error: insertError } = await supabase
          .from("products")
          .insert(productData);

        if (insertError) {
          if (insertError.message.includes("duplicate") || insertError.message.includes("unique")) {
            setError("El slug ya existe. Elija otro.");
          } else {
            setError(`Error al crear: ${insertError.message}`);
          }
          setLoading(false);
          return;
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/productos");
        router.refresh();
      }, 800);
    } catch {
      setError("Error inesperado. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {mode === "edit" ? "Editar Producto" : "Nuevo Producto"}
          </h1>
          {product && (
            <p className="mt-1 text-sm text-slate-400">ID: {product.id}</p>
          )}
        </div>
        {product && product.is_active && (
          <Link
            href={`/catalogo/${product.slug}`}
            target="_blank"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10"
          >
            <Eye className="size-3" />
            Vista previa
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="size-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          ✓ {mode === "edit" ? "Producto actualizado" : "Producto creado"} correctamente.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Información básica
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-slate-200">
              Nombre *
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyanx"
                placeholder="Nombre del producto"
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-200">
              Slug *
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 font-mono text-white outline-none transition placeholder:text-slate-500 focus:border-cyanx"
                placeholder="slug-del-producto"
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-200">
              SKU
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 font-mono text-white outline-none transition placeholder:text-slate-500 focus:border-cyanx"
                placeholder="ABC-123"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-200">
              Categoría
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-white outline-none focus:border-cyanx"
              >
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-4 grid gap-1.5 text-sm font-medium text-slate-200">
            Descripción corta *
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyanx"
              placeholder="Breve descripción para la tarjeta del catálogo"
              required
            />
          </label>
          <label className="mt-4 grid gap-1.5 text-sm font-medium text-slate-200">
            Descripción completa
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyanx"
              placeholder="Descripción detallada del producto (soporta Markdown)"
            />
          </label>
        </div>

        {/* Pricing */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Precio
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-1.5 text-sm font-medium text-slate-200">
              Modo de precio
              <select
                value={priceMode}
                onChange={(e) => setPriceMode(e.target.value as PriceMode)}
                className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-white outline-none focus:border-cyanx"
              >
                <option value="request_quote">Consultar precio</option>
                <option value="fixed">Precio fijo</option>
                <option value="from">Desde $X</option>
                <option value="hidden">Ocultar precio</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-200">
              Precio
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyanx"
                placeholder="0.00"
                disabled={priceMode === "request_quote" || priceMode === "hidden"}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-200">
              Moneda
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-white outline-none focus:border-cyanx"
              >
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
              </select>
            </label>
          </div>
        </div>

        {/* Specifications */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Especificaciones técnicas
          </h2>
          {Object.entries(specifications).length > 0 && (
            <div className="mb-4 space-y-2">
              {Object.entries(specifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2"
                >
                  <span className="flex-1 text-sm font-medium text-slate-300">{key}</span>
                  <span className="flex-1 text-sm text-white">{value}</span>
                  <button
                    type="button"
                    onClick={() => removeSpec(key)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyanx"
              placeholder="Nombre (ej: Voltaje)"
            />
            <input
              type="text"
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyanx"
              placeholder="Valor (ej: 220V)"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSpec();
                }
              }}
            />
            <button
              type="button"
              onClick={addSpec}
              className="rounded-xl border border-cyanx/30 bg-cyanx/10 px-3 py-2 text-sm font-medium text-cyanx hover:bg-cyanx/20"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Configuración
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex items-center gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 rounded border-white/30 bg-slate-950 text-cyanx focus:ring-cyanx"
              />
              Activo (visible en catálogo)
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="size-4 rounded border-white/30 bg-slate-950 text-cyanx focus:ring-cyanx"
              />
              Producto destacado
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-200">
              Orden
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-white outline-none focus:border-cyanx"
              />
            </label>
          </div>
        </div>

        {/* WhatsApp Override */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            WhatsApp (opcional)
          </h2>
          <label className="grid gap-1.5 text-sm font-medium text-slate-200">
            Mensaje personalizado
            <textarea
              value={whatsappOverride}
              onChange={(e) => setWhatsappOverride(e.target.value)}
              rows={3}
              className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyanx"
              placeholder="Dejar vacío para usar el mensaje predeterminado"
            />
            <span className="text-xs text-slate-500">
              Si se completa, este mensaje reemplazará al predeterminado al hacer clic en el botón de WhatsApp.
            </span>
          </label>
        </div>

        {/* Image Manager (edit mode only) */}
        {mode === "edit" && product && (
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Imágenes
            </h2>
            <ImageManager productId={product.id} />
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/productos"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="cta-button bg-cyanx text-slate-950 shadow-glow hover:bg-white disabled:opacity-50 disabled:hover:bg-cyanx"
          >
            {loading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {mode === "edit" ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </form>
    </div>
  );
}
