"use client";

import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import type { ProductWithImages, ProductWithCategory } from "@/lib/types/database";
import { ImageGallery } from "./image-gallery";
import { PriceDisplay } from "./price-display";
import { WhatsAppButton } from "./whatsapp-button";
import { ProductCard } from "./product-card";

interface ProductDetailProps {
  product: ProductWithImages;
  relatedProducts: ProductWithCategory[];
  relatedCoverImages: Record<string, string>;
}

export function ProductDetail({
  product,
  relatedProducts,
  relatedCoverImages,
}: ProductDetailProps) {
  const specs = product.specifications as Record<string, string>;
  const hasSpecs = Object.keys(specs).length > 0;

  return (
    <div>
      {/* Back link */}
      <Link
        href="/catalogo"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-cyanx"
      >
        <ArrowLeft className="size-4" />
        Volver al catálogo
      </Link>

      {/* Main product section */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image Gallery */}
        <ImageGallery images={product.product_images || []} productName={product.name} />

        {/* Product Info */}
        <div className="flex flex-col">
          {product.category && (
            <span className="mb-3 text-xs font-semibold uppercase tracking-wider text-cyanx/80">
              {product.category.name}
            </span>
          )}

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {product.name}
          </h1>

          {product.sku && (
            <p className="mt-2 text-sm text-slate-400">
              SKU: <span className="font-mono text-slate-300">{product.sku}</span>
            </p>
          )}

          <p className="mt-4 text-base leading-relaxed text-slate-300">
            {product.short_description}
          </p>

          {/* Price */}
          <div className="mt-6">
            <PriceDisplay
              priceMode={product.price_mode}
              price={product.price}
              currency={product.currency}
              className="text-lg"
            />
          </div>

          {/* WhatsApp Button */}
          <div className="mt-8">
            <WhatsAppButton product={product} />
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 border-t border-white/10 pt-6">
              <h2 className="mb-3 text-lg font-semibold text-white">Descripción</h2>
              <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}

          {/* Specifications */}
          {hasSpecs && (
            <div className="mt-8 border-t border-white/10 pt-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Especificaciones Técnicas
              </h2>
              <dl className="grid gap-2">
                {Object.entries(specs).map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-[1fr_1fr] gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                  >
                    <dt className="text-sm font-medium text-slate-400">{key}</dt>
                    <dd className="text-sm font-medium text-white">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <div className="mb-8 flex items-center gap-3">
            <MessageCircle className="size-5 text-cyanx" />
            <h2 className="text-2xl font-bold text-white">Productos Relacionados</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                coverImage={relatedCoverImages[p.id]}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
