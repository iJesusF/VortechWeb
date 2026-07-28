"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { quoteRequestStatuses } from "@/lib/quote-requests/status";
import type { QuoteRequestStatus } from "@/lib/types/database";

interface QuoteRequestStatusSelectProps {
  requestId: string;
  initialStatus: QuoteRequestStatus;
  onUpdated?: (status: QuoteRequestStatus) => void;
}

export function QuoteRequestStatusSelect({
  requestId,
  initialStatus,
  onUpdated,
}: QuoteRequestStatusSelectProps) {
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function updateStatus(value: string) {
    const selected = quoteRequestStatuses.find((option) => option.value === value);
    if (!selected || selected.value === status) return;

    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/quote-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selected.value }),
      });
      const payload: { error?: string; status?: QuoteRequestStatus } =
        await response.json().catch(() => ({}));

      if (!response.ok || !payload.status) {
        throw new Error(payload.error || "No se pudo actualizar el estado.");
      }

      setStatus(payload.status);
      onUpdated?.(payload.status);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "No se pudo actualizar el estado."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-36">
      <div className="relative">
        <select
          value={status}
          onChange={(event) => void updateStatus(event.target.value)}
          disabled={busy}
          className="admin-input py-2 pr-9 text-xs"
          aria-label="Cambiar estado de la solicitud"
        >
          {quoteRequestStatuses.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {busy && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-cyanx" />
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
