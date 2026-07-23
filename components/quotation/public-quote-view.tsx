"use client";

import { useState } from "react";
import { Download, Check, X, MessageCircle, Share2, AlertCircle } from "lucide-react";
import { formatMXN } from "@/lib/quotations/calculations";
import { siteConfig } from "@/lib/site-config";

interface Props {
  token: string;
}

// Demo data for rendering without Supabase
const demoQuote = {
  quoteNumber: "COT-0001",
  version: 1,
  status: "sent" as const,
  issueDate: "2025-01-15",
  validUntil: "2025-01-30",
  client: {
    businessName: "Empresa Demo S.A. de C.V.",
    contactName: "Juan Pérez",
    email: "juan@empresa.com",
    phone: "+52 664 123 4567",
  },
  items: [
    { name: "PLC Compacto Industrial", sku: "VT-PLC-001", quantity: 2, unit: "pieza", unitPrice: 15000, discount: 0, tax: 4800, total: 34800 },
    { name: "Pantalla HMI 10\"", sku: "VT-HMI-010", quantity: 1, unit: "pieza", unitPrice: 12500, discount: 0, tax: 2000, total: 14500 },
    { name: "Programación y puesta en marcha", sku: null, quantity: 1, unit: "servicio", unitPrice: 25000, discount: 2500, tax: 3600, total: 26100 },
  ],
  subtotal: 67500,
  discountTotal: 2500,
  taxTotal: 10400,
  withholdingTotal: 0,
  shippingTotal: 1500,
  grandTotal: 76900,
  notes: "Tiempo de entrega estimado: 3-4 semanas hábiles.",
  terms: "50% anticipo, 50% contra entrega. Vigencia 15 días naturales.",
};

export function PublicQuoteView({ token }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const quote = demoQuote;

  function handleAccept() {
    if (confirm("¿Confirmas que aceptas esta cotización y sus condiciones?")) {
      setAccepted(true);
      // TODO: POST to /api/quotes/[token]/accept
    }
  }

  function handleReject() {
    setRejected(true);
    setShowRejectDialog(false);
    // TODO: POST to /api/quotes/[token]/reject with reason
  }

  function handleDownloadPdf() {
    // TODO: Fetch /api/quotes/[token]/pdf
    alert("La descarga de PDF requiere conexión con Supabase y generación server-side.");
  }

  function handleWhatsApp() {
    const message = `Hola, tengo consultas sobre la cotización ${quote.quoteNumber}`;
    window.open(`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `Cotización ${quote.quoteNumber} - VORTECH`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado al portapapeles");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-cyanx/30 bg-cyanx/10 text-sm font-black text-cyanx shadow-glow">
              VT
            </span>
            <div>
              <span className="text-lg font-black tracking-[0.22em] text-white">VORTECH</span>
              <p className="text-xs text-slate-500">{siteConfig.email} · {siteConfig.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white">{quote.quoteNumber}</p>
            <p className="text-xs text-slate-400">Versión {quote.version}</p>
          </div>
        </header>

        {/* Status banner */}
        {accepted && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
            <Check className="mx-auto size-6 text-emerald-400" />
            <p className="mt-1 font-semibold text-emerald-300">Cotización aceptada</p>
          </div>
        )}
        {rejected && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
            <X className="mx-auto size-6 text-red-400" />
            <p className="mt-1 font-semibold text-red-300">Cotización rechazada</p>
          </div>
        )}

        {/* Dates & Client */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-xs font-semibold uppercase text-slate-500">Fechas</h3>
            <p className="mt-2 text-sm text-white">Emisión: {quote.issueDate}</p>
            <p className="text-sm text-white">Vigencia: {quote.validUntil}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-xs font-semibold uppercase text-slate-500">Cliente</h3>
            <p className="mt-2 text-sm font-medium text-white">{quote.client.businessName}</p>
            <p className="text-sm text-slate-400">{quote.client.contactName}</p>
            <p className="text-sm text-slate-400">{quote.client.email}</p>
          </div>
        </div>

        {/* Items table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 font-semibold text-slate-400">#</th>
                <th className="px-4 py-3 font-semibold text-slate-400">Concepto</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-400">Cant.</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-400">P. Unit.</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item, idx) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{item.name}</p>
                    {item.sku && <p className="text-xs text-slate-500">SKU: {item.sku}</p>}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{formatMXN(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-medium text-white">{formatMXN(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-xs space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white">{formatMXN(quote.subtotal)}</span>
            </div>
            {quote.discountTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Descuentos</span>
                <span className="text-red-400">-{formatMXN(quote.discountTotal)}</span>
              </div>
            )}
            {quote.taxTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">IVA</span>
                <span className="text-white">{formatMXN(quote.taxTotal)}</span>
              </div>
            )}
            {quote.withholdingTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Retenciones</span>
                <span className="text-orange-400">-{formatMXN(quote.withholdingTotal)}</span>
              </div>
            )}
            {quote.shippingTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Envío</span>
                <span className="text-white">{formatMXN(quote.shippingTotal)}</span>
              </div>
            )}
            <hr className="border-white/10" />
            <div className="flex justify-between text-base">
              <span className="font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-cyanx">{formatMXN(quote.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(quote.notes || quote.terms) && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {quote.notes && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="text-xs font-semibold uppercase text-slate-500">Notas</h3>
                <p className="mt-2 text-sm text-slate-300">{quote.notes}</p>
              </div>
            )}
            {quote.terms && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="text-xs font-semibold uppercase text-slate-500">Condiciones</h3>
                <p className="mt-2 text-sm text-slate-300">{quote.terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {!accepted && !rejected && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAccept}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
              >
                <Check className="size-4" />
                Aceptar cotización
              </button>
              <button
                type="button"
                onClick={() => setShowRejectDialog(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-6 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
              >
                <X className="size-4" />
                Rechazar
              </button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={handleDownloadPdf} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:border-cyanx/40">
                <Download className="size-4" />
                Descargar PDF
              </button>
              <button type="button" onClick={handleWhatsApp} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:border-cyanx/40">
                <MessageCircle className="size-4" />
                Consultar por WhatsApp
              </button>
              <button type="button" onClick={handleShare} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:border-cyanx/40">
                <Share2 className="size-4" />
                Compartir
              </button>
            </div>
          </div>
        )}

        {/* Reject dialog */}
        {showRejectDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-graphite p-6">
              <h3 className="text-lg font-bold text-white">Rechazar cotización</h3>
              <p className="mt-2 text-sm text-slate-400">Comentario opcional:</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="mt-3 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none"
              />
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setShowRejectDialog(false)} className="flex-1 rounded-full border border-white/15 px-4 py-2 text-sm text-white">
                  Cancelar
                </button>
                <button type="button" onClick={handleReject} className="flex-1 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white">
                  Confirmar rechazo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-white/10 py-6 text-center">
          <p className="text-xs text-slate-500">
            {siteConfig.companyName} · {siteConfig.email} · {siteConfig.phone}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Este documento es confidencial y está dirigido exclusivamente al destinatario.
          </p>
        </footer>
      </div>
    </div>
  );
}
