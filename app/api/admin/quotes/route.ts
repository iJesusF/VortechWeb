import { NextRequest, NextResponse } from "next/server";

import { prepareQuote } from "@/lib/quotations/prepare-quote";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";
import { quoteInputSchema } from "@/lib/validations/quote";

function readCreatedQuote(value: Json) {
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  const id = value.id;
  const quoteNumber = value.quote_number;
  if (typeof id !== "string" || typeof quoteNumber !== "string") return null;
  return { id, quoteNumber };
}
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Sesión administrativa no válida." }, { status: 401 });
    }

    const validation = quoteInputSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message ?? "La cotización no es válida." },
        { status: 400 }
      );
    }

    const { totals, rpcItems } = prepareQuote(validation.data);
    const clientJson: Json | null = validation.data.client
      ? {
          ...validation.data.client,
          rfc: validation.data.client.rfc ?? null,
          tax_regime: validation.data.client.tax_regime ?? null,
          cfdi_use: validation.data.client.cfdi_use ?? null,
          fiscal_zip_code: validation.data.client.fiscal_zip_code ?? null,
          notes: validation.data.client.notes ?? null,
        }
      : null;

    const { data, error } = await supabase.rpc("create_quote_with_items", {
      _client_id: validation.data.clientId ?? null,
      _client: clientJson,
      _request_id: validation.data.requestId ?? null,
      _status: validation.data.status,
      _currency: validation.data.currency,
      _issue_date: validation.data.issueDate,
      _valid_until: validation.data.validUntil,
      _subtotal: totals.subtotal,
      _discount_total: totals.discountTotal,
      _shipping_total: totals.shippingTotal,
      _tax_total: totals.taxTotal,
      _withholding_total: totals.withholdingTotal,
      _payment_fee_total: totals.paymentFeeTotal,
      _grand_total: totals.grandTotal,
      _notes: validation.data.notes,
      _terms: validation.data.terms,
      _internal_notes: validation.data.internalNotes,
      _items: rpcItems,
    });

    if (error) {
      console.error("[admin-quotes]", {
        event: "quote_creation_failed",
        code: error.code,
        message: error.message,
      });
      return NextResponse.json(
        { error: `Supabase no pudo crear la cotización: ${error.message}` },
        { status: 500 }
      );
    }

    const quote = readCreatedQuote(data);
    if (!quote) {
      return NextResponse.json(
        { error: "Supabase creó una respuesta inesperada para la cotización." },
        { status: 500 }
      );
    }

    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    console.error("[admin-quotes]", {
      event: "unexpected_quote_creation_error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo crear la cotización." },
      { status: 500 }
    );
  }
}
