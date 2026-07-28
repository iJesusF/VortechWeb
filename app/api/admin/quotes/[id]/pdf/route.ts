import { NextResponse } from "next/server";
import { z } from "zod";

import { generateQuotePdf } from "@/lib/pdf/generate-quote-pdf";
import { createPdfResponse } from "@/lib/pdf/pdf-response";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Identificador de cotización inválido." }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Sesión administrativa no válida." }, { status: 401 });
    }

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (quoteError) {
      return NextResponse.json({ error: quoteError.message }, { status: 500 });
    }
    if (!quote) {
      return NextResponse.json({ error: "La cotización no existe." }, { status: 404 });
    }

    const [{ data: client }, { data: items }, { data: settings }] = await Promise.all([
      supabase.from("clients").select("*").eq("id", quote.client_id).maybeSingle(),
      supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", quote.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("company_settings")
        .select("*")
        .order("updated_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    if (!client) {
      return NextResponse.json({ error: "No se encontró el cliente de la cotización." }, { status: 500 });
    }

    const pdf = await generateQuotePdf({
      quoteNumber: quote.quote_number,
      version: quote.version,
      issueDate: quote.issue_date,
      validUntil: quote.valid_until,
      status: quote.status,
      company: {
        name: settings?.trade_name ?? "VORTECH",
        legalName: settings?.legal_name,
        rfc: settings?.rfc ?? undefined,
        phone: settings?.phone ?? "",
        email: settings?.email ?? "",
        website: settings?.website ?? undefined,
      },
      client: {
        businessName: client.business_name,
        contactName: client.contact_name,
        email: client.email,
        phone: client.phone,
        rfc: client.rfc ?? undefined,
      },
      items: (items ?? []).map((item) => ({
        name: item.name,
        description: item.description ?? undefined,
        sku: item.sku ?? undefined,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unit_price,
        lineTotal: item.line_total,
      })),
      subtotal: quote.subtotal,
      discountTotal: quote.discount_total,
      taxTotal: quote.tax_total,
      withholdingTotal: quote.withholding_total,
      shippingTotal: quote.shipping_total,
      grandTotal: quote.grand_total,
      notes: quote.notes ?? undefined,
      terms: quote.terms ?? undefined,
      footer: settings?.pdf_footer ?? undefined,
    });

    const { error: eventError } = await supabase.from("quote_events").insert({
      quote_id: quote.id,
      event_type: "pdf_downloaded",
      metadata: { downloaded_by: user.id },
    });
    if (eventError) {
      console.error("[quote-pdf]", {
        event: "pdf_event_failed",
        quoteId: quote.id,
        code: eventError.code,
        message: eventError.message,
      });
    }

    return createPdfResponse(pdf, `cotizacion-${quote.quote_number}.pdf`, "attachment");
  } catch (error) {
    console.error("[quote-pdf]", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo generar el PDF." },
      { status: 500 }
    );
  }
}
