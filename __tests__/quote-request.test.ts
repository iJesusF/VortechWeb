import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { POST } from "@/app/api/quote-requests/route";
import { quoteRequestSchema } from "@/lib/validations/quote-request";

const validPayload = {
  customer_name: "Cliente de prueba",
  company: "VORTECH Test",
  email: "cliente@example.com",
  phone: "6641234567",
  rfc: null,
  general_notes: "Necesito disponibilidad.",
  cart_snapshot: [
    {
      product_id: "product-test",
      name: "Producto de prueba",
      sku: "TEST-001",
      quantity: 2,
      url: "https://example.com/catalogo/producto",
      observations: null,
      unit_price: 100,
      image_url: null,
    },
  ],
};

describe("quoteRequestSchema", () => {
  it("accepts a complete quote request", () => {
    expect(quoteRequestSchema.safeParse(validPayload).success).toBe(true);
  });

  it("rejects requests without items", () => {
    const result = quoteRequestSchema.safeParse({
      ...validPayload,
      cart_snapshot: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email and negative prices", () => {
    const result = quoteRequestSchema.safeParse({
      ...validPayload,
      email: "invalid-email",
      cart_snapshot: [{ ...validPayload.cart_snapshot[0], unit_price: -1 }],
    });
    expect(result.success).toBe(false);
  });
});

describe("POST /api/quote-requests", () => {
  it("never reports success when the database connection is missing", async () => {
    const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const previousServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    try {
      const response = await POST(
        new NextRequest("http://localhost/api/quote-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validPayload),
        })
      );
      const payload = await response.json();

      expect(response.status).toBe(503);
      expect(payload.success).not.toBe(true);
      expect(payload.error).toContain("no está disponible");
    } finally {
      if (previousUrl === undefined) {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      } else {
        process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
      }
      if (previousServiceKey === undefined) {
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      } else {
        process.env.SUPABASE_SERVICE_ROLE_KEY = previousServiceKey;
      }
    }
  });
});
