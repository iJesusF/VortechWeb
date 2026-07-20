"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/supabase/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const cover = sorted.find((i) => i.is_cover) ?? sorted[0];
  const [active, setActive] = useState<ProductImage | null>(cover ?? null);

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
        <span className="text-6xl text-slate-700" aria-hidden="true">⚙</span>
      </div>
    );
  }

  const current = active ?? sorted[0];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <Image
          src={current.public_url}
          alt={current.alt_text || productName}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Galería de imágenes">
          {sorted.map((img) => (
            <button
              key={img.id}
              onClick={() => setActive(img)}
              role="listitem"
              className={`relative size-16 shrink-0 overflow-hidden rounded-xl border transition ${
                current.id === img.id
                  ? "border-cyanx ring-2 ring-cyanx/30"
                  : "border-white/10 hover:border-white/30"
              }`}
              aria-label={img.alt_text || `Imagen ${img.sort_order + 1}`}
              aria-current={current.id === img.id}
            >
              <Image
                src={img.public_url}
                alt={img.alt_text || productName}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
