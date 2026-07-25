import { describe, expect, it } from "vitest";
import { applyDiscount, generateSlug, getEffectivePriceMode } from "@/lib/catalog/utils";
import { categorySchema } from "@/lib/validations/category";
import { productSchema } from "@/lib/validations/product";

const validProduct = {
  name: "Controlador industrial",
  slug: "controlador-industrial",
  sku: "PLC-001",
  category_id: "4f27484c-b7c3-4f91-b173-bf023de1f7ec",
  short_description: "Controlador para automatización",
  description: "Descripción completa",
  specifications: { Voltaje: "24 VDC" },
  price_mode: "fixed" as const,
  price: 1000,
  currency: "MXN",
  unit: "pieza",
  discount_type: "none" as const,
  discount_value: 0,
  tax_rate: 0.16,
  is_active: true,
  is_featured: false,
  sort_order: 0,
  whatsapp_message_override: null,
};

describe("Catalog admin validation", () => {
  it("accepts every historical price mode", () => {
    for (const price_mode of ["request_quote", "fixed", "from", "hidden"] as const) {
      const price = price_mode === "fixed" || price_mode === "from" ? 100 : null;
      expect(productSchema.safeParse({ ...validProduct, price_mode, price }).success).toBe(true);
    }
  });

  it("requires a positive price for fixed and from modes", () => {
    expect(productSchema.safeParse({ ...validProduct, price: null }).success).toBe(false);
    expect(productSchema.safeParse({ ...validProduct, price_mode: "from", price: 0 }).success).toBe(false);
  });

  it("validates discount and tax ranges", () => {
    expect(productSchema.safeParse({ ...validProduct, discount_type: "percentage", discount_value: 101 }).success).toBe(false);
    expect(productSchema.safeParse({ ...validProduct, tax_rate: 1.01 }).success).toBe(false);
  });

  it("validates category slug", () => {
    expect(categorySchema.safeParse({ name: "Bombas", slug: "bombas-industriales", description: null, is_active: true, sort_order: 0 }).success).toBe(true);
    expect(categorySchema.safeParse({ name: "Bombas", slug: "Bombas Industriales", description: null, is_active: true, sort_order: 0 }).success).toBe(false);
  });
});

describe("Catalog compatibility helpers", () => {
  it("generates stable slugs", () => {
    expect(generateSlug("Ósmosis Inversa 500 LPH")).toBe("osmosis-inversa-500-lph");
  });

  it("preserves current unit_price products as visible prices", () => {
    expect(getEffectivePriceMode("request_quote", null, 1200)).toBe("fixed");
  });

  it("calculates percentage and fixed discounts", () => {
    expect(applyDiscount(1000, "percentage", 10)).toBe(900);
    expect(applyDiscount(1000, "fixed", 125)).toBe(875);
  });
});
