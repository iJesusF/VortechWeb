import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import type { Database } from "@/lib/database.types"

type QuoteRequestInsert =
  Database["public"]["Tables"]["quote_requests"]["Insert"]

const cartItemSchema = z.object({
  product_id: z.string().optional(),
  name: z.string().min(1).max(200),
  sku: z.string().max(50).nullable().optional(),
  quantity: z.number().int().min(1).max(9999),
  url: z.string().max(500).nullable().optional(),
  observations: z.string().max(500).nullable().optional(),
  unit_price: z.number().nullable().optional(),
  image_url: z.string().max(500).nullable().optional(),
});

const quoteRequestSchema = z.object({
  customer_name: z.string().min(1, "Nombre requerido").max(200),
  company: z.string().max(200).nullable().optional(),
  email: z.string().email("Correo inválido").max(200),
  phone: z.string().min(7, "Teléfono inválido").max(20),
  rfc: z.string().max(13).nullable().optional(),
  general_notes: z.string().max(2000).nullable().optional(),
  cart_snapshot: z.array(cartItemSchema).min(1, "Al menos un producto requerido").max(50),
});

// Simple rate limiting in memory (in production use Redis or similar)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // requests
const RATE_WINDOW = 60 * 1000; // per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

function generateRequestNumber(): string {
  const date = new Date();
  const prefix = "SOL";
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${datePart}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta en un minuto." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = quoteRequestSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Datos inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = validation.data;
    const requestNumber = generateRequestNumber();

    // If Supabase is configured, save to database
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createServiceRoleClient } = await import("@/lib/supabase/server");
      const supabase = createServiceRoleClient();

      const { error: dbError } = await supabase.from("quote_requests").insert({
        request_number: requestNumber,
        customer_name: data.customer_name,
        company: data.company || null,
        email: data.email,
        phone: data.phone,
        rfc: data.rfc || null,
        general_notes: data.general_notes || null,
        status: "new" as const,
        cart_snapshot: data.cart_snapshot,
      });

      if (dbError) {
        console.error("Failed to save quote request:", dbError.message);
        // Don't expose internal error details
        return NextResponse.json(
          { error: "Error al guardar la solicitud. Intenta de nuevo." },
          { status: 500 }
        );
      }
    }

    // Return success even without DB (for development without Supabase)
    return NextResponse.json({
      success: true,
      request_number: requestNumber,
      message: "Solicitud recibida correctamente",
    });
  } catch {
    return NextResponse.json(
      { error: "Error interno. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
