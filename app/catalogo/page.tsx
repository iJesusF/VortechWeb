import Link from "next/link";
import { Header } from "@/components/header";
import { AddToQuotation } from "@/components/add-to-quotation";
import { catalogProducts, getProductUrl } from "@/lib/catalog";

export default function CatalogPage() {
  return <><Header /><main className="container-shell pt-32 pb-20"><span className="section-eyebrow">Catálogo técnico</span><h1 className="section-title">Equipos y soluciones para revisión comercial.</h1><p className="section-copy">Agrega conceptos a una solicitud. Los precios y disponibilidad serán confirmados mediante una cotización formal.</p><div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{catalogProducts.filter((product) => product.isActive).map((product) => <article key={product.id} className="glass-panel rounded-3xl p-6"><p className="text-xs font-bold uppercase tracking-widest text-cyanx">{product.category}</p><h2 className="mt-3 text-xl font-bold text-white"><Link href={getProductUrl(product.slug)} className="hover:text-cyanx">{product.name}</Link></h2><p className="mt-2 text-sm text-slate-400">SKU: {product.sku}</p><p className="mt-4 text-slate-300">{product.description}</p><AddToQuotation product={product} /></article>)}</div></main></>;
}
