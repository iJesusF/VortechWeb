import {
  AlertTriangle,
  CheckCircle2,
  BriefcaseBusiness,
  ClipboardList,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { getQuoteStatusLabel } from "@/lib/quotations/status";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient();
  const [{ data: requests, error: requestsError }, { data: quotes, error: quotesError }] =
    await Promise.all([
      supabase.from("quote_requests").select("id, status, created_at"),
      supabase
        .from("quotes")
        .select(
          "id, quote_number, version, status, grand_total, currency, approved_version, created_at"
        ),
    ]);

  const requestRows = requests ?? [];
  const quoteRows = quotes ?? [];
  const formatTotals = (
    rows: Array<{ currency: string; grand_total: number }>
  ) => {
    const totals = rows.reduce<Map<string, number>>((result, quote) => {
      result.set(quote.currency, (result.get(quote.currency) ?? 0) + quote.grand_total);
      return result;
    }, new Map());

    if (totals.size === 0) return "$0";
    return [...totals.entries()]
      .map(([currency, total]) =>
        new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }).format(total)
      )
      .join(" · ");
  };

  const totalQuoted = formatTotals(
    quoteRows.filter((quote) => quote.status !== "cancelled")
  );
  const totalAccepted = formatTotals(
    quoteRows.filter((quote) =>
      ["accepted", "payment_pending", "paid"].includes(quote.status)
    )
  );
  const activeProjects = quoteRows.filter(
    (quote) =>
      quote.approved_version !== null &&
      !["cancelled", "rejected"].includes(quote.status)
  );

  const stats = [
    {
      label: "Solicitudes nuevas",
      value: String(requestRows.filter((request) => request.status === "new").length),
      icon: ClipboardList,
      href: "/admin/solicitudes",
      color: "text-blue-400",
    },
    {
      label: "Cotizaciones borrador",
      value: String(quoteRows.filter((quote) => quote.status === "draft").length),
      icon: FileText,
      href: "/admin/cotizaciones?status=draft",
      color: "text-slate-400",
    },
    {
      label: "Cotizaciones enviadas",
      value: String(
        quoteRows.filter((quote) => quote.status === "sent" || quote.status === "viewed").length
      ),
      icon: Clock,
      href: "/admin/cotizaciones?status=sent",
      color: "text-amber-400",
    },
    {
      label: "Cotizaciones aceptadas",
      value: String(quoteRows.filter((quote) => quote.status === "accepted").length),
      icon: CheckCircle2,
      href: "/admin/cotizaciones?status=accepted",
      color: "text-emerald-400",
    },
    {
      label: "Proyectos en curso",
      value: String(activeProjects.length),
      icon: BriefcaseBusiness,
      href: "/admin/cotizaciones?status=accepted",
      color: "text-cyanx",
    },
    {
      label: "Cotizaciones vencidas",
      value: String(quoteRows.filter((quote) => quote.status === "expired").length),
      icon: AlertTriangle,
      href: "/admin/cotizaciones?status=expired",
      color: "text-red-400",
    },
    {
      label: "Pendientes de pago",
      value: String(quoteRows.filter((quote) => quote.status === "payment_pending").length),
      icon: DollarSign,
      href: "/admin/cotizaciones?status=payment_pending",
      color: "text-orange-400",
    },
    {
      label: "Total cotizado",
      value: totalQuoted,
      icon: TrendingUp,
      href: "/admin/cotizaciones",
      color: "text-cyanx",
    },
    {
      label: "Total aceptado",
      value: totalAccepted,
      icon: DollarSign,
      href: "/admin/cotizaciones?status=accepted",
      color: "text-emerald-400",
    },
  ];

  const errorMessage = requestsError?.message ?? quotesError?.message ?? "";

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-400">
        Resumen histórico de cotizaciones y solicitudes registradas en Supabase.
      </p>

      {errorMessage && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          Supabase: {errorMessage}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="glass-panel group rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-cyanx/30"
            >
              <div className="flex items-start justify-between gap-3">
                <Icon className={`mt-1 size-5 shrink-0 ${stat.color}`} />
                <span className="text-right text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="mt-3 text-xs font-medium text-slate-400">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <SummaryCard label="Solicitudes históricas" value={requestRows.length} />
        <SummaryCard label="Cotizaciones históricas" value={quoteRows.length} />
        <SummaryCard
          label="Solicitudes convertidas"
          value={requestRows.filter((request) => request.status === "converted").length}
        />
        <SummaryCard
          label="Revisiones aprobadas"
          value={quoteRows.filter((quote) => quote.approved_version !== null).length}
        />
      </div>

      <section className="glass-panel mt-8 rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Proyectos en curso</h2>
            <p className="mt-1 text-sm text-slate-400">
              Cotizaciones con una revisión aprobada que siguen activas.
            </p>
          </div>
          <BriefcaseBusiness className="size-5 text-cyanx" />
        </div>
        {activeProjects.length === 0 ? (
          <p className="mt-5 text-sm text-slate-500">
            Todavía no hay cotizaciones aprobadas en curso.
          </p>
        ) : (
          <div className="mt-5 divide-y divide-white/5">
            {activeProjects.slice(0, 6).map((quote) => (
              <Link
                key={quote.id}
                href={`/admin/cotizaciones/${quote.id}`}
                className="flex flex-col gap-2 py-4 transition hover:text-cyanx sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-white">
                    {quote.quote_number} · R{quote.version}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Aprobada R{quote.approved_version} · {getQuoteStatusLabel(quote.status)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-cyanx">
                  Abrir cotización
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
