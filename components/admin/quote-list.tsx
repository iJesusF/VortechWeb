"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, FileText, Search } from "lucide-react";

import { QuoteStatusSelect } from "@/components/admin/quote-status-select";
import { quoteStatusOptions } from "@/lib/quotations/status";
import type { Database, QuoteStatus } from "@/lib/types/database";

type Quote = Database["public"]["Tables"]["quotes"]["Row"];

export interface QuoteListEntry {
  quote: Quote;
  clientName: string;
  contactName: string;
}

interface QuoteListProps {
  initialEntries: QuoteListEntry[];
  initialError?: string;
  initialStatus?: QuoteStatus | "all";
}

const dateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" });

export function QuoteList({
  initialEntries,
  initialError = "",
  initialStatus = "all",
}: QuoteListProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | QuoteStatus>(initialStatus);

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter(({ quote, clientName, contactName }) => {
      const matchesSearch =
        !term ||
        quote.quote_number.toLowerCase().includes(term) ||
        clientName.toLowerCase().includes(term) ||
        contactName.toLowerCase().includes(term);
      return matchesSearch && (status === "all" || quote.status === status);
    });
  }, [entries, search, status]);

  function updateEntryStatus(id: string, nextStatus: QuoteStatus) {
    setEntries((current) =>
      current.map((entry) =>
        entry.quote.id === id
          ? { ...entry, quote: { ...entry.quote, status: nextStatus } }
          : entry
      )
    );
  }

  return (
    <>
      {initialError && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {initialError}
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por folio o cliente"
            className="admin-input pl-10"
          />
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
          className="admin-input"
        >
          <option value="all">Todos los estados</option>
          {quoteStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="size-12 text-slate-700" />
            <p className="mt-4 text-sm text-slate-500">
              {entries.length === 0
                ? "Aún no hay cotizaciones formales."
                : "No hay cotizaciones con esos filtros."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Folio</th>
                  <th className="px-5 py-4">Cliente</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Emisión</th>
                  <th className="px-5 py-4">Vigencia</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map(({ quote, clientName, contactName }) => (
                  <tr key={quote.id} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-4 font-mono font-semibold text-cyanx">
                      {quote.quote_number}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{clientName}</p>
                      <p className="mt-1 text-xs text-slate-500">{contactName}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">
                      {new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: quote.currency,
                      }).format(quote.grand_total)}
                    </td>
                    <td className="px-5 py-4">
                      <QuoteStatusSelect
                        quoteId={quote.id}
                        initialStatus={quote.status}
                        onStatusChange={(nextStatus) => updateEntryStatus(quote.id, nextStatus)}
                      />
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {dateFormatter.format(new Date(`${quote.issue_date}T12:00:00`))}
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {dateFormatter.format(new Date(`${quote.valid_until}T12:00:00`))}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <Link
                          href={`/admin/cotizaciones/${quote.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-cyanx/40 hover:text-cyanx"
                        >
                          <Eye className="size-4" />
                          Abrir
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
