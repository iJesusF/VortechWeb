import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { quoteRequestStatusSchema } from "@/lib/validations/quote-request";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const requestIdSchema = z.string().uuid();
const updateSchema = z.object({ status: quoteRequestStatusSchema });

export async function PATCH(request: NextRequest, context: RouteContext) {
  const traceId = randomUUID();

  try {
    const { id } = await context.params;
    if (!requestIdSchema.safeParse(id).success) {
      return NextResponse.json(
        { error: "Identificador de solicitud inválido.", trace_id: traceId },
        { status: 400 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "El contenido de la solicitud no es válido.", trace_id: traceId },
        { status: 400 }
      );
    }

    const validation = updateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Estado de solicitud inválido.", trace_id: traceId },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sesión administrativa no válida.", trace_id: traceId },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("quote_requests")
      .update({ status: validation.data.status })
      .eq("id", id)
      .select("id, status, updated_at")
      .maybeSingle();

    if (error) {
      console.error("[admin-quote-request]", {
        traceId,
        event: "status_update_failed",
        requestId: id,
        code: error.code,
        message: error.message,
      });
      return NextResponse.json(
        {
          error: `Supabase no pudo actualizar el estado: ${error.message}`,
          trace_id: traceId,
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "La solicitud no existe o no tienes permiso para modificarla.", trace_id: traceId },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("[admin-quote-request]", {
      traceId,
      event: "unexpected_status_update_error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "No se pudo actualizar la solicitud.", trace_id: traceId },
      { status: 500 }
    );
  }
}
