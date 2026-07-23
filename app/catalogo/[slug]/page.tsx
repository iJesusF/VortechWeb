import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircuitBoard } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/motion";
import { demoProducts, demoCategories } from "@/lib/data/catalog-demo";
import { AddToQuoteButton } from "@/components/quote-cart/add-to-quote-button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = demoProducts.find((p) => p.slug === slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.short_description,
  };
}

export function generateStaticParams() {
  return demoProducts.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = demoProducts.find((p) => p.slug === slug && p.is_active);

  if (!product) {
    notFound();
  }

  const category = demoCategories.find((c) => c.id === product.category_id);

  return (
    <>
      <Header />
      <main className="overflow-hidden pt-24 sm:pt-32">
        <section className="container-shell py-10">
          <Reveal>
            <Link
              href="/catalogo"
              className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyanx"
            >
              <ArrowLeft className="size-4" />
              Volver al catálogo
            </Link>
          </Reveal>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Image */}
            <Reveal>
              <div className="flex aspect-square items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                <CircuitBoard className="size-24 text-cyanx/30" aria-hidden="true" />
              </div>
            </Reveal>

            {/* Details */}
            <Reveal delay={0.1}>
              <div>
                {category && (
                  <span className="section-eyebrow">{category.name}</span>
                )}
                <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{product.name}</h1>
                {product.sku && (
                  <p className="mt-2 text-sm text-slate-500">SKU: {product.sku}</p>
                )}

                <p className="mt-6 leading-7 text-slate-300">{product.description}</p>

                {/* Price */}
                <div className="mt-6">
                  {product.unit_price ? (
                    <p className="text-2xl font-bold text-cyanx">
                      {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(product.unit_price)}
                      <span className="ml-2 text-sm font-normal text-slate-500">/ {product.unit}</span>
                    </p>
                  ) : (
                    <p className="text-lg text-slate-400">Precio bajo consulta</p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    Precios y disponibilidad sujetos a confirmación mediante cotización formal.
                  </p>
                </div>

                {/* Specifications */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="mt-8">
                    <h2 className="mb-3 text-lg font-semibold text-white">Especificaciones</h2>
                    <dl className="grid gap-2">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2">
                          <dt className="text-sm font-medium text-slate-400">{key}:</dt>
                          <dd className="text-sm text-white">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {/* Add to quote */}
                <div className="mt-8">
                  <AddToQuoteButton product={product} variant="large" />
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
