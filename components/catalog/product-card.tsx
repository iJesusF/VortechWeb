import Image from "next/image";
import Link from "next/link";
import { CircuitBoard, Star } from "lucide-react";
import { AddToQuoteButton } from "@/components/quote-cart/add-to-quote-button";
import { PriceDisplay } from "@/components/catalog/price-display";
import { WhatsAppButton } from "@/components/catalog/whatsapp-button";
import { getEffectivePrice, getEffectivePriceMode } from "@/lib/catalog/utils";
import { siteConfig } from "@/lib/site-config";
import type { ProductWithRelations } from "@/lib/types/database";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const cover = product.product_images.find((image) => image.is_cover) ?? product.product_images[0];
  const imageUrl = cover?.public_url ?? product.image_url;
  const price = getEffectivePrice(product.price, product.unit_price);
  const priceMode = getEffectivePriceMode(product.price_mode, product.price, product.unit_price);
  const productPath = `/catalogo/${product.slug}`;

  return <article className="glass-panel group flex h-full flex-col overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:border-cyanx/40"><Link href={productPath} className="relative block aspect-video overflow-hidden border-b border-white/10 bg-white/[0.02]">{imageUrl ? <Image src={imageUrl} alt={cover?.alt_text || product.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 33vw" unoptimized /> : <span className="flex h-full items-center justify-center"><CircuitBoard className="size-12 text-cyanx/30" /></span>}{product.is_featured && <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-cyanx px-2 py-1 text-xs font-bold text-slate-950"><Star className="size-3 fill-current" />Destacado</span>}</Link><div className="flex flex-1 flex-col p-5"><Link href={productPath}><h2 className="font-bold text-white transition hover:text-cyanx">{product.name}</h2></Link>{product.sku && <p className="mt-1 font-mono text-xs text-slate-500">SKU: {product.sku}</p>}<p className="mt-3 flex-1 text-sm leading-6 text-slate-300">{product.short_description || "Consulta características, disponibilidad y opciones de suministro."}</p><div className="mt-4"><PriceDisplay priceMode={priceMode} price={price} currency={product.currency} discountType={product.discount_type} discountValue={product.discount_value} taxRate={product.tax_rate} compact /></div><AddToQuoteButton product={{ id: product.id, name: product.name, slug: product.slug, sku: product.sku, unit_price: priceMode === "fixed" || priceMode === "from" ? price : null, image_url: imageUrl }} /><div className="mt-2"><WhatsAppButton productName={product.name} sku={product.sku} productUrl={`${siteConfig.website}${productPath}`} whatsappNumber={siteConfig.whatsapp} customMessage={product.whatsapp_message_override} compact /></div></div></article>;
}
