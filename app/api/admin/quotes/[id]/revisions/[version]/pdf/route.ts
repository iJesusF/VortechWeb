import { NextResponse } from "next/server";
import { z } from "zod";

import { formatAddress } from "@/lib/pdf/format-address";
import { generateQuotePdf } from "@/lib/pdf/generate-quote-pdf";
import { loadPdfLogo } from "@/lib/pdf/load-logo";
import { createPdfResponse } from "@/lib/pdf/pdf-response";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string; version: string }>;
}

const revisionSnapshotSchema = z.object({
  quote: z.object({
    quote_number: z.string(),
    version: z.number().int().positive(),
    issue_date: z.string(),
    valid_until: z.string(),
    status: z.string(),
    currency: z.string(),
    subtotal: z.number(),
    discount_total: z.number(),
    tax_total: z.number(),
    withholding_total: z.number(),
    shipping_total: z.number(),
    grand_total: z.number(),
    notes: z.string().nullable(),
    terms: z.string().nullable(),
  }),
  client: z.object({
    business_name: z.string(),
    contact_name: z.string(),
    email: z.string(),
    phone: z.string(),
    rfc: z.string().nullable(),
  }),
  items: z.array(
    z.object({
      name: z.string(),
      description: z.string().nullable(),
      sku: z.string().nullable(),
      quantity: z.number(),
      unit: z.string(),
      unit_price: z.number(),
      line_total: z.number(),
    })
  ),
});

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id, version } = await context.params;
    const parsedVersion = z.coerce.number().int().positive().safeParse(version);
    if (!z.string().uuid().safeParse(id).success || !parsedVersion.success) {
      return NextResponse.json(
        { error: "Identificador de revisión inválido." },
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

    const [{ data: revision, error: revisionError }, { data: settings }] =
      await Promise.all([
        supabase
          .from("quote_revisions")
          .select("snapshot")
          .eq("quote_id", id)
          .eq("version", parsedVersion.data)
          .maybeSingle(),
        supabase
          .from("company_settings")
          .select("*")
          .order("updated_at", { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

    if (revisionError) {
      return NextResponse.json(
        { error: `Supabase no pudo leer la revisión: ${revisionError.message}` },
        { status: 500 }
      );
    }
    if (!revision) {
      return NextResponse.json({ error: "La revisión no existe." }, { status: 404 });
    }

    const snapshot = revisionSnapshotSchema.safeParse(revision.snapshot);
    if (!snapshot.success) {
      return NextResponse.json(
        { error: "La instantánea de esta revisión no tiene el formato esperado." },
        { status: 500 }
      );
    }

    const { quote, client, items } = snapshot.data;
    const logo = await loadPdfLogo(settings?.logo_url);
    const pdf = await generateQuotePdf({
      quoteNumber: quote.quote_number,
      version: quote.version,
      issueDate: quote.issue_date,
      validUntil: quote.valid_until,
      status: quote.status,
      currency: quote.currency,
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
      client: {
        businessName: client.business_name,
        contactName: client.contact_name,
        email: client.email,
        phone: client.phone,
        rfc: client.rfc ?? undefined,
      },
      items: items.map((item) => ({
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

    return createPdfResponse(
      pdf,
      `cotizacion-${quote.quote_number}-R${quote.version}.pdf`,
      "attachment"
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo generar el PDF histórico.",
      },
      { status: 500 }
    );
  }
}
