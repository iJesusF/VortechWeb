import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AddToQuoteButton } from "@/components/quote-cart/add-to-quote-button";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PriceDisplay } from "@/components/catalog/price-display";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { WhatsAppButton } from "@/components/catalog/whatsapp-button";
import { getEffectivePrice, getEffectivePriceMode } from "@/lib/catalog/utils";
import { siteConfig } from "@/lib/site-config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProductWithRelations } from "@/lib/types/database";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.from("products").select("name, short_description").eq("slug", slug).eq("is_active", true).maybeSingle();
    return data ? { title: data.name, description: data.short_description ?? undefined } : { title: "Producto no encontrado" };
  } catch {
    return { title: "Producto" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("products").select("*, categories(id, name, slug), product_images(*)").eq("slug", slug).eq("is_active", true).maybeSingle();
  if (!data && !error) notFound();
  if (error || !data) return <><Header /><main className="container-shell min-h-[70vh] pt-32"><div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">No se pudo cargar el producto: {error?.message ?? "Producto no encontrado"}</div></main><Footer /></>;

  const product: ProductWithRelations = data;
  if (!product.categories) notFound();
  const { data: relatedData } = await supabase.from("products").select("*, categories(id, name, slug), product_images(*)").eq("category_id", product.category_id).eq("is_active", true).neq("id", product.id).order("sort_order").limit(3);
  const related: ProductWithRelations[] = relatedData ?? [];
  const price = getEffectivePrice(product.price, product.unit_price);
  const priceMode = getEffectivePriceMode(product.price_mode, product.price, product.unit_price);
  const cover = product.product_images.find((image) => image.is_cover) ?? product.product_images[0];
  const imageUrl = cover?.public_url ?? product.image_url;
  const specs = product.specifications && !Array.isArray(product.specifications) && typeof product.specifications === "object" ? Object.entries(product.specifications) : [];
  const productPath = `/catalogo/${product.slug}`;

  return <><Header /><main className="overflow-hidden pt-24 sm:pt-32"><section className="container-shell py-10"><Link href="/catalogo" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyanx"><ArrowLeft className="size-4" />Volver al catálogo</Link><div className="grid gap-10 lg:grid-cols-2"><ProductGallery images={product.product_images} fallbackUrl={product.image_url} productName={product.name} /><div>{product.categories && <span className="section-eyebrow">{product.categories.name}</span>}<h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{product.name}</h1>{product.sku && <p className="mt-2 font-mono text-sm text-slate-500">SKU: {product.sku}</p>}<p className="mt-6 whitespace-pre-line leading-7 text-slate-300">{product.description || product.short_description}</p><div className="mt-7"><PriceDisplay priceMode={priceMode} price={price} currency={product.currency} discountType={product.discount_type} discountValue={product.discount_value} taxRate={product.tax_rate} /></div><div className="mt-8 space-y-3"><AddToQuoteButton variant="large" product={{ id: product.id, name: product.name, slug: product.slug, sku: product.sku, unit_price: priceMode === "fixed" || priceMode === "from" ? price : null, image_url: imageUrl }} /><WhatsAppButton productName={product.name} sku={product.sku} productUrl={`${siteConfig.website}${productPath}`} whatsappNumber={siteConfig.whatsapp} customMessage={product.whatsapp_message_override} /></div></div></div>{specs.length > 0 && <section className="mt-12"><h2 className="mb-5 text-xl font-bold text-white">Especificaciones técnicas</h2><div className="glass-panel overflow-hidden rounded-2xl"><dl className="divide-y divide-white/5">{specs.map(([key, value]) => <div key={key} className="grid grid-cols-[minmax(120px,2fr)_3fr] gap-4 px-5 py-3"><dt className="text-sm font-semibold text-slate-300">{key}</dt><dd className="text-sm text-slate-400">{String(value ?? "")}</dd></div>)}</dl></div></section>}{related.length > 0 && <section className="mt-16"><h2 className="mb-6 text-xl font-bold text-white">Productos relacionados</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}</section></main><Footer /></>;
}
