import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { ProductWithCategory } from "@/lib/types/database";
import { PriceDisplay } from "./price-display";

interface ProductCardProps {
  product: ProductWithCategory;
  coverImage?: string;
}

export function ProductCard({ product, coverImage }: ProductCardProps) {
  return (
    <Link
      href={`/catalogo/${product.slug}`}
      className="glass-panel group relative flex flex-col overflow-hidden rounded-[1.75rem] transition duration-300 hover:-translate-y-1 hover:border-cyanx/40 hover:shadow-glow"
    >
      {/* Featured Badge */}
      {product.is_featured && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border border-cyanx/40 bg-cyanx/15 px-2.5 py-1 backdrop-blur-sm">
          <Star className="size-3 fill-cyanx text-cyanx" />
          <span className="text-xs font-semibold text-cyanx">Destacado</span>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900/50">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="grid size-16 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <span className="text-2xl font-bold text-slate-600">
                {product.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {product.category && (
          <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyanx/80">
            {product.category.name}
          </span>
        )}
        <h3 className="text-base font-bold text-white group-hover:text-cyanx transition-colors">
          {product.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400 line-clamp-2">
          {product.short_description}
        </p>
        <div className="mt-4 pt-3 border-t border-white/5">
          <PriceDisplay
            priceMode={product.price_mode}
            price={product.price}
            currency={product.currency}
          />
        </div>
      </div>
    </Link>
  );
}
