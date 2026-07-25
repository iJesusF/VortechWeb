"use client";

import { useState } from "react";
import Image from "next/image";
import { CircuitBoard } from "lucide-react";
import type { ProductImage } from "@/lib/types/database";

interface ProductGalleryProps {
  images: ProductImage[];
  fallbackUrl: string | null;
  productName: string;
}

export function ProductGallery({ images, fallbackUrl, productName }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const initial = sorted.find((image) => image.is_cover) ?? sorted[0] ?? null;
  const [activeId, setActiveId] = useState(initial?.id ?? null);
  const active = sorted.find((image) => image.id === activeId) ?? initial;
  const source = active?.public_url ?? fallbackUrl;

  if (!source) return <div className="flex aspect-square items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]"><CircuitBoard className="size-24 text-cyanx/25" /></div>;

  return <div className="space-y-3"><div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"><Image src={source} alt={active?.alt_text || productName} fill className="object-contain" sizes="(max-width: 1024px) 100vw, 50vw" priority unoptimized /></div>{sorted.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1">{sorted.map((image) => <button key={image.id} type="button" onClick={() => setActiveId(image.id)} className={`relative size-20 shrink-0 overflow-hidden rounded-xl border ${active?.id === image.id ? "border-cyanx ring-2 ring-cyanx/20" : "border-white/10"}`} aria-label={`Ver ${image.alt_text || productName}`}><Image src={image.public_url} alt={image.alt_text || productName} fill className="object-cover" sizes="80px" unoptimized /></button>)}</div>}</div>;
}
