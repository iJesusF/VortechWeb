"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { validateImageFile, generateUniqueFileName } from "@/lib/utils";
import {
  Upload,
  Trash2,
  Star,
  GripVertical,
  Loader2,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import type { ProductImage } from "@/lib/types/database";

interface ImageManagerProps {
  productId: string;
}

export function ImageManager({ productId }: ImageManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState(true);

  const fetchImages = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    setImages((data || []) as ProductImage[]);
    setLoadingImages(false);
  }, [productId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0 || uploading) return;

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    const supabase = createClient();
    const totalFiles = files.length;
    let uploaded = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);

      if (!validation.valid) {
        setError(`${file.name}: ${validation.error}`);
        continue;
      }

      const fileName = generateUniqueFileName(file.name);
      const storagePath = `${productId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(storagePath, file);

      if (uploadError) {
        setError(`Error al subir ${file.name}: ${uploadError.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(storagePath);

      const isFirstImage = images.length === 0 && uploaded === 0;

      await supabase.from("product_images").insert({
        product_id: productId,
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        alt_text: null,
        sort_order: images.length + uploaded,
        is_cover: isFirstImage,
      });

      uploaded++;
      setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
    }

    setUploading(false);
    setUploadProgress(0);
    fetchImages();
  }

  async function setCover(imageId: string) {
    const supabase = createClient();

    // Remove current cover
    await supabase
      .from("product_images")
      .update({ is_cover: false })
      .eq("product_id", productId);

    // Set new cover
    await supabase
      .from("product_images")
      .update({ is_cover: true })
      .eq("id", imageId);

    fetchImages();
  }

  async function deleteImage(image: ProductImage) {
    const supabase = createClient();

    // Delete from storage
    await supabase.storage.from("product-images").remove([image.storage_path]);

    // Delete from database
    await supabase.from("product_images").delete().eq("id", image.id);

    fetchImages();
  }

  async function updateAltText(imageId: string, altText: string) {
    const supabase = createClient();
    await supabase
      .from("product_images")
      .update({ alt_text: altText })
      .eq("id", imageId);
  }

  async function moveImage(imageId: string, direction: "up" | "down") {
    const idx = images.findIndex((img) => img.id === imageId);
    if (idx === -1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const supabase = createClient();
    const currentOrder = images[idx].sort_order;
    const targetOrder = images[targetIdx].sort_order;

    await Promise.all([
      supabase.from("product_images").update({ sort_order: targetOrder }).eq("id", images[idx].id),
      supabase.from("product_images").update({ sort_order: currentOrder }).eq("id", images[targetIdx].id),
    ]);

    fetchImages();
  }

  if (loadingImages) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-cyanx" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          <AlertCircle className="size-4" />
          {error}
        </div>
      )}

      {/* Upload area */}
      <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-white/10 py-8 transition hover:border-cyanx/30 hover:bg-cyanx/5">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <>
            <Loader2 className="size-8 animate-spin text-cyanx" />
            <p className="text-sm text-slate-300">Subiendo... {uploadProgress}%</p>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-cyanx transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <Upload className="size-8 text-slate-400" />
            <p className="text-sm text-slate-300">
              Haga clic o arrastre imágenes aquí
            </p>
            <p className="text-xs text-slate-500">
              JPG, PNG, WebP o AVIF. Máx. 5 MB
            </p>
          </>
        )}
      </label>

      {/* Image grid */}
      {images.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, idx) => (
            <div
              key={image.id}
              className={`relative overflow-hidden rounded-xl border transition ${
                image.is_cover
                  ? "border-cyanx/50 shadow-glow"
                  : "border-white/10"
              }`}
            >
              <div className="relative aspect-square">
                <Image
                  src={image.public_url}
                  alt={image.alt_text || "Product image"}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                {image.is_cover && (
                  <span className="absolute left-2 top-2 rounded-full bg-cyanx px-2 py-0.5 text-[10px] font-bold text-slate-950">
                    Portada
                  </span>
                )}
              </div>
              <div className="space-y-2 bg-slate-900/80 p-3">
                <input
                  type="text"
                  defaultValue={image.alt_text || ""}
                  placeholder="Texto alternativo"
                  onBlur={(e) => updateAltText(image.id, e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-2 py-1 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyanx"
                />
                <div className="flex items-center gap-1">
                  {!image.is_cover && (
                    <button
                      onClick={() => setCover(image.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-cyanx/10 hover:text-cyanx"
                      title="Establecer como portada"
                    >
                      <Star className="size-3.5" />
                    </button>
                  )}
                  {idx > 0 && (
                    <button
                      onClick={() => moveImage(image.id, "up")}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                      title="Mover arriba"
                    >
                      <GripVertical className="size-3.5 -rotate-90" />
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      onClick={() => moveImage(image.id, "down")}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                      title="Mover abajo"
                    >
                      <GripVertical className="size-3.5 rotate-90" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteImage(image)}
                    className="ml-auto rounded-lg p-1.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                    title="Eliminar"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-6 text-center">
          <ImageIcon className="mb-2 size-8 text-slate-500" />
          <p className="text-sm text-slate-400">Sin imágenes</p>
        </div>
      )}
    </div>
  );
}
