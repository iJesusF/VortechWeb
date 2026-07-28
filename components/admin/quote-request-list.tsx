"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, ExternalLink, Search } from "lucide-react";

import { QuoteRequestStatusSelect } from "@/components/admin/quote-request-status-select";
import { quoteRequestStatuses } from "@/lib/quote-requests/status";
import type { Database, QuoteRequestStatus } from "@/lib/types/database";

type QuoteRequest = Database["public"]["Tables"]["quote_requests"]["Row"];

interface QuoteRequestListProps {
  initialRequests: QuoteRequest[];
}

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Tijuana",
});

export function QuoteRequestList({ initialRequests }: QuoteRequestListProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<QuoteRequestStatus | "">("");

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((quoteRequest) => {
      const matchesStatus = !status || quoteRequest.status === status;
      const matchesSearch =
        !query ||
        quoteRequest.request_number.toLowerCase().includes(query) ||
        quoteRequest.customer_name.toLowerCase().includes(query) ||
        (quoteRequest.company ?? "").toLowerCase().includes(query) ||
        quoteRequest.email.toLowerCase().includes(query) ||
        quoteRequest.phone.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [requests, search, status]);

  function setRequestStatus(id: string, nextStatus: QuoteRequestStatus) {
    setRequests((current) =>
      current.map((quoteRequest) =>
        quoteRequest.id === id
          ? { ...quoteRequest, status: nextStatus }
          : quoteRequest
      )
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <label className="relative">
          <span className="sr-only">Buscar solicitudes</span>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="admin-input pl-10"
            placeholder="Buscar folio, cliente, empresa, correo o teléfono"
          />
        </label>
        <select
          value={status}
          onChange={(event) => {
            const selected = quoteRequestStatuses.find(
              (option) => option.value === event.target.value
            );
            setStatus(selected?.value ?? "");
          }}
          className="admin-input"
          aria-label="Filtrar solicitudes por estado"
        >
          <option value="">Todos los estados</option>
          {quoteRequestStatuses.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="glass-panel overflow-x-auto rounded-2xl">
        <table className="min-w-full">
          <thead className="border-b border-white/10">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Folio
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Contacto
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Empresa
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Productos
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Estado
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Fecha
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredRequests.map((quoteRequest) => (
              <tr key={quoteRequest.id} className="hover:bg-white/[0.025]">
                <td className="whitespace-nowrap px-5 py-4">
                  <Link
                    href={`/admin/solicitudes/${quoteRequest.id}`}
                    className="font-mono text-sm font-semibold text-cyanx hover:text-white"
                  >
                    {quoteRequest.request_number}
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-white">
                    {quoteRequest.customer_name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {quoteRequest.email}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm text-slate-300">
                  {quoteRequest.company || "—"}
                </td>
                <td className="px-5 py-4 text-sm text-slate-300">
                  {quoteRequest.cart_snapshot.length}
                </td>
                <td className="px-5 py-4">
                  <QuoteRequestStatusSelect
                    requestId={quoteRequest.id}
                    initialStatus={quoteRequest.status}
                    onUpdated={(nextStatus) =>
                      setRequestStatus(quoteRequest.id, nextStatus)
                    }
                  />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-400">
                  {dateFormatter.format(new Date(quoteRequest.created_at))}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/solicitudes/${quoteRequest.id}`}
                    className="icon-btn inline-flex"
                    aria-label={`Abrir solicitud ${quoteRequest.request_number}`}
                    title="Abrir detalle"
                  >
                    <ExternalLink className="size-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="size-12 text-slate-700" />
            <p className="mt-4 text-sm text-slate-500">
              {requests.length === 0
                ? "Aún no se han recibido solicitudes."
                : "No hay solicitudes que coincidan con los filtros."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
