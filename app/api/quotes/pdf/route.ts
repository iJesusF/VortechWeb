import { NextRequest, NextResponse } from "next/server";
import { generateQuotePdf } from "@/lib/pdf/generate-quote-pdf";
import type { PdfQuoteData } from "@/lib/pdf/generate-quote-pdf";

/**
 * POST /api/quotes/pdf
 *
 * Generates a PDF for a quote. Requires authentication (admin).
 * In production, this validates the user session before generating.
 * The quote data is fetched server-side by ID, never from the client body.
 *
 * For development demo, accepts quote data in the request body.
 */
export async function POST(request: NextRequest) {
  try {
    // In production: verify authentication
    // const supabase = await createServerSupabaseClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();

    // Validate minimal required data
    if (!body.quoteNumber || !body.client || !body.items) {
      return NextResponse.json({ error: "Datos insuficientes para generar PDF" }, { status: 400 });
    }

    const pdfData: PdfQuoteData = {
      quoteNumber: body.quoteNumber,
      version: body.version || 1,
      issueDate: body.issueDate || new Date().toISOString().split("T")[0],
      validUntil: body.validUntil || "",
      status: body.status || "draft",
      company: body.company || {
        name: "VORTECH",
        phone: "+52 6861455822",
        email: "ventas@vortech.mx",
        website: "https://vortech.mx",
      },
      client: body.client,
      items: body.items,
      subtotal: body.subtotal || 0,
      discountTotal: body.discountTotal || 0,
      taxTotal: body.taxTotal || 0,
      withholdingTotal: body.withholdingTotal || 0,
      shippingTotal: body.shippingTotal || 0,
      grandTotal: body.grandTotal || 0,
      notes: body.notes,
      terms: body.terms,
      footer: body.footer,
      publicUrl: body.publicUrl,
    };

    const pdfBuffer = await generateQuotePdf(pdfData);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cotizacion-${pdfData.quoteNumber}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: "Error al generar el PDF" },
      { status: 500 }
    );
  }
}
