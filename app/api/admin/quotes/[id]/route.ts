import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";
import { quoteStatusUpdateSchema } from "@/lib/validations/quote";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Identificador de cotización inválido." }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Sesión administrativa no válida." }, { status: 401 });
    }

    const validation = quoteStatusUpdateSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message ?? "El estado no es válido." },
        { status: 400 }
      );
    }

    const metadata: Json = validation.data.note
      ? { note: validation.data.note }
      : {};
    const { data, error } = await supabase.rpc("update_quote_status", {
      _quote_id: id,
      _status: validation.data.status,
      _metadata: metadata,
    });

    if (error) {
      return NextResponse.json(
        { error: `Supabase no pudo actualizar el estado: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ quote: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar el estado." },
      { status: 500 }
    );
  }
}
