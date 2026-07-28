import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";
import { clientUpdateSchema } from "@/lib/validations/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Identificador de cliente inválido." }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Sesión administrativa no válida." }, { status: 401 });
    }

    const validation = clientUpdateSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message ?? "Los datos no son válidos." },
        { status: 400 }
      );
    }

    const updates: Database["public"]["Tables"]["clients"]["Update"] = validation.data;
    const { data, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Supabase no pudo actualizar el cliente: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "El cliente no existe." }, { status: 404 });
    }

    return NextResponse.json({ client: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar el cliente." },
      { status: 500 }
    );
  }
}
