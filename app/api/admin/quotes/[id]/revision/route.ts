import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prepareQuote } from "@/lib/quotations/prepare-quote";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";
import { quoteRevisionInputSchema } from "@/lib/validations/quote";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function readRevisedQuote(value: Json) {
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  const id = value.id;
  const quoteNumber = value.quote_number;
  const version = value.version;
  if (
    typeof id !== "string" ||
    typeof quoteNumber !== "string" ||
    typeof version !== "number"
  ) {
    return null;
  }
  return { id, quoteNumber, version };
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: "Identificador de cotización inválido." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sesión administrativa no válida." },
        { status: 401 }
      );
    }

    const validation = quoteRevisionInputSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json(
        {
          error:
            validation.error.issues[0]?.message ??
            "La revisión de la cotización no es válida.",
        },
        { status: 400 }
      );
    }

    const { totals, rpcItems } = prepareQuote(validation.data);
    const { data, error } = await supabase.rpc("revise_quote_with_items", {
      _quote_id: id,
      _client_id: validation.data.clientId,
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
      _change_notes: validation.data.changeNotes,
    });

    if (error) {
      console.error("[admin-quotes]", {
        event: "quote_revision_failed",
        quoteId: id,
        code: error.code,
        message: error.message,
      });
      return NextResponse.json(
        { error: `Supabase no pudo crear la revisión: ${error.message}` },
        { status: 500 }
      );
    }

    const quote = readRevisedQuote(data);
    if (!quote) {
      return NextResponse.json(
        { error: "Supabase devolvió una respuesta inesperada para la revisión." },
        { status: 500 }
      );
    }

    return NextResponse.json({ quote });
  } catch (error) {
    console.error("[admin-quotes]", {
      event: "unexpected_quote_revision_error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo crear la revisión de la cotización.",
      },
      { status: 500 }
    );
  }
}
