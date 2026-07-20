import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { WhatsAppButton } from "@/components/catalog/whatsapp-button";
import { PriceDisplay } from "@/components/catalog/price-display";
import { ProductCard } from "@/components/catalog/product-card";
import { getSiteUrl } from "@/lib/utils";
import type { ProductFull, Json } from "@/lib/supabase/types";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, short_description, product_images(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) return {};

  const coverImage = (product.product_images as { public_url: string; alt_text: string }[])[0];

  return {
    title: product.name,
    description: product.short_description,
    openGraph: {
      title: `${product.name} | VORTECH`,
      description: product.short_description,
      images: coverImage ? [{ url: coverImage.public_url, alt: coverImage.alt_text }] : [],
      type: "website",
    },
  };
}

export const revalidate = 60;

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(`*, categories(*), product_images(*)`)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !product) notFound();

  const typedProduct = product as ProductFull;

  const sortedImages = [...typedProduct.product_images].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  // Fetch related products (same category, excluding this one)
  const { data: related } = await supabase
    .from("products")
    .select(`*, categories(*), product_images(*)`)
    .eq("category_id", typedProduct.category_id)
    .eq("is_active", true)
    .neq("id", typedProduct.id)
    .order("sort_order")
    .limit(3);

  const relatedProducts = ((related ?? []) as ProductFull[]).map((p) => ({
    ...p,
    product_images: [...p.product_images].sort((a, b) => a.sort_order - b.sort_order),
  }));

  const productUrl = getSiteUrl(`/catalogo/${typedProduct.slug}`);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

  const specs = typedProduct.specifications as Record<string, string> | Json;
  const specsEntries =
    specs && typeof specs === "object" && !Array.isArray(specs)
      ? Object.entries(specs as Record<string, string>).filter(([k, v]) => k && v)
      : [];

  return (
    <>
      <Header />
      <main className="pt-28 pb-20">
        <div className="container-shell">
          {/* Breadcrumb */}
          <nav aria-label="Migas de pan" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-white">Inicio</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/catalogo" className="hover:text-white">Catálogo</Link>
              </li>
              {typedProduct.categories && (
                <>
                  <li aria-hidden="true">/</li>
                  <li className="text-slate-500">{typedProduct.categories.name}</li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li className="text-white" aria-current="page">{typedProduct.name}</li>
            </ol>
          </nav>

          {/* Product layout */}
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
            {/* Gallery */}
            <ProductGallery images={sortedImages} productName={typedProduct.name} />

            {/* Info */}
            <div>
              {typedProduct.categories && (
                <span className="section-eyebrow">{typedProduct.categories.name}</span>
              )}

              <h1 className="mt-2 text-3xl font-bold leading-tight text-white sm:text-4xl">
                {typedProduct.name}
              </h1>

              {typedProduct.sku && (
                <p className="mt-2 font-mono text-sm text-slate-500">SKU: {typedProduct.sku}</p>
              )}

              {typedProduct.is_featured && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-cyanx/25 bg-cyanx/10 px-3 py-1 text-xs font-semibold text-cyanx">
                  ★ Producto destacado
                </div>
              )}

              <div className="mt-5">
                <PriceDisplay
                  priceMode={typedProduct.price_mode}
                  price={typedProduct.price}
                  currency={typedProduct.currency}
                />
              </div>

              <p className="mt-5 text-base leading-7 text-slate-300">
                {typedProduct.short_description}
              </p>

              {/* WhatsApp CTA */}
              {whatsappNumber && (
                <div className="mt-6">
                  <WhatsAppButton
                    productName={typedProduct.name}
                    sku={typedProduct.sku}
                    productUrl={productUrl}
                    whatsappNumber={whatsappNumber}
                    customMessage={typedProduct.whatsapp_message_override}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Full description */}
          {typedProduct.description && (
            <section className="mt-14" aria-labelledby="descripcion-heading">
              <h2 id="descripcion-heading" className="mb-5 text-xl font-bold text-white">
                Descripción del producto
              </h2>
              <div className="glass-panel rounded-2xl p-6">
                <p className="whitespace-pre-line leading-7 text-slate-300">{typedProduct.description}</p>
              </div>
            </section>
          )}

          {/* Technical specs */}
          {specsEntries.length > 0 && (
            <section className="mt-10" aria-labelledby="specs-heading">
              <h2 id="specs-heading" className="mb-5 text-xl font-bold text-white">
                Especificaciones técnicas
              </h2>
              <div className="glass-panel overflow-hidden rounded-2xl">
                <table className="w-full" aria-label="Especificaciones técnicas">
                  <tbody className="divide-y divide-white/5">
                    {specsEntries.map(([key, value]) => (
                      <tr key={key}>
                        <th
                          scope="row"
                          className="w-2/5 px-5 py-3 text-left text-sm font-semibold text-slate-300"
                        >
                          {key}
                        </th>
                        <td className="px-5 py-3 text-sm text-slate-400">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Bottom CTA */}
          {whatsappNumber && (
            <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-white">¿Te interesa este producto?</p>
                <p className="mt-1 text-sm text-slate-400">
                  Consulta precio, disponibilidad y opciones de suministro directamente con nuestro equipo.
                </p>
              </div>
              <WhatsAppButton
                productName={typedProduct.name}
                sku={typedProduct.sku}
                productUrl={productUrl}
                whatsappNumber={whatsappNumber}
                customMessage={typedProduct.whatsapp_message_override}
                className="shrink-0"
              />
            </div>
          )}

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16" aria-labelledby="relacionados-heading">
              <h2 id="relacionados-heading" className="mb-6 text-xl font-bold text-white">
                Productos relacionados
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* Back link */}
          <div className="mt-10">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyanx"
            >
              <ArrowLeft className="size-4" />
              Regresar al catálogo
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
