import { CompanySettingsForm } from "@/components/admin/company-settings-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EmpresaConfigPage() {
  const supabase = await createServerSupabaseClient();
  const { data: settings, error } = await supabase
    .from("company_settings")
    .select("*")
    .order("updated_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <CompanySettingsForm
      initialSettings={settings}
      initialError={error ? `Supabase: ${error.message}` : ""}
    />
  );
}
