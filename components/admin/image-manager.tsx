"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, ImagePlus, RefreshCw, Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/catalog/utils";
import { imageFileSchema } from "@/lib/validations/product";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { ProductImage } from "@/lib/types/database";

interface ImageManagerProps {
  productId: string;
  initialImages: ProductImage[];
}

export function ImageManager({ productId, initialImages }: ImageManagerProps) {
  const [images, setImages] = useState([...initialImages].sort((a, b) => a.sort_order - b.sort_order));
  const [deleteTarget, setDeleteTarget] = useState<ProductImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const uploadInput = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  function validateFile(file: File): string | null {
    const result = imageFileSchema.safeParse({ type: file.type, size: file.size });
    return result.success ? null : result.error.issues[0]?.message ?? "Imagen inválida";
  }

  async function syncLegacyImageFields(nextImages: ProductImage[]) {
    const sorted = [...nextImages].sort((a, b) => a.sort_order - b.sort_order);
    const cover = sorted.find((image) => image.is_cover) ?? sorted[0] ?? null;
    const { error } = await supabase
      .from("products")
      .update({
        image_url: cover?.public_url ?? null,
        images: sorted.map((image) => image.public_url),
      })
      .eq("id", productId);
    if (error) throw error;
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;
    if (images.length + files.length > 12) {
      setNotice({ type: "error", message: "Se permiten como máximo 12 imágenes por producto." });
      return;
    }

    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setNotice({ type: "error", message: `${file.name}: ${validationError}` });
        return;
      }
    }

    setBusy(true);
    setNotice(null);
    const uploaded: ProductImage[] = [];
    try {
      for (const file of files) {
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const storagePath = `${productId}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(storagePath, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage.from("product-images").getPublicUrl(storagePath);
        const isCover = images.length === 0 && uploaded.length === 0;
        const { data: imageRow, error: rowError } = await supabase
          .from("product_images")
          .insert({
            product_id: productId,
            storage_path: storagePath,
            public_url: publicData.publicUrl,
            alt_text: file.name.replace(/\.[^.]+$/, ""),
            sort_order: images.length + uploaded.length,
            is_cover: isCover,
          })
          .select()
          .single();
        if (rowError) {
          await supabase.storage.from("product-images").remove([storagePath]);
          throw rowError;
        }
        uploaded.push(imageRow);
      }

      const nextImages = [...images, ...uploaded];
      await syncLegacyImageFields(nextImages);
      setImages(nextImages);
      setNotice({ type: "success", message: `${uploaded.length} imagen(es) subida(s).` });
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error, "No se pudieron subir las imágenes.") });
    } finally {
      setBusy(false);
      if (uploadInput.current) uploadInput.current.value = "";
    }
  }

  async function replaceImage(image: ProductImage, file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      setNotice({ type: "error", message: validationError });
      return;
    }

    setBusy(true);
    setNotice(null);
    try {
      const { error: storageError } = await supabase.storage
        .from("product-images")
        .update(image.storage_path, file, { contentType: file.type, upsert: true });
      if (storageError) throw storageError;

      const { data: publicData } = supabase.storage.from("product-images").getPublicUrl(image.storage_path);
      const publicUrl = `${publicData.publicUrl}?v=${Date.now()}`;
      const { data: updated, error: updateError } = await supabase
        .from("product_images")
        .update({ public_url: publicUrl })
        .eq("id", image.id)
        .select()
        .single();
      if (updateError) throw updateError;

      const nextImages = images.map((item) => item.id === image.id ? updated : item);
      await syncLegacyImageFields(nextImages);
      setImages(nextImages);
      setNotice({ type: "success", message: "Imagen reemplazada." });
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error, "No se pudo reemplazar la imagen.") });
    } finally {
      setBusy(false);
    }
  }

  async function setCover(image: ProductImage) {
    if (image.is_cover) return;
    setBusy(true);
    setNotice(null);
    try {
      const { error: coverError } = await supabase.from("product_images").update({ is_cover: true }).eq("id", image.id);
      if (coverError) throw coverError;
      const { error: othersError } = await supabase.from("product_images").update({ is_cover: false }).eq("product_id", productId).neq("id", image.id);
      if (othersError) throw othersError;
      const nextImages = images.map((item) => ({ ...item, is_cover: item.id === image.id }));
      await syncLegacyImageFields(nextImages);
      setImages(nextImages);
      setNotice({ type: "success", message: "Portada actualizada." });
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error, "No se pudo cambiar la portada.") });
    } finally {
      setBusy(false);
    }
  }

  async function moveImage(image: ProductImage, direction: -1 | 1) {
    const index = images.findIndex((item) => item.id === image.id);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const target = images[targetIndex];
    setBusy(true);
    setNotice(null);
    try {
      const [{ error: firstError }, { error: secondError }] = await Promise.all([
        supabase.from("product_images").update({ sort_order: target.sort_order }).eq("id", image.id),
        supabase.from("product_images").update({ sort_order: image.sort_order }).eq("id", target.id),
      ]);
      if (firstError) throw firstError;
      if (secondError) throw secondError;
      const nextImages = [...images];
      nextImages[index] = { ...image, sort_order: target.sort_order };
      nextImages[targetIndex] = { ...target, sort_order: image.sort_order };
      nextImages.sort((a, b) => a.sort_order - b.sort_order);
      await syncLegacyImageFields(nextImages);
      setImages(nextImages);
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error, "No se pudo cambiar el orden.") });
    } finally {
      setBusy(false);
    }
  }

  async function deleteImage() {
    if (!deleteTarget) return;
    setBusy(true);
    setNotice(null);
    try {
      const { error: storageError } = await supabase.storage.from("product-images").remove([deleteTarget.storage_path]);
      if (storageError) throw storageError;
      const { error: rowError } = await supabase.from("product_images").delete().eq("id", deleteTarget.id);
      if (rowError) throw rowError;

      let nextImages = images.filter((image) => image.id !== deleteTarget.id);
      if (deleteTarget.is_cover && nextImages.length > 0) {
        const newCover = nextImages[0];
        const { error: coverError } = await supabase.from("product_images").update({ is_cover: true }).eq("id", newCover.id);
        if (coverError) throw coverError;
        nextImages = nextImages.map((image) => ({ ...image, is_cover: image.id === newCover.id }));
      }
      await syncLegacyImageFields(nextImages);
      setImages(nextImages);
      setDeleteTarget(null);
      setNotice({ type: "success", message: "Imagen eliminada." });
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error, "No se pudo eliminar la imagen.") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {notice && <div className={`rounded-xl border px-4 py-3 text-sm ${notice.type === "error" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>{notice.message}</div>}

      <button type="button" onClick={() => uploadInput.current?.click()} disabled={busy} className="flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-white/15 p-7 text-slate-300 transition hover:border-cyanx/40 hover:bg-cyanx/5 disabled:opacity-50">
        <ImagePlus className="size-8 text-cyanx" /><span className="mt-2 text-sm font-medium">Subir imágenes</span><span className="mt-1 text-xs text-slate-500">JPG, PNG, WebP o AVIF · máximo 5 MB · hasta 12 imágenes</span>
      </button>
      <input ref={uploadInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={(event) => void uploadFiles(Array.from(event.target.files ?? []))} />

      {images.length === 0 ? <p className="text-sm text-slate-500">Este producto todavía no tiene imágenes.</p> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <article key={image.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="relative aspect-video"><Image src={image.public_url} alt={image.alt_text || "Imagen del producto"} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" unoptimized />{image.is_cover && <span className="absolute left-2 top-2 rounded-full bg-cyanx px-2 py-1 text-xs font-bold text-slate-950">Portada</span>}</div>
              <div className="flex items-center justify-between border-t border-white/10 p-2">
                <div className="flex gap-1"><button type="button" onClick={() => void moveImage(image, -1)} disabled={busy || index === 0} className="icon-btn" aria-label="Mover imagen arriba"><ChevronUp className="size-4" /></button><button type="button" onClick={() => void moveImage(image, 1)} disabled={busy || index === images.length - 1} className="icon-btn" aria-label="Mover imagen abajo"><ChevronDown className="size-4" /></button></div>
                <div className="flex gap-1"><label className="icon-btn cursor-pointer" title="Reemplazar"><RefreshCw className="size-4" /><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void replaceImage(image, file); event.target.value = ""; }} /></label><button type="button" onClick={() => void setCover(image)} disabled={busy || image.is_cover} className={`icon-btn ${image.is_cover ? "text-cyanx" : ""}`} aria-label="Usar como portada"><Star className={`size-4 ${image.is_cover ? "fill-current" : ""}`} /></button><button type="button" onClick={() => setDeleteTarget(image)} disabled={busy} className="icon-btn text-red-400" aria-label="Eliminar imagen"><Trash2 className="size-4" /></button></div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog open={deleteTarget !== null} title="Eliminar imagen" message="La imagen se eliminará permanentemente de Supabase Storage y del producto." onConfirm={deleteImage} onCancel={() => setDeleteTarget(null)} busy={busy} />
    </div>
  );
}
