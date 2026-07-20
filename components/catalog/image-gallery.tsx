"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/types/database";

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_cover && !b.is_cover) return -1;
    if (!a.is_cover && b.is_cover) return 1;
    return a.sort_order - b.sort_order;
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = sortedImages[selectedIndex];

  if (sortedImages.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[2rem] border border-white/10 bg-slate-900/50">
        <div className="text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-2xl border border-white/10 bg-white/5">
            <span className="text-4xl font-bold text-slate-600">
              {productName.charAt(0)}
            </span>
          </div>
          <p className="mt-4 text-sm text-slate-500">Sin imágenes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/50">
        <Image
          src={selectedImage.public_url}
          alt={selectedImage.alt_text || productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Galería de imágenes">
          {sortedImages.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                index === selectedIndex
                  ? "border-cyanx shadow-glow"
                  : "border-white/10 hover:border-white/30"
              }`}
              aria-label={`Ver imagen ${index + 1}`}
              aria-pressed={index === selectedIndex}
            >
              <Image
                src={img.public_url}
                alt={img.alt_text || `${productName} - imagen ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
