import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";
import { quoteRequestSchema } from "@/lib/validations/quote-request";

type QuoteRequestInsert =
  Database["public"]["Tables"]["quote_requests"]["Insert"];

const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 1000;
const MAX_BODY_BYTES = 100_000;
const MAX_INSERT_ATTEMPTS = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

function generateRequestNumber(): string {
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const randomPart = randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `SOL-${datePart}-${randomPart}`;
}

export async function POST(request: NextRequest) {
  const traceId = randomUUID();

  try {
    console.info("[quote-request]", { traceId, event: "submission_started" });

    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "La solicitud es demasiado grande.", trace_id: traceId },
        { status: 413 }
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          error: "Demasiadas solicitudes. Intenta en un minuto.",
          trace_id: traceId,
        },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "El contenido de la solicitud no es válido.",
          trace_id: traceId,
        },
        { status: 400 }
      );
    }

    const validation = quoteRequestSchema.safeParse(body);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      console.warn("[quote-request]", {
        traceId,
        event: "validation_failed",
        issue: firstIssue?.path.join("."),
      });
      return NextResponse.json(
        {
          error: firstIssue?.message ?? "Datos inválidos",
          trace_id: traceId,
        },
        { status: 400 }
      );
    }

    console.info("[quote-request]", {
      traceId,
      event: "validation_succeeded",
      itemCount: validation.data.cart_snapshot.length,
    });

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error("[quote-request]", {
        traceId,
        event: "database_configuration_missing",
      });
      return NextResponse.json(
        {
          error:
            "El servicio de solicitudes no está disponible temporalmente. Contáctanos por WhatsApp o intenta más tarde.",
          trace_id: traceId,
        },
        { status: 503 }
      );
    }

    const data = validation.data;
    const supabase = createServiceRoleClient();

    for (let attempt = 1; attempt <= MAX_INSERT_ATTEMPTS; attempt += 1) {
      const requestNumber = generateRequestNumber();
      const quoteRequest: QuoteRequestInsert = {
        request_number: requestNumber,
        customer_name: data.customer_name,
        company: data.company || null,
        email: data.email.toLowerCase(),
        phone: data.phone,
        rfc: data.rfc?.toUpperCase() || null,
        general_notes: data.general_notes || null,
        status: "new",
        cart_snapshot: data.cart_snapshot,
        converted_quote_id: null,
      };

      console.info("[quote-request]", {
        traceId,
        event: "database_insert_started",
        attempt,
      });

      const { data: savedRequest, error: databaseError } = await supabase
        .from("quote_requests")
        .insert(quoteRequest)
        .select("id, request_number, created_at, status")
        .single();

      if (!databaseError && savedRequest) {
        console.info("[quote-request]", {
          traceId,
          event: "database_insert_succeeded",
          recordId: savedRequest.id,
          itemCount: data.cart_snapshot.length,
        });
        return NextResponse.json(
          {
            success: true,
            request_number: savedRequest.request_number,
            message: "Solicitud recibida correctamente",
          },
          { status: 201 }
        );
      }

      if (databaseError?.code === "23505" && attempt < MAX_INSERT_ATTEMPTS) {
        continue;
      }

      console.error("[quote-request]", {
        traceId,
        event: "database_insert_failed",
        code: databaseError?.code,
        message: databaseError?.message,
      });
      return NextResponse.json(
        {
          error:
            "No pudimos guardar tu solicitud. No se registró ningún envío; intenta nuevamente.",
          trace_id: traceId,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error:
          "No pudimos generar un folio único. No se registró ningún envío; intenta nuevamente.",
        trace_id: traceId,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("[quote-request]", {
      traceId,
      event: "unexpected_error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        error:
          "Ocurrió un error interno. No se confirmó el envío; intenta nuevamente.",
        trace_id: traceId,
      },
      { status: 500 }
    );
  }
}
