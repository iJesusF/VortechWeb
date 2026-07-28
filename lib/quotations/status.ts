import type { QuoteEventType, QuoteStatus } from "@/lib/types/database";

export const quoteStatusOptions: Array<{
  value: QuoteStatus;
  label: string;
  className: string;
}> = [
  { value: "draft", label: "Borrador / revisión interna", className: "text-slate-300" },
  { value: "sent", label: "Enviada", className: "text-blue-300" },
  { value: "viewed", label: "Vista por el cliente", className: "text-cyan-300" },
  { value: "accepted", label: "Aprobada", className: "text-emerald-300" },
  { value: "rejected", label: "Rechazada", className: "text-red-300" },
  { value: "expired", label: "Vencida", className: "text-amber-300" },
  { value: "cancelled", label: "Cancelada", className: "text-slate-400" },
  { value: "payment_pending", label: "Pendiente de pago", className: "text-orange-300" },
  { value: "paid", label: "Pagada", className: "text-emerald-300" },
];

export function getQuoteStatusLabel(status: QuoteStatus) {
  return quoteStatusOptions.find((option) => option.value === status)?.label ?? status;
}

const eventLabels: Record<QuoteEventType, string> = {
  created: "Cotización creada",
  edited: "Cotización actualizada",
  sent: "Cotización enviada",
  viewed: "Vista por el cliente",
  accepted: "Cotización aprobada",
  rejected: "Cotización rechazada",
  pdf_downloaded: "PDF descargado",
  payment_link_created: "Enlace de pago creado",
  marked_paid: "Marcada como pagada",
  cancelled: "Cotización cancelada",
  version_created: "Nueva versión creada",
};

export function getQuoteEventLabel(event: QuoteEventType) {
  return eventLabels[event];
}
