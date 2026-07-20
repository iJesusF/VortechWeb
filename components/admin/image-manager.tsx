"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { validateImageFile } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Upload, Trash2, Star, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import type { ProductImage } from "@/lib/supabase/types";

interface ImageManagerProps {
  productId: string;
  initialImages: ProductImage[];
}

interface UploadProgress {
  file: string;
  progress: number;
}

export function ImageManager({ productId, initialImages }: ImageManagerProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [uploading, setUploading] = useState<UploadProgress[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ProductImage | null>(null);
  const [editingAlt, setEditingAlt] = useState<string | null>(null);
  const [altValue, setAltValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const valid: File[] = [];
    for (const file of files) {
      const { valid: ok, error } = validateImageFile(file);
      if (!ok) { toast.error(`${file.name}: ${error}`); }
      else valid.push(file);
    }
    if (!valid.length) return;

    setUploading(valid.map((f) => ({ file: f.name, progress: 0 })));

    const uploaded: ProductImage[] = [];
    for (let i = 0; i < valid.length; i++) {
      const file = valid[i];
      const ext = file.name.split(".").pop();
      const path = `${productId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        toast.error(`Error subiendo ${file.name}`);
        setUploading((prev) => prev.filter((_, idx) => idx !== i));
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      const isFirstImage = images.length === 0 && uploaded.length === 0;

      const { data: imgRecord, error: dbError } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          storage_path: path,
          public_url: urlData.publicUrl,
          alt_text: file.name.replace(/\.[^.]+$/, ""),
          sort_order: images.length + uploaded.length,
          is_cover: isFirstImage,
        } as Record<string, unknown>)
        .select()
        .single();

      if (dbError) {
        toast.error(`Error guardando ${file.name}`);
        // Cleanup orphaned storage file
        await supabase.storage.from("product-images").remove([path]);
      } else {
        uploaded.push(imgRecord as ProductImage);
      }

      setUploading((prev) =>
        prev.map((u, idx) =>
          idx === i ? { ...u, progress: 100 } : u
        )
      );
    }

    setImages((prev) => [...prev, ...uploaded]);
    setUploading([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (uploaded.length > 0) toast.success(`${uploaded.length} imagen(es) subida(s)`);
  }

  async function setCover(img: ProductImage) {
    if (img.is_cover) return;
    // Remove cover from all, set on selected
    await supabase.from("product_images").update({ is_cover: false } as Record<string, unknown>).eq("product_id", productId);
    await supabase
      .from("product_images")
      .update({ is_cover: true } as Record<string, unknown>)
      .eq("id", img.id);
    setImages((prev) =>
      prev.map((x) => ({ ...x, is_cover: x.id === img.id }))
    );
    toast.success("Imagen de portada actualizada");
  }

  async function moveImage(img: ProductImage, dir: "up" | "down") {
    const idx = images.findIndex((x) => x.id === img.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= images.length) return;

    const other = images[swapIdx];
    const newImages = [...images];
    newImages[idx] = { ...img, sort_order: other.sort_order };
    newImages[swapIdx] = { ...other, sort_order: img.sort_order };
    newImages.sort((a, b) => a.sort_order - b.sort_order);

    setImages(newImages);
    await Promise.all([
      supabase.from("product_images").update({ sort_order: other.sort_order } as Record<string, unknown>).eq("id", img.id),
      supabase.from("product_images").update({ sort_order: img.sort_order } as Record<string, unknown>).eq("id", other.id),
    ]);
  }

  function startEditAlt(img: ProductImage) {
    setEditingAlt(img.id);
    setAltValue(img.alt_text);
  }

  async function saveAlt(imgId: string) {
    await supabase
      .from("product_images")
      .update({ alt_text: altValue } as Record<string, unknown>)
      .eq("id", imgId);
    setImages((prev) => prev.map((x) => (x.id === imgId ? { ...x, alt_text: altValue } : x)));
    toast.success("Texto alternativo guardado");
    setEditingAlt(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    // Delete from storage
    await supabase.storage.from("product-images").remove([deleteTarget.storage_path]);
    // Delete from DB
    const { error } = await supabase.from("product_images").delete().eq("id", deleteTarget.id);
    if (error) { toast.error("Error al eliminar"); setDeleteTarget(null); return; }

    const remaining = images.filter((x) => x.id !== deleteTarget.id);
    // If deleted was cover and there are remaining images, set first as cover
    if (deleteTarget.is_cover && remaining.length > 0) {
      await supabase.from("product_images").update({ is_cover: true } as Record<string, unknown>).eq("id", remaining[0].id);
      remaining[0] = { ...remaining[0], is_cover: true };
    }
    setImages(remaining);
    toast.success("Imagen eliminada");
    setDeleteTarget(null);
  }

  return (
    <div>
      {/* Upload area */}
      <div
        className="mb-5 cursor-pointer rounded-xl border-2 border-dashed border-white/20 p-6 text-center transition hover:border-cyanx/40 hover:bg-cyanx/5"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Subir imágenes"
      >
        <Upload className="mx-auto mb-2 size-8 text-slate-400" />
        <p className="text-sm font-medium text-slate-300">Haz clic para subir imágenes</p>
        <p className="mt-1 text-xs text-slate-500">JPG, PNG, WebP, AVIF · Máx. 5MB · Múltiples archivos</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="mb-4 space-y-2">
          {uploading.map((u) => (
            <div key={u.file} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
              <Loader2 className="size-4 animate-spin text-cyanx" />
              <span className="text-sm text-slate-300">{u.file}</span>
            </div>
          ))}
        </div>
      )}

      {/* Image grid */}
      {images.length === 0 ? (
        <p className="text-sm text-slate-500">No hay imágenes. Sube la primera imagen del producto.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, idx) => (
            <div key={img.id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <div className="relative aspect-video">
                <Image
                  src={img.public_url}
                  alt={img.alt_text || "Imagen del producto"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized
                />
                {img.is_cover && (
                  <div className="absolute left-2 top-2 rounded-full bg-cyanx/90 px-2 py-0.5 text-xs font-semibold text-slate-950">
                    Portada
                  </div>
                )}
              </div>

              <div className="p-3">
                {editingAlt === img.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={altValue}
                      onChange={(e) => setAltValue(e.target.value)}
                      className="admin-input flex-1 text-xs"
                      placeholder="Texto alternativo"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => saveAlt(img.id)}
                      className="icon-btn text-cyanx"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingAlt(null)}
                      className="icon-btn"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditAlt(img)}
                    className="w-full truncate text-left text-xs text-slate-400 hover:text-white"
                    title="Editar texto alternativo"
                  >
                    {img.alt_text || <span className="italic text-slate-600">Sin texto alternativo</span>}
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveImage(img, "up")} disabled={idx === 0} className="icon-btn" title="Subir">
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => moveImage(img, "down")} disabled={idx === images.length - 1} className="icon-btn" title="Bajar">
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setCover(img)}
                    disabled={img.is_cover}
                    className={`icon-btn ${img.is_cover ? "text-cyanx" : ""}`}
                    title="Usar como portada"
                  >
                    <Star className={`size-3.5 ${img.is_cover ? "fill-cyanx" : ""}`} />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(img)} className="icon-btn text-red-400 hover:bg-red-500/10" title="Eliminar">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar imagen"
        message="¿Estás seguro de eliminar esta imagen? Se eliminará permanentemente del almacenamiento."
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />
    </div>
  );
}
