import { NextRequest, NextResponse } from "next/server";

import { generateQuotePdf } from "@/lib/pdf/generate-quote-pdf";
import { formatAddress } from "@/lib/pdf/format-address";
import { loadPdfLogo } from "@/lib/pdf/load-logo";
import { createPdfResponse } from "@/lib/pdf/pdf-response";
import { prepareQuote } from "@/lib/quotations/prepare-quote";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { quoteInputSchema } from "@/lib/validations/quote";

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

    const [{ data: settings }, clientResult] = await Promise.all([
      supabase
        .from("company_settings")
        .select("*")
        .order("updated_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      validation.data.clientId
        ? supabase.from("clients").select("*").eq("id", validation.data.clientId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    const selectedClient = clientResult.data;
    const inlineClient = validation.data.client;
    if (!selectedClient && !inlineClient) {
      return NextResponse.json({ error: "No se encontró el cliente seleccionado." }, { status: 404 });
    }

    const { totals } = prepareQuote(validation.data);
    const client = selectedClient
      ? {
          businessName: selectedClient.business_name,
          contactName: selectedClient.contact_name,
          email: selectedClient.email,
          phone: selectedClient.phone,
          rfc: selectedClient.rfc ?? undefined,
        }
      : {
          businessName: inlineClient?.business_name ?? "",
          contactName: inlineClient?.contact_name ?? "",
          email: inlineClient?.email ?? "",
          phone: inlineClient?.phone ?? "",
          rfc: inlineClient?.rfc,
        };

    const requestedQuoteNumber = request.nextUrl.searchParams.get("quoteNumber");
    const requestedVersion = Number(request.nextUrl.searchParams.get("version"));
    const previewQuoteNumber =
      requestedQuoteNumber?.trim() || `${settings?.quote_prefix ?? "COT"}-VISTA-PREVIA`;
    const previewVersion =
      Number.isInteger(requestedVersion) && requestedVersion > 0 ? requestedVersion : 1;
    const logo = await loadPdfLogo(settings?.logo_url);
    const pdf = await generateQuotePdf({
      quoteNumber: previewQuoteNumber,
      version: previewVersion,
      issueDate: validation.data.issueDate,
      validUntil: validation.data.validUntil,
      status: validation.data.status,
      currency: validation.data.currency,
      company: {
        name: settings?.trade_name ?? "VORTECH",
        legalName: settings?.legal_name,
        rfc: settings?.rfc ?? undefined,
        phone: settings?.phone ?? "",
        email: settings?.email ?? "",
        website: settings?.website ?? undefined,
        address: formatAddress(settings?.address),
        responsibleName: settings?.responsible_name ?? undefined,
        logo,
      },
      client,
      items: validation.data.items.map((item, index) => ({
        name: item.name,
        description: item.description || undefined,
        sku: item.sku || undefined,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        discount: totals.items[index]?.discountAmount,
        tax: totals.items[index]?.taxAmount,
        withholding: totals.items[index]?.withholdingAmount,
        lineTotal: totals.items[index]?.lineTotal ?? 0,
      })),
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      taxTotal: totals.taxTotal,
      withholdingTotal: totals.withholdingTotal,
      shippingTotal: totals.shippingTotal,
      grandTotal: totals.grandTotal,
      notes: validation.data.notes || undefined,
      terms: validation.data.terms || undefined,
      footer: settings?.pdf_footer ?? undefined,
    });

    return createPdfResponse(pdf, "vista-previa-cotizacion.pdf", "inline");
  } catch (error) {
    console.error("[quote-preview]", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo generar la vista previa." },
      { status: 500 }
    );
  }
}
