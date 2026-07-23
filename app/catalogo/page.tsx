import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/motion";
import { demoCategories, demoProducts } from "@/lib/data/catalog-demo";
import { AddToQuoteButton } from "@/components/quote-cart/add-to-quote-button";
import { CircuitBoard } from "lucide-react";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Catálogo de productos y soluciones industriales VORTECH: automatización, tratamiento de agua, medición y tableros.",
  robots: { index: true, follow: true },
};

export default function CatalogoPage() {
  const activeCategories = demoCategories.filter((c) => c.is_active).sort((a, b) => a.sort_order - b.sort_order);
  const activeProducts = demoProducts.filter((p) => p.is_active);

  return (
    <>
      <Header />
      <main className="overflow-hidden pt-24 sm:pt-32">
        <section className="container-shell pb-10">
          <Reveal>
            <span className="section-eyebrow">Catálogo de productos</span>
            <h1 className="section-title">Equipos y soluciones para tu operación</h1>
            <p className="section-copy">
              Explora nuestro catálogo de productos industriales. Los precios y disponibilidad serán confirmados mediante una cotización formal.
            </p>
          </Reveal>
        </section>

        {activeCategories.map((category) => {
          const categoryProducts = activeProducts
            .filter((p) => p.category_id === category.id)
            .sort((a, b) => a.sort_order - b.sort_order);

          if (categoryProducts.length === 0) return null;

          return (
            <section key={category.id} className="container-shell scroll-mt-28 py-10">
              <Reveal>
                <h2 className="mb-2 text-2xl font-bold text-white">{category.name}</h2>
                <p className="mb-8 text-sm text-slate-400">{category.description}</p>
              </Reveal>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categoryProducts.map((product, idx) => (
                  <Reveal key={product.id} delay={idx * 0.05}>
                    <article className="glass-panel group flex h-full flex-col overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:border-cyanx/40">
                      {/* Image placeholder */}
                      <div className="flex h-40 items-center justify-center border-b border-white/10 bg-white/[0.02]">
                        <CircuitBoard className="size-12 text-cyanx/40" aria-hidden="true" />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <Link href={`/catalogo/${product.slug}`} className="hover:text-cyanx">
                          <h3 className="text-base font-bold text-white transition">{product.name}</h3>
                        </Link>
                        {product.sku && (
                          <p className="mt-1 text-xs text-slate-500">SKU: {product.sku}</p>
                        )}
                        <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">
                          {product.short_description}
                        </p>
                        <div className="mt-4 flex items-center justify-between gap-2">
                          {product.unit_price ? (
                            <span className="text-sm font-semibold text-cyanx">
                              {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(product.unit_price)}
                              <span className="text-xs text-slate-500"> / {product.unit}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">Consultar precio</span>
                          )}
                        </div>
                        <AddToQuoteButton product={product} />
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })}

        <section className="container-shell py-16">
          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
              <p className="text-sm text-slate-400">
                Los precios mostrados son referenciales. La disponibilidad y precios finales serán confirmados mediante una cotización formal.
              </p>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
