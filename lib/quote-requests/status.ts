import type { QuoteRequestStatus } from "@/lib/types/database";

export const quoteRequestStatuses: ReadonlyArray<{
  value: QuoteRequestStatus;
  label: string;
}> = [
  { value: "new", label: "Nueva" },
  { value: "reviewing", label: "En revisión" },
  { value: "converted", label: "Convertida" },
  { value: "closed", label: "Cerrada" },
];

export function getQuoteRequestStatusLabel(status: QuoteRequestStatus) {
  return (
    quoteRequestStatuses.find((option) => option.value === status)?.label ??
    status
  );
}
