import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Mail,
  MessageCircle,
  Phone,
  ReceiptText,
} from "lucide-react";

import { QuoteRequestStatusSelect } from "@/components/admin/quote-request-status-select";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CartSnapshotItem } from "@/lib/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Tijuana",
});

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

function getSafeHttpUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function getEstimatedSubtotal(items: CartSnapshotItem[]) {
  const pricedItems = items.filter((item) => item.unit_price !== null && item.unit_price !== undefined);
  if (pricedItems.length !== items.length) return null;
  return pricedItems.reduce(
    (total, item) => total + (item.unit_price ?? 0) * item.quantity,
    0
  );
}

export default async function QuoteRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: quoteRequest, error } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <div>
        <Link
          href="/admin/solicitudes"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyanx"
        >
          <ArrowLeft className="size-4" />
          Volver a solicitudes
        </Link>
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          Supabase: {error.message}
        </div>
      </div>
    );
  }

  if (!quoteRequest) notFound();

  const estimatedSubtotal = getEstimatedSubtotal(quoteRequest.cart_snapshot);
  const whatsappNumber = quoteRequest.phone.replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent(
    `Hola ${quoteRequest.customer_name}, te contacto de VORTECH sobre tu solicitud ${quoteRequest.request_number}.`
  );

  return (
    <div className="max-w-6xl">
      <Link
        href="/admin/solicitudes"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyanx"
      >
        <ArrowLeft className="size-4" />
        Volver a solicitudes
      </Link>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyanx">
            Solicitud recibida
          </p>
          <h1 className="mt-2 font-mono text-2xl font-bold text-white">
            {quoteRequest.request_number}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {dateFormatter.format(new Date(quoteRequest.created_at))}
          </p>
        </div>
        <QuoteRequestStatusSelect
          requestId={quoteRequest.id}
          initialStatus={quoteRequest.status}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <ReceiptText className="size-5 text-cyanx" />
              <h2 className="text-lg font-semibold text-white">
                Productos solicitados
              </h2>
            </div>

            <div className="mt-5 space-y-3">
              {quoteRequest.cart_snapshot.map((item, index) => {
                const productUrl = getSafeHttpUrl(item.url);
                return (
                  <article
                    key={`${item.product_id ?? item.name}-${index}`}
                    className="rounded-xl border border-white/10 bg-white/[0.025] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        {item.sku && (
                          <p className="mt-1 font-mono text-xs text-slate-500">
                            SKU: {item.sku}
                          </p>
                        )}
                      </div>
                      <span className="whitespace-nowrap rounded-full bg-cyanx/10 px-3 py-1 text-xs font-semibold text-cyanx">
                        Cantidad: {item.quantity}
                      </span>
                    </div>

                    {item.observations && (
                      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">
                        {item.observations}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                      <span className="text-slate-400">
                        {item.unit_price === null || item.unit_price === undefined
                          ? "Precio por confirmar"
                          : `${currencyFormatter.format(item.unit_price)} por unidad`}
                      </span>
                      {productUrl && (
                        <a
                          href={productUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-cyanx hover:text-white"
                        >
                          Ver producto
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-5 flex justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-slate-400">Subtotal estimado</span>
              <span className="font-semibold text-white">
                {estimatedSubtotal === null
                  ? "Pendiente de cotización"
                  : currencyFormatter.format(estimatedSubtotal)}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              El total formal, descuentos e impuestos se determinan al convertir la solicitud en cotización.
            </p>
          </section>

          {quoteRequest.general_notes && (
            <section className="glass-panel rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white">
                Notas del cliente
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                {quoteRequest.general_notes}
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white">Cliente</h2>
            <p className="mt-4 text-base font-medium text-white">
              {quoteRequest.customer_name}
            </p>
            {quoteRequest.company && (
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                <Building2 className="size-4 text-slate-500" />
                {quoteRequest.company}
              </p>
            )}
            {quoteRequest.rfc && (
              <p className="mt-2 font-mono text-xs text-slate-400">
                RFC: {quoteRequest.rfc}
              </p>
            )}

            <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
              <a
                href={`mailto:${quoteRequest.email}`}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyanx"
              >
                <Mail className="size-4" />
                {quoteRequest.email}
              </a>
              <a
                href={`tel:${quoteRequest.phone}`}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyanx"
              >
                <Phone className="size-4" />
                {quoteRequest.phone}
              </a>
              {whatsappNumber.length >= 7 && (
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-btn-primary mt-2 w-full justify-center"
                >
                  <MessageCircle className="size-4" />
                  Contactar por WhatsApp
                </a>
              )}
            </div>
          </section>

          {quoteRequest.converted_quote_id && (
            <section className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5">
              <p className="text-sm text-emerald-200">
                Esta solicitud ya fue convertida en cotización.
              </p>
              <Link
                href={`/admin/cotizaciones/${quoteRequest.converted_quote_id}`}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-cyanx"
              >
                Abrir cotización
                <ExternalLink className="size-4" />
              </Link>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
