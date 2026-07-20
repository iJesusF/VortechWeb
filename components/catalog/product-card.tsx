import Image from "next/image";
import { Star } from "lucide-react";
import type { ProductFull } from "@/lib/supabase/types";

interface ProductCardProps {
  product: ProductFull;
}

export function ProductCard({ product }: ProductCardProps) {
  const coverImage = product.product_images.find((img) => img.is_cover) ?? product.product_images[0];

  return (
    <a
      href={`/catalogo/${product.slug}`}
      className="glass-panel group relative flex h-full flex-col overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-cyanx/40 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-cyanx focus:ring-offset-2 focus:ring-offset-graphite"
      aria-label={`Ver ${product.name}`}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-white/[0.03]">
        {coverImage ? (
          <Image
            src={coverImage.public_url}
            alt={coverImage.alt_text || product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl text-slate-700">⚙</span>
          </div>
        )}

        {/* Featured badge */}
        {product.is_featured && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-cyanx/90 px-2.5 py-1 text-xs font-semibold text-slate-950">
            <Star className="size-3 fill-slate-950" aria-hidden="true" />
            Destacado
          </div>
        )}

        {/* Category badge */}
        {product.categories && (
          <div className="absolute bottom-2 left-2 rounded-full border border-white/20 bg-graphite/80 px-2.5 py-1 text-xs font-medium text-slate-300 backdrop-blur-sm">
            {product.categories.name}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-bold leading-snug text-white group-hover:text-cyanx transition">
          {product.name}
        </h3>
        {product.sku && (
          <p className="mt-1 font-mono text-xs text-slate-500">SKU: {product.sku}</p>
        )}
        <p className="mt-3 flex-1 text-sm leading-6 text-slate-300">
          {product.short_description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-cyanx transition group-hover:underline">
            Ver detalles →
          </span>
        </div>
      </div>
    </a>
  );
}
