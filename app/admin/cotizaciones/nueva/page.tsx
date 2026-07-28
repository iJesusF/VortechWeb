import { redirect } from "next/navigation";
import { z } from "zod";

import { QuoteBuilder } from "@/components/admin/quote-builder";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<{ request?: string }>;
}
export const dynamic = "force-dynamic";

export default async function NuevaCotizacionPage({ searchParams }: PageProps) {
  const { request: requestId } = await searchParams;
  const supabase = await createServerSupabaseClient();

  const [{ data: clients, error: clientsError }, { data: products }, { data: settings }] =
    await Promise.all([
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

  let quoteRequest = null;
  let requestError = "";
  if (requestId) {
    if (!z.string().uuid().safeParse(requestId).success) {
      requestError = "El identificador de solicitud no es válido.";
    } else {
      const { data, error } = await supabase
        .from("quote_requests")
        .select("*")
        .eq("id", requestId)
        .maybeSingle();
      if (error) {
        requestError = `Supabase: ${error.message}`;
      } else if (!data) {
        requestError = "La solicitud no existe.";
      } else if (data.converted_quote_id) {
        redirect(`/admin/cotizaciones/${data.converted_quote_id}`);
      } else {
        quoteRequest = data;
      }
    }
  }

  return (
    <QuoteBuilder
      clients={clients ?? []}
      products={products ?? []}
      settings={settings}
      quoteRequest={quoteRequest}
      initialError={clientsError ? `Supabase: ${clientsError.message}` : requestError}
    />
  );
}
