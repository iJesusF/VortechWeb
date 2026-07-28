import { Plus } from "lucide-react";
import Link from "next/link";

import { QuoteList } from "@/components/admin/quote-list";
import type { QuoteListEntry } from "@/components/admin/quote-list";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { quoteStatusSchema } from "@/lib/validations/quote";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function CotizacionesPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const parsedStatus = quoteStatusSchema.safeParse(status);
  const supabase = await createServerSupabaseClient();
  const { data: quotes, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  let entries: QuoteListEntry[] = [];
  let errorMessage = error ? `Supabase: ${error.message}` : "";

  if (quotes && quotes.length > 0) {
    const clientIds = [...new Set(quotes.map((quote) => quote.client_id))];
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, business_name, contact_name")
      .in("id", clientIds);

    if (clientsError) {
      errorMessage = `Supabase: ${clientsError.message}`;
    }

    const clientMap = new Map((clients ?? []).map((client) => [client.id, client]));
    entries = quotes.map((quote) => {
      const client = clientMap.get(quote.client_id);
      return {
        quote,
        clientName: client?.business_name ?? "Cliente no disponible",
        contactName: client?.contact_name ?? "",
      };
    });
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cotizaciones</h1>
          <p className="mt-1 text-sm text-slate-400">
            Gestión de cotizaciones, estados e historial.
          </p>
        </div>
        <Link href="/admin/cotizaciones/nueva" className="admin-btn-primary">
          <Plus className="size-4" />
          Nueva cotización
        </Link>
      </div>

      <QuoteList
        initialEntries={entries}
        initialError={errorMessage}
        initialStatus={parsedStatus.success ? parsedStatus.data : "all"}
      />
    </div>
  );
}
