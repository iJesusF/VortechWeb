import { ClientManager } from "@/components/admin/client-manager";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type Client = Database["public"]["Tables"]["clients"]["Row"];

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  let clients: Client[] = [];
  let errorMessage = "";

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("business_name", { ascending: true });

    if (error) {
      errorMessage = `Supabase: ${error.message}`;
    } else {
      clients = data ?? [];
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "No se pudieron cargar los clientes.";
  }

  return <ClientManager initialClients={clients} initialError={errorMessage} />;
}
