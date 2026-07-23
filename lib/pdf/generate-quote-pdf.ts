/**
 * PDF Generation for VORTECH Quotations
 *
 * Uses PDFKit for server-side generation.
 * No browser dependency, no Chromium required.
 * Supports Spanish characters via built-in encoding.
 */

import PDFDocument from "pdfkit";
import { formatMXN } from "@/lib/quotations/calculations";

export interface PdfQuoteData {
  quoteNumber: string;
  version: number;
  issueDate: string;
  validUntil: string;
  status: string;
  company: {
    name: string;
    legalName?: string;
    rfc?: string;
    phone: string;
    email: string;
    website?: string;
    address?: string;
  };
  client: {
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    rfc?: string;
    address?: string;
  };
  items: Array<{
    name: string;
    description?: string;
    sku?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount?: number;
    tax?: number;
    withholding?: number;
    lineTotal: number;
  }>;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  withholdingTotal: number;
  shippingTotal: number;
  grandTotal: number;
  notes?: string;
  terms?: string;
  footer?: string;
  publicUrl?: string;
}

export function generateQuotePdf(data: PdfQuoteData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margin: 50,
        bufferPages: true,
        info: {
          Title: `Cotización ${data.quoteNumber}`,
          Author: data.company.name,
          Subject: `Cotización para ${data.client.businessName}`,
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = doc.page.width - 100; // margins
      const cyanColor = "#13d8ff";
      const darkColor = "#1a1a2e";

      // ─── Header ───────────────────────────────────────────────
      doc.fontSize(20).font("Helvetica-Bold").fillColor(darkColor).text(data.company.name, 50, 50);
      doc.fontSize(8).font("Helvetica").fillColor("#666");
      if (data.company.legalName) doc.text(data.company.legalName);
      if (data.company.rfc) doc.text(`RFC: ${data.company.rfc}`);
      doc.text(`${data.company.email} · ${data.company.phone}`);
      if (data.company.website) doc.text(data.company.website);
      if (data.company.address) doc.text(data.company.address);

      // Quote number - right aligned
      doc.fontSize(14).font("Helvetica-Bold").fillColor(darkColor);
      doc.text(data.quoteNumber, 350, 50, { align: "right", width: pageWidth - 300 });
      doc.fontSize(9).font("Helvetica").fillColor("#666");
      doc.text(`Versión ${data.version}`, 350, 68, { align: "right", width: pageWidth - 300 });

      // Line separator
      const headerY = doc.y + 15;
      doc.moveTo(50, headerY).lineTo(562, headerY).strokeColor(cyanColor).lineWidth(2).stroke();

      // ─── Dates and Client ─────────────────────────────────────
      let y = headerY + 20;

      doc.fontSize(9).font("Helvetica-Bold").fillColor(darkColor);
      doc.text("Fecha de emisión:", 50, y);
      doc.font("Helvetica").text(data.issueDate, 160, y);
      doc.font("Helvetica-Bold").text("Vigencia:", 350, y);
      doc.font("Helvetica").text(data.validUntil, 420, y);

      y += 25;
      doc.fontSize(10).font("Helvetica-Bold").fillColor(darkColor).text("Cliente:", 50, y);
      y += 15;
      doc.fontSize(9).font("Helvetica-Bold").text(data.client.businessName, 50, y);
      y += 12;
      doc.font("Helvetica").fillColor("#444");
      doc.text(data.client.contactName, 50, y);
      y += 12;
      doc.text(`${data.client.email} · ${data.client.phone}`, 50, y);
      if (data.client.rfc) {
        y += 12;
        doc.text(`RFC: ${data.client.rfc}`, 50, y);
      }

      // ─── Items Table ──────────────────────────────────────────
      y += 30;

      // Table header
      doc.rect(50, y, pageWidth, 20).fill("#f0f4f8");
      doc.fontSize(8).font("Helvetica-Bold").fillColor("#333");
      doc.text("#", 55, y + 6, { width: 20 });
      doc.text("Concepto", 75, y + 6, { width: 200 });
      doc.text("Cant.", 290, y + 6, { width: 40, align: "right" });
      doc.text("Unidad", 335, y + 6, { width: 45 });
      doc.text("P. Unit.", 385, y + 6, { width: 70, align: "right" });
      doc.text("Total", 465, y + 6, { width: 90, align: "right" });
      y += 22;

      // Table rows
      doc.font("Helvetica").fontSize(8).fillColor("#333");
      data.items.forEach((item, idx) => {
        // Check if we need a new page
        if (y > 680) {
          doc.addPage();
          y = 50;
        }

        const rowHeight = item.description ? 28 : 16;
        if (idx % 2 === 0) {
          doc.rect(50, y - 2, pageWidth, rowHeight + 4).fill("#fafbfc");
          doc.fillColor("#333");
        }

        doc.text(String(idx + 1), 55, y, { width: 20 });
        doc.font("Helvetica-Bold").text(item.name, 75, y, { width: 210 });
        if (item.sku) {
          doc.font("Helvetica").fontSize(7).fillColor("#888").text(`SKU: ${item.sku}`, 75, y + 10);
          doc.fontSize(8).fillColor("#333");
        }
        doc.font("Helvetica");
        doc.text(String(item.quantity), 290, y, { width: 40, align: "right" });
        doc.text(item.unit, 335, y, { width: 45 });
        doc.text(formatMXN(item.unitPrice), 385, y, { width: 70, align: "right" });
        doc.font("Helvetica-Bold").text(formatMXN(item.lineTotal), 465, y, { width: 90, align: "right" });
        doc.font("Helvetica");

        y += rowHeight + 6;
      });

      // ─── Totals ───────────────────────────────────────────────
      y += 10;
      doc.moveTo(350, y).lineTo(562, y).strokeColor("#ddd").lineWidth(0.5).stroke();
      y += 8;

      const totalsX = 380;
      const totalsValX = 470;

      doc.fontSize(9).font("Helvetica").fillColor("#444");
      doc.text("Subtotal:", totalsX, y);
      doc.text(formatMXN(data.subtotal), totalsValX, y, { width: 90, align: "right" });
      y += 14;

      if (data.discountTotal > 0) {
        doc.text("Descuentos:", totalsX, y);
        doc.fillColor("#c00").text(`-${formatMXN(data.discountTotal)}`, totalsValX, y, { width: 90, align: "right" });
        doc.fillColor("#444");
        y += 14;
      }

      if (data.taxTotal > 0) {
        doc.text("IVA:", totalsX, y);
        doc.text(formatMXN(data.taxTotal), totalsValX, y, { width: 90, align: "right" });
        y += 14;
      }

      if (data.withholdingTotal > 0) {
        doc.text("Retenciones:", totalsX, y);
        doc.fillColor("#c60").text(`-${formatMXN(data.withholdingTotal)}`, totalsValX, y, { width: 90, align: "right" });
        doc.fillColor("#444");
        y += 14;
      }

      if (data.shippingTotal > 0) {
        doc.text("Envío:", totalsX, y);
        doc.text(formatMXN(data.shippingTotal), totalsValX, y, { width: 90, align: "right" });
        y += 14;
      }

      y += 4;
      doc.moveTo(350, y).lineTo(562, y).strokeColor(cyanColor).lineWidth(1).stroke();
      y += 8;
      doc.fontSize(12).font("Helvetica-Bold").fillColor(darkColor);
      doc.text("Total:", totalsX, y);
      doc.text(formatMXN(data.grandTotal), totalsValX, y, { width: 90, align: "right" });

      // ─── Notes and Terms ──────────────────────────────────────
      y += 35;
      if (y > 650) { doc.addPage(); y = 50; }

      if (data.notes) {
        doc.fontSize(9).font("Helvetica-Bold").fillColor(darkColor).text("Notas:", 50, y);
        y += 14;
        doc.font("Helvetica").fontSize(8).fillColor("#444").text(data.notes, 50, y, { width: 300 });
        y = doc.y + 15;
      }

      if (data.terms) {
        doc.fontSize(9).font("Helvetica-Bold").fillColor(darkColor).text("Condiciones:", 50, y);
        y += 14;
        doc.font("Helvetica").fontSize(8).fillColor("#444").text(data.terms, 50, y, { width: 300 });
        y = doc.y + 15;
      }

      // ─── Footer ───────────────────────────────────────────────
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(7).font("Helvetica").fillColor("#999");
        doc.text(
          `${data.company.name} · ${data.company.email} · Página ${i + 1} de ${pages.count}`,
          50,
          740,
          { align: "center", width: pageWidth }
        );
        if (data.footer) {
          doc.text(data.footer, 50, 752, { align: "center", width: pageWidth });
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
