import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { AddToQuotation } from "@/components/add-to-quotation";
import { catalogProducts } from "@/lib/catalog";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = catalogProducts.find((item) => item.slug === slug && item.isActive);
  if (!product) notFound();
  return <><Header /><main className="container-shell pt-32 pb-20"><Link href="/catalogo" className="text-sm font-semibold text-cyanx">← Volver al catálogo</Link><div className="mt-8 max-w-3xl rounded-3xl border border-white/10 bg-white/[.055] p-8"><p className="text-xs font-bold uppercase tracking-widest text-cyanx">{product.category}</p><h1 className="mt-3 text-4xl font-black text-white">{product.name}</h1><p className="mt-4 text-slate-400">SKU: {product.sku}</p><p className="mt-6 text-lg leading-8 text-slate-300">{product.description}</p><p className="mt-6 rounded-xl border border-cyanx/20 bg-cyanx/10 p-4 text-sm text-cyan-100">Los precios y disponibilidad serán confirmados mediante una cotización formal.</p><AddToQuotation product={product} /></div></main></>;
}
