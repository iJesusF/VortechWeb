"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { quoteStatusOptions } from "@/lib/quotations/status";
import type { QuoteStatus } from "@/lib/types/database";

interface QuoteStatusSelectProps {
  quoteId: string;
  initialStatus: QuoteStatus;
  onStatusChange?: (status: QuoteStatus) => void;
}
export function QuoteStatusSelect({
  quoteId,
  initialStatus,
  onStatusChange,
}: QuoteStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function updateStatus(nextStatus: QuoteStatus) {
    const previousStatus = status;
    setStatus(nextStatus);
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo actualizar el estado.");
      }
      onStatusChange?.(nextStatus);
      router.refresh();
    } catch (caughtError) {
      setStatus(previousStatus);
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo actualizar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <select
        value={status}
        onChange={(event) => updateStatus(event.target.value as QuoteStatus)}
        disabled={isSaving}
        className="admin-input min-w-44 py-2 text-xs disabled:opacity-60"
        aria-label="Estado de la cotización"
      >
        {quoteStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 max-w-52 text-xs text-red-400">{error}</p>}
    </div>
  );
}
