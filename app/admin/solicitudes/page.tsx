import { QuoteRequestList } from "@/components/admin/quote-request-list";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type QuoteRequest = Database["public"]["Tables"]["quote_requests"]["Row"];

export const dynamic = "force-dynamic";

export default async function SolicitudesPage() {
  let requests: QuoteRequest[] = [];
  let errorMessage = "";

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      errorMessage = error.message;
    } else {
      requests = data ?? [];
    }
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "No se pudo conectar con Supabase.";
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyanx">
            Ventas
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">
            Solicitudes de cotización
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Solicitudes recibidas desde el catálogo público.
          </p>
        </div>
        {!errorMessage && (
          <p className="text-sm text-slate-400">
            {requests.length} solicitud{requests.length === 1 ? "" : "es"}
          </p>
        )}
      </div>

      <div className="mt-8">
        {errorMessage ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            Supabase: {errorMessage}
          </div>
        ) : (
          <QuoteRequestList initialRequests={requests} />
        )}
      </div>
    </div>
  );
}
