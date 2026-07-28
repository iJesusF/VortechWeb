import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";
import { clientInputSchema } from "@/lib/validations/client";

async function getAuthenticatedClient() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { supabase, user, error };
}
export async function GET() {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedClient();
    if (authError || !user) {
      return NextResponse.json({ error: "Sesión administrativa no válida." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("business_name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Supabase no pudo consultar los clientes: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ clients: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudieron consultar los clientes." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedClient();
    if (authError || !user) {
      return NextResponse.json({ error: "Sesión administrativa no válida." }, { status: 401 });
    }

    const validation = clientInputSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message ?? "Los datos del cliente no son válidos." },
        { status: 400 }
      );
    }

    const input: Database["public"]["Tables"]["clients"]["Insert"] = {
      client_type: validation.data.client_type,
      business_name: validation.data.business_name,
      contact_name: validation.data.contact_name,
      email: validation.data.email,
      phone: validation.data.phone,
      rfc: validation.data.rfc ?? null,
      tax_regime: validation.data.tax_regime ?? null,
      cfdi_use: validation.data.cfdi_use ?? null,
      fiscal_zip_code: validation.data.fiscal_zip_code ?? null,
      billing_address: null,
      shipping_address: null,
      notes: validation.data.notes ?? null,
      is_active: validation.data.is_active,
    };

    const { data, error } = await supabase
      .from("clients")
      .insert(input)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Supabase no pudo crear el cliente: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ client: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo crear el cliente." },
      { status: 500 }
    );
  }
}
