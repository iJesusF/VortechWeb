import { describe, it, expect } from "vitest";
import { categorySchema } from "@/lib/validations/category";
import { productSchema, imageFileSchema } from "@/lib/validations/product";

// ─────────────────────────────────────────────
// categorySchema
// ─────────────────────────────────────────────
describe("categorySchema", () => {
  const validCategory = {
    name: "Automatización",
    slug: "automatizacion",
    is_active: true,
    sort_order: 0,
  };

  it("acepta una categoría válida", () => {
    expect(categorySchema.safeParse(validCategory).success).toBe(true);
  });

  it("rechaza nombre vacío", () => {
    const result = categorySchema.safeParse({ ...validCategory, name: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza nombre mayor a 100 caracteres", () => {
    const result = categorySchema.safeParse({ ...validCategory, name: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rechaza slug con caracteres inválidos", () => {
    const result = categorySchema.safeParse({ ...validCategory, slug: "Hola Mundo" });
    expect(result.success).toBe(false);
  });

  it("rechaza slug con mayúsculas", () => {
    const result = categorySchema.safeParse({ ...validCategory, slug: "AutoMatizacion" });
    expect(result.success).toBe(false);
  });

  it("acepta slug con guiones", () => {
    const result = categorySchema.safeParse({ ...validCategory, slug: "automatizacion-industrial" });
    expect(result.success).toBe(true);
  });

  it("acepta descripción nula", () => {
    const result = categorySchema.safeParse({ ...validCategory, description: null });
    expect(result.success).toBe(true);
  });

  it("rechaza descripción mayor a 500 caracteres", () => {
    const result = categorySchema.safeParse({ ...validCategory, description: "x".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("aplica valor por defecto is_active = true", () => {
    const result = categorySchema.safeParse({ name: "Test", slug: "test" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.is_active).toBe(true);
  });
});

// ─────────────────────────────────────────────
// productSchema
// ─────────────────────────────────────────────
describe("productSchema", () => {
  const validProduct = {
    name: "Sensor de Presión",
    slug: "sensor-de-presion",
    category_id: "550e8400-e29b-41d4-a716-446655440000",
    short_description: "Sensor industrial de alta precisión",
    description: "Descripción completa del sensor",
    price_mode: "request_quote" as const,
  };

  it("acepta un producto válido", () => {
    expect(productSchema.safeParse(validProduct).success).toBe(true);
  });

  it("rechaza nombre vacío", () => {
    const result = productSchema.safeParse({ ...validProduct, name: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza slug con caracteres inválidos", () => {
    const result = productSchema.safeParse({ ...validProduct, slug: "Sensor Presión" });
    expect(result.success).toBe(false);
  });

  it("rechaza category_id con formato incorrecto", () => {
    const result = productSchema.safeParse({ ...validProduct, category_id: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("acepta todos los modos de precio", () => {
    const modes = ["request_quote", "fixed", "from", "hidden"] as const;
    for (const mode of modes) {
      const result = productSchema.safeParse({ ...validProduct, price_mode: mode });
      expect(result.success).toBe(true);
    }
  });

  it("rechaza precio_mode inválido", () => {
    const result = productSchema.safeParse({ ...validProduct, price_mode: "free" });
    expect(result.success).toBe(false);
  });

  it("acepta precio decimal válido", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      price_mode: "fixed",
      price: 1500.5,
    });
    expect(result.success).toBe(true);
  });

  it("rechaza precio negativo", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      price_mode: "fixed",
      price: -100,
    });
    expect(result.success).toBe(false);
  });

  it("acepta sku nulo", () => {
    const result = productSchema.safeParse({ ...validProduct, sku: null });
    expect(result.success).toBe(true);
  });

  it("rechaza short_description vacía", () => {
    const result = productSchema.safeParse({ ...validProduct, short_description: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza short_description mayor a 300 caracteres", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      short_description: "x".repeat(301),
    });
    expect(result.success).toBe(false);
  });

  it("aplica valores por defecto correctos", () => {
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_active).toBe(false);
      expect(result.data.is_featured).toBe(false);
      expect(result.data.currency).toBe("MXN");
      expect(result.data.price_mode).toBe("request_quote");
    }
  });
});

// ─────────────────────────────────────────────
// imageFileSchema
// ─────────────────────────────────────────────
describe("imageFileSchema", () => {
  it("acepta image/jpeg", () => {
    expect(imageFileSchema.safeParse({ type: "image/jpeg", size: 1024 }).success).toBe(true);
  });

  it("acepta image/png", () => {
    expect(imageFileSchema.safeParse({ type: "image/png", size: 1024 }).success).toBe(true);
  });

  it("acepta image/webp", () => {
    expect(imageFileSchema.safeParse({ type: "image/webp", size: 1024 }).success).toBe(true);
  });

  it("acepta image/avif", () => {
    expect(imageFileSchema.safeParse({ type: "image/avif", size: 1024 }).success).toBe(true);
  });

  it("rechaza image/gif", () => {
    expect(imageFileSchema.safeParse({ type: "image/gif", size: 1024 }).success).toBe(false);
  });

  it("rechaza application/pdf", () => {
    expect(imageFileSchema.safeParse({ type: "application/pdf", size: 1024 }).success).toBe(false);
  });

  it("rechaza archivos mayores a 5MB", () => {
    expect(
      imageFileSchema.safeParse({ type: "image/jpeg", size: 6 * 1024 * 1024 }).success
    ).toBe(false);
  });

  it("acepta archivos en el límite exacto de 5MB", () => {
    expect(
      imageFileSchema.safeParse({ type: "image/jpeg", size: 5 * 1024 * 1024 }).success
    ).toBe(true);
  });
});
