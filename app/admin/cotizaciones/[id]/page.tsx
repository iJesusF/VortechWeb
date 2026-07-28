import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Download,
  FileText,
  Mail,
  Pencil,
  Phone,
  ReceiptText,
} from "lucide-react";

import { QuoteStatusSelect } from "@/components/admin/quote-status-select";
import { getQuoteEventLabel } from "@/lib/quotations/status";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Tijuana",
});

function getNote(metadata: Json | null) {
  if (!metadata || Array.isArray(metadata) || typeof metadata !== "object") return null;
  return typeof metadata.note === "string" ? metadata.note : null;
}

export default async function QuoteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: quote, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <div>
        <Link href="/admin/cotizaciones" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyanx">
          <ArrowLeft className="size-4" />
          Volver a cotizaciones
        </Link>
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          Supabase: {error.message}
        </div>
      </div>
    );
  }

  if (!quote) notFound();

  const [
    { data: client },
    { data: items },
    { data: events },
    { data: revisions, error: revisionsError },
  ] = await Promise.all([
    supabase.from("clients").select("*").eq("id", quote.client_id).maybeSingle(),
    supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quote.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("quote_events")
      .select("*")
      .eq("quote_id", quote.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("quote_revisions")
      .select("id, version, change_notes, created_at")
      .eq("quote_id", quote.id)
      .order("version", { ascending: false }),
  ]);

  const currencyFormatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: quote.currency,
  });

  return (
    <div className="max-w-6xl">
      <Link href="/admin/cotizaciones" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyanx">
        <ArrowLeft className="size-4" />
        Volver a cotizaciones
      </Link>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyanx">
            Cotización formal
          </p>
          <h1 className="mt-2 font-mono text-2xl font-bold text-white">{quote.quote_number}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-xs text-slate-300">
              R{quote.version}
            </span>
            {quote.approved_version && (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                Aprobada: R{quote.approved_version}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <Link
            href={`/admin/cotizaciones/${quote.id}/editar`}
            className="admin-btn-ghost"
          >
            <Pencil className="size-4" />
            Crear revisión
          </Link>
          <QuoteStatusSelect quoteId={quote.id} initialStatus={quote.status} />
          <a
            href={`/api/admin/quotes/${quote.id}/pdf`}
            className="admin-btn-primary"
          >
            <Download className="size-4" />
            Descargar PDF
          </a>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <ReceiptText className="size-5 text-cyanx" />
              <h2 className="text-lg font-semibold text-white">Partidas</h2>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-white/10 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3 pr-3">Concepto</th>
                    <th className="px-3 py-3 text-right">Cantidad</th>
                    <th className="px-3 py-3 text-right">P. unitario</th>
                    <th className="py-3 pl-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(items ?? []).map((item) => (
                    <tr key={item.id} className="border-b border-white/5">
                      <td className="py-4 pr-3">
                        <p className="font-medium text-white">{item.name}</p>
                        {item.description && (
                          <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                        )}
                        {item.sku && <p className="mt-1 font-mono text-xs text-slate-600">SKU: {item.sku}</p>}
                      </td>
                      <td className="px-3 py-4 text-right text-slate-300">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-3 py-4 text-right text-slate-300">
                        {currencyFormatter.format(item.unit_price)}
                      </td>
                      <td className="py-4 pl-3 text-right font-semibold text-white">
                        {currencyFormatter.format(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="ml-auto mt-6 max-w-sm space-y-2 border-t border-white/10 pt-5 text-sm">
              <Total label="Subtotal" value={quote.subtotal} formatter={currencyFormatter} />
              {quote.discount_total > 0 && (
                <Total label="Descuentos" value={-quote.discount_total} formatter={currencyFormatter} />
              )}
              {quote.tax_total > 0 && (
                <Total label="IVA" value={quote.tax_total} formatter={currencyFormatter} />
              )}
              {quote.withholding_total > 0 && (
                <Total label="Retenciones" value={-quote.withholding_total} formatter={currencyFormatter} />
              )}
              {quote.shipping_total > 0 && (
                <Total label="Envío" value={quote.shipping_total} formatter={currencyFormatter} />
              )}
              <div className="flex justify-between border-t border-white/10 pt-3 text-base">
                <dt className="font-semibold text-white">Total</dt>
                <dd className="text-xl font-bold text-cyanx">
                  {currencyFormatter.format(quote.grand_total)}
                </dd>
              </div>
            </dl>
          </section>

          {(quote.notes || quote.terms || quote.internal_notes) && (
            <section className="glass-panel rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white">Notas y condiciones</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {quote.notes && <TextBlock title="Notas para el cliente" value={quote.notes} />}
                {quote.terms && <TextBlock title="Condiciones comerciales" value={quote.terms} />}
                {quote.internal_notes && <TextBlock title="Notas internas" value={quote.internal_notes} />}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-cyanx" />
              <h2 className="text-lg font-semibold text-white">Cliente</h2>
            </div>
            {client ? (
              <>
                <p className="mt-4 font-medium text-white">{client.business_name}</p>
                <p className="mt-1 text-sm text-slate-400">{client.contact_name}</p>
                <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyanx">
                    <Mail className="size-4" />
                    {client.email}
                  </a>
                  <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyanx">
                    <Phone className="size-4" />
                    {client.phone}
                  </a>
                  {client.rfc && <p className="font-mono text-xs text-slate-500">RFC: {client.rfc}</p>}
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-red-300">No se encontró el cliente relacionado.</p>
            )}
          </section>

          <section className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-cyanx" />
              <h2 className="text-lg font-semibold text-white">Fechas</h2>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <DateRow label="Emisión" value={quote.issue_date} />
              <DateRow label="Vigencia" value={quote.valid_until} />
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Creada</dt>
                <dd className="text-right text-slate-300">
                  {dateTimeFormatter.format(new Date(quote.created_at))}
                </dd>
              </div>
            </dl>
            {quote.request_id && (
              <Link
                href={`/admin/solicitudes/${quote.request_id}`}
                className="mt-4 inline-flex items-center gap-2 text-sm text-cyanx hover:text-white"
              >
                <FileText className="size-4" />
                Ver solicitud de origen
              </Link>
            )}
          </section>

          <section className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white">Revisiones</h2>
            {revisionsError ? (
              <p className="mt-4 text-sm text-amber-300">
                Ejecuta la migración 012 para consultar el historial de revisiones.
              </p>
            ) : (
              <ol className="mt-5 space-y-4">
                <li className="relative border-l border-cyanx/50 pl-4">
                  <span className="absolute -left-1 top-1 size-2 rounded-full bg-cyanx" />
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-semibold text-white">
                      R{quote.version} · Actual
                    </p>
                    {quote.approved_version === quote.version && (
                      <span className="text-xs font-semibold text-emerald-300">
                        Aprobada
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {dateTimeFormatter.format(new Date(quote.updated_at))}
                  </p>
                </li>
                {(revisions ?? []).map((revision) => (
                  <li key={revision.id} className="relative border-l border-white/10 pl-4">
                    <span className="absolute -left-1 top-1 size-2 rounded-full bg-slate-500" />
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-semibold text-white">
                        R{revision.version}
                      </p>
                      {quote.approved_version === revision.version && (
                        <span className="text-xs font-semibold text-emerald-300">
                          Aprobada
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {dateTimeFormatter.format(new Date(revision.created_at))}
                    </p>
                    {revision.change_notes && (
                      <p className="mt-2 text-xs leading-5 text-slate-300">
                        {revision.change_notes}
                      </p>
                    )}
                    <a
                      href={`/api/admin/quotes/${quote.id}/revisions/${revision.version}/pdf`}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-cyanx hover:text-white"
                    >
                      <Download className="size-3.5" />
                      Descargar R{revision.version}
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white">Actividad</h2>
            {(events ?? []).length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">Aún no hay eventos registrados.</p>
            ) : (
              <ol className="mt-5 space-y-4">
                {(events ?? []).map((event) => {
                  const note = getNote(event.metadata);
                  return (
                    <li key={event.id} className="relative border-l border-white/10 pl-4">
                      <span className="absolute -left-1 top-1 size-2 rounded-full bg-cyanx" />
                      <p className="text-sm font-medium text-white">
                        {getQuoteEventLabel(event.event_type)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {dateTimeFormatter.format(new Date(event.created_at))}
                      </p>
                      {note && <p className="mt-2 text-xs text-slate-300">{note}</p>}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function Total({
  label,
  value,
  formatter,
}: {
  label: string;
  value: number;
  formatter: Intl.NumberFormat;
}) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-medium text-white">{formatter.format(value)}</dd>
    </div>
  );
}

function TextBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <h3 className="text-xs font-semibold uppercase text-slate-500">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{value}</p>
    </div>
  );
}

function DateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-300">
        {new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(
          new Date(`${value}T12:00:00`)
        )}
      </dd>
    </div>
  );
}
