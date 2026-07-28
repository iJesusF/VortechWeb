import PDFDocument from "pdfkit";

export interface PdfQuoteData {
  quoteNumber: string;
  version: number;
  issueDate: string;
  validUntil: string;
  status: string;
  currency: string;
  company: {
    name: string;
    legalName?: string;
    rfc?: string;
    phone: string;
    email: string;
    website?: string;
    address?: string;
    responsibleName?: string;
    logo?: Buffer;
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

interface TextLine {
  text: string;
  font: "Helvetica" | "Helvetica-Bold";
  size: number;
  color: string;
}

const LEFT = 46;
const RIGHT = 566;
const CONTENT_WIDTH = RIGHT - LEFT;
const CONTENT_BOTTOM = 708;
const CYAN = "#13bfe8";
const INK = "#172033";
const MUTED = "#64748b";
const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador / revisión interna",
  sent: "Enviada",
  viewed: "Vista por el cliente",
  accepted: "Aprobada",
  rejected: "Rechazada",
  expired: "Vencida",
  cancelled: "Cancelada",
  payment_pending: "Pendiente de pago",
  paid: "Pagada",
};

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(
    new Date(`${value}T12:00:00`)
  );
}

function normalized(value?: string) {
  return value?.trim() || undefined;
}

export function generateQuotePdf(data: PdfQuoteData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margin: LEFT,
        bufferPages: true,
        info: {
          Title: `Cotización ${data.quoteNumber} R${data.version}`,
          Author: data.company.name,
          Subject: `Cotización para ${data.client.businessName}`,
        },
      });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      function wrapText(
        text: string,
        width: number,
        font: TextLine["font"],
        size: number
      ) {
        doc.font(font).fontSize(size);
        const lines: string[] = [];
        const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
        paragraphs.forEach((paragraph, paragraphIndex) => {
          const words = paragraph.trim().split(/\s+/).filter(Boolean);
          if (words.length === 0) {
            lines.push("");
          } else {
            let line = "";
            words.forEach((word) => {
              const candidate = line ? `${line} ${word}` : word;
              if (line && doc.widthOfString(candidate) > width) {
                lines.push(line);
                line = word;
              } else {
                line = candidate;
              }
            });
            if (line) lines.push(line);
          }
          if (paragraphIndex < paragraphs.length - 1) lines.push("");
        });
        return lines;
      }

      function drawBrand() {
        let logoDrawn = false;
        if (data.company.logo) {
          try {
            doc.image(data.company.logo, LEFT, 45, {
              fit: [145, 58],
              valign: "center",
            });
            logoDrawn = true;
          } catch (error) {
            console.error("[quote-pdf]", {
              event: "logo_render_failed",
              message: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        if (!logoDrawn) {
          doc
            .font("Helvetica-Bold")
            .fontSize(20)
            .fillColor(INK)
            .text(data.company.name, LEFT, 48, { width: 230 });
        }

        const companyLines = [
          data.company.legalName && data.company.legalName !== data.company.name
            ? data.company.legalName
            : undefined,
          data.company.rfc ? `RFC: ${data.company.rfc}` : undefined,
          [data.company.email, data.company.phone].filter(Boolean).join(" · "),
          data.company.website,
          data.company.address,
        ].filter((value): value is string => Boolean(value));
        doc
          .font("Helvetica")
          .fontSize(7.5)
          .fillColor(MUTED)
          .text(companyLines.join("\n"), LEFT, logoDrawn ? 106 : 77, {
            width: 265,
            lineGap: 1,
          });

        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor(CYAN)
          .text("COTIZACIÓN", 350, 47, { width: 216, align: "right" });
        doc
          .font("Helvetica-Bold")
          .fontSize(15)
          .fillColor(INK)
          .text(data.quoteNumber, 350, 61, { width: 216, align: "right" });
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor(CYAN)
          .text(`REVISIÓN R${data.version}`, 350, 82, {
            width: 216,
            align: "right",
          });
        doc
          .font("Helvetica")
          .fontSize(7.5)
          .fillColor(MUTED)
          .text(`Estado: ${STATUS_LABELS[data.status] ?? data.status}`, 350, 99, {
            width: 216,
            align: "right",
          });
        if (data.company.responsibleName) {
          doc.text(`Responsable: ${data.company.responsibleName}`, 350, 112, {
            width: 216,
            align: "right",
          });
        }
      }

      function drawTableHeader(y: number) {
        doc.rect(LEFT, y, CONTENT_WIDTH, 22).fill("#eaf4f8");
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(INK);
        doc.text("#", 51, y + 7, { width: 18 });
        doc.text("CONCEPTO Y DESCRIPCIÓN", 73, y + 7, { width: 218 });
        doc.text("CANT.", 300, y + 7, { width: 42, align: "right" });
        doc.text("UNIDAD", 349, y + 7, { width: 45 });
        doc.text("P. UNIT.", 400, y + 7, { width: 70, align: "right" });
        doc.text("TOTAL", 478, y + 7, { width: 83, align: "right" });
        return y + 26;
      }

      function addTablePage() {
        doc.addPage();
        doc
          .font("Helvetica-Bold")
          .fontSize(9)
          .fillColor(INK)
          .text(`${data.quoteNumber} · R${data.version}`, LEFT, 46, {
            width: CONTENT_WIDTH,
            align: "right",
          });
        return drawTableHeader(68);
      }

      drawBrand();
      doc
        .moveTo(LEFT, 139)
        .lineTo(RIGHT, 139)
        .strokeColor(CYAN)
        .lineWidth(1.5)
        .stroke();

      doc.font("Helvetica-Bold").fontSize(7.5).fillColor(MUTED);
      doc.text("EMISIÓN", LEFT, 155);
      doc.text("VIGENCIA", 205, 155);
      doc.text("MONEDA", 365, 155);
      doc.font("Helvetica").fontSize(9).fillColor(INK);
      doc.text(formatDate(data.issueDate), LEFT, 168, { width: 145 });
      doc.text(formatDate(data.validUntil), 205, 168, { width: 145 });
      doc.text(data.currency, 365, 168, { width: 80 });

      doc.roundedRect(LEFT, 198, CONTENT_WIDTH, 82, 5).fill("#f7fafc");
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor(CYAN);
      doc.text("CLIENTE", 58, 211);
      doc.font("Helvetica-Bold").fontSize(11).fillColor(INK);
      doc.text(data.client.businessName, 58, 226, { width: 235 });
      doc.font("Helvetica").fontSize(8).fillColor(MUTED);
      doc.text(data.client.contactName, 58, 243, { width: 235 });
      doc.text(
        [data.client.email, data.client.phone].filter(Boolean).join(" · "),
        58,
        256,
        { width: 235 }
      );
      const clientRight = [
        data.client.rfc ? `RFC: ${data.client.rfc}` : undefined,
        data.client.address,
      ]
        .filter((value): value is string => Boolean(value))
        .join("\n");
      if (clientRight) {
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(MUTED)
          .text(clientRight, 325, 226, { width: 225, align: "right" });
      }

      let y = drawTableHeader(298);
      data.items.forEach((item, itemIndex) => {
        const lines: TextLine[] = [
          ...wrapText(item.name, 212, "Helvetica-Bold", 8.5).map((text) => ({
            text,
            font: "Helvetica-Bold" as const,
            size: 8.5,
            color: INK,
          })),
        ];
        if (normalized(item.sku)) {
          lines.push({
            text: `SKU: ${item.sku}`,
            font: "Helvetica",
            size: 7,
            color: MUTED,
          });
        }
        if (normalized(item.description)) {
          lines.push(
            ...wrapText(item.description ?? "", 212, "Helvetica", 7.5).map(
              (text) => ({
                text,
                font: "Helvetica" as const,
                size: 7.5,
                color: "#475569",
              })
            )
          );
        }

        let offset = 0;
        let continuation = false;
        while (offset < lines.length) {
          if (y + 34 > CONTENT_BOTTOM) y = addTablePage();
          const availableLines = Math.max(
            1,
            Math.floor((CONTENT_BOTTOM - y - 10) / 10)
          );
          const chunk = lines.slice(offset, offset + availableLines);
          const rowHeight = Math.max(32, chunk.length * 10 + 10);
          if (itemIndex % 2 === 0) {
            doc.rect(LEFT, y, CONTENT_WIDTH, rowHeight).fill("#fbfdfe");
          }

          doc.font("Helvetica").fontSize(8).fillColor(INK);
          doc.text(continuation ? "" : String(itemIndex + 1), 51, y + 8, {
            width: 18,
          });
          if (continuation) {
            doc
              .font("Helvetica")
              .fontSize(6.5)
              .fillColor(MUTED)
              .text("Continuación", 73, y + 5, { width: 212 });
          }
          let textY = y + (continuation ? 14 : 7);
          chunk.forEach((line) => {
            doc
              .font(line.font)
              .fontSize(line.size)
              .fillColor(line.color)
              .text(line.text, 73, textY, { width: 212, lineBreak: false });
            textY += 10;
          });

          if (!continuation) {
            doc.font("Helvetica").fontSize(8).fillColor(INK);
            doc.text(String(item.quantity), 300, y + 8, {
              width: 42,
              align: "right",
            });
            doc.text(item.unit, 349, y + 8, { width: 45 });
            doc.text(formatCurrency(item.unitPrice, data.currency), 400, y + 8, {
              width: 70,
              align: "right",
            });
            doc
              .font("Helvetica-Bold")
              .text(formatCurrency(item.lineTotal, data.currency), 478, y + 8, {
                width: 83,
                align: "right",
              });
          }

          doc
            .moveTo(LEFT, y + rowHeight)
            .lineTo(RIGHT, y + rowHeight)
            .strokeColor("#e2e8f0")
            .lineWidth(0.35)
            .stroke();
          y += rowHeight;
          offset += chunk.length;
          continuation = true;
        }
      });

      const totalRows = 2 +
        (data.discountTotal > 0 ? 1 : 0) +
        (data.taxTotal > 0 ? 1 : 0) +
        (data.withholdingTotal > 0 ? 1 : 0) +
        (data.shippingTotal > 0 ? 1 : 0);
      const totalsHeight = totalRows * 15 + 25;
      if (y + totalsHeight > CONTENT_BOTTOM) {
        doc.addPage();
        y = 56;
      } else {
        y += 14;
      }

      const totalLabelX = 365;
      const totalValueX = 465;
      const drawTotal = (label: string, value: number, negative = false) => {
        doc.font("Helvetica").fontSize(8.5).fillColor(MUTED);
        doc.text(label, totalLabelX, y, { width: 95, align: "right" });
        doc
          .font(negative ? "Helvetica-Bold" : "Helvetica")
          .fillColor(negative ? "#b91c1c" : INK)
          .text(
            `${negative ? "-" : ""}${formatCurrency(value, data.currency)}`,
            totalValueX,
            y,
            { width: 96, align: "right" }
          );
        y += 15;
      };

      drawTotal("Subtotal", data.subtotal);
      if (data.discountTotal > 0) drawTotal("Descuentos", data.discountTotal, true);
      if (data.taxTotal > 0) drawTotal("IVA", data.taxTotal);
      if (data.withholdingTotal > 0) {
        drawTotal("Retenciones", data.withholdingTotal, true);
      }
      if (data.shippingTotal > 0) drawTotal("Envío", data.shippingTotal);
      doc.moveTo(totalLabelX, y).lineTo(RIGHT, y).strokeColor(CYAN).lineWidth(1).stroke();
      y += 9;
      doc.font("Helvetica-Bold").fontSize(11).fillColor(INK);
      doc.text("TOTAL", totalLabelX, y, { width: 95, align: "right" });
      doc.text(formatCurrency(data.grandTotal, data.currency), totalValueX, y, {
        width: 96,
        align: "right",
      });
      y += 35;

      const drawLongSection = (title: string, content?: string) => {
        const value = normalized(content);
        if (!value) return;
        if (y + 34 > CONTENT_BOTTOM) {
          doc.addPage();
          y = 52;
        }
        doc.font("Helvetica-Bold").fontSize(9).fillColor(INK);
        doc.text(title, LEFT, y, { width: CONTENT_WIDTH });
        y += 15;
        const lines = wrapText(value, CONTENT_WIDTH, "Helvetica", 8);
        lines.forEach((line) => {
          if (y + 11 > CONTENT_BOTTOM) {
            doc.addPage();
            y = 52;
            doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED);
            doc.text(`${title} (continuación)`, LEFT, y, {
              width: CONTENT_WIDTH,
            });
            y += 16;
          }
          doc
            .font("Helvetica")
            .fontSize(8)
            .fillColor("#475569")
            .text(line || " ", LEFT, y, {
              width: CONTENT_WIDTH,
              lineBreak: false,
            });
          y += 11;
        });
        y += 13;
      };

      drawLongSection("NOTAS PARA EL CLIENTE", data.notes);
      drawLongSection("TÉRMINOS Y CONDICIONES COMERCIALES", data.terms);

      if (normalized(data.company.responsibleName)) {
        if (y + 65 <= CONTENT_BOTTOM) {
          doc.moveTo(LEFT, y + 35).lineTo(245, y + 35).strokeColor("#94a3b8").stroke();
          doc.font("Helvetica-Bold").fontSize(8).fillColor(INK);
          doc.text(data.company.responsibleName ?? "", LEFT, y + 41, { width: 199 });
          doc.font("Helvetica").fontSize(7.5).fillColor(MUTED);
          doc.text("Responsable de la cotización", LEFT, y + 53, { width: 199 });
        }
      }

      const pages = doc.bufferedPageRange();
      for (let pageIndex = 0; pageIndex < pages.count; pageIndex += 1) {
        doc.switchToPage(pageIndex);
        doc
          .moveTo(LEFT, 718)
          .lineTo(RIGHT, 718)
          .strokeColor("#e2e8f0")
          .lineWidth(0.5)
          .stroke();
        doc.font("Helvetica").fontSize(6.8).fillColor("#94a3b8");
        doc.text(
          data.footer ?? `${data.company.name} · ${data.company.email}`,
          LEFT,
          725,
          { width: 415, lineBreak: false }
        );
        doc.text(`Página ${pageIndex + 1} de ${pages.count}`, 470, 725, {
          width: 96,
          align: "right",
          lineBreak: false,
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
