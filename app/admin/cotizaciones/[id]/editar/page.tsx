import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { z } from "zod";

import { QuoteBuilder } from "@/components/admin/quote-builder";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditarCotizacionPage({ params }: PageProps) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const supabase = await createServerSupabaseClient();
  const [
    { data: quote, error: quoteError },
    { data: items, error: itemsError },
    { data: clients, error: clientsError },
    { data: products, error: productsError },
    { data: settings, error: settingsError },
  ] = await Promise.all([
    supabase.from("quotes").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("clients")
      .select("*")
      .eq("is_active", true)
      .order("business_name", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, description, sku, price, unit_price, unit, tax_rate, price_mode")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase
      .from("company_settings")
      .select("*")
      .order("updated_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!quote && !quoteError) notFound();

  const loadError =
    quoteError ?? itemsError ?? clientsError ?? productsError ?? settingsError;
  if (!quote || loadError) {
    return (
      <div className="max-w-3xl">
        <Link
          href={`/admin/cotizaciones/${id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyanx"
        >
          <ArrowLeft className="size-4" />
          Volver a la cotización
        </Link>
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          Supabase: {loadError?.message ?? "No se pudo cargar la cotización."}
        </div>
      </div>
    );
  }

  return (
    <QuoteBuilder
      clients={clients ?? []}
      products={products ?? []}
      settings={settings}
      quoteRequest={null}
      existingQuote={{ quote, items: items ?? [] }}
    />
  );
}
