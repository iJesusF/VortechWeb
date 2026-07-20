import { describe, it, expect } from "vitest";
import {
  generateSlug,
  generateWhatsAppUrl,
  formatPrice,
  truncateText,
  getSiteUrl,
  validateImageFile,
} from "@/lib/utils";

// ─────────────────────────────────────────────
// generateSlug
// ─────────────────────────────────────────────
describe("generateSlug", () => {
  it("convierte texto simple a slug", () => {
    expect(generateSlug("Automatización Industrial")).toBe("automatizacion-industrial");
  });

  it("elimina caracteres especiales", () => {
    expect(generateSlug("Válvula #1 (nueva)")).toBe("valvula-1-nueva");
  });

  it("colapsa espacios múltiples", () => {
    expect(generateSlug("hola   mundo")).toBe("hola-mundo");
  });

  it("elimina guiones al inicio y al final", () => {
    expect(generateSlug("  -hola-  ")).toBe("hola");
  });

  it("maneja texto vacío", () => {
    expect(generateSlug("")).toBe("");
  });

  it("normaliza acentos", () => {
    expect(generateSlug("ósmosis inversa")).toBe("osmosis-inversa");
  });

  it("convierte a minúsculas", () => {
    expect(generateSlug("PLC SCADA HMI")).toBe("plc-scada-hmi");
  });
});

// ─────────────────────────────────────────────
// generateWhatsAppUrl
// ─────────────────────────────────────────────
describe("generateWhatsAppUrl", () => {
  const base = {
    productName: "Sensor de Presión",
    productUrl: "https://vortech.mx/catalogo/sensor-de-presion",
    whatsappNumber: "526861455822",
  };

  it("genera URL base con formato correcto", () => {
    const url = generateWhatsAppUrl(base);
    expect(url).toMatch(/^https:\/\/wa\.me\/526861455822\?text=/);
  });

  it("incluye el nombre del producto en el mensaje", () => {
    const url = generateWhatsAppUrl(base);
    expect(decodeURIComponent(url)).toContain("Sensor de Presión");
  });

  it("incluye la URL del producto", () => {
    const url = generateWhatsAppUrl(base);
    expect(decodeURIComponent(url)).toContain("https://vortech.mx/catalogo/sensor-de-presion");
  });

  it("incluye el SKU cuando se proporciona", () => {
    const url = generateWhatsAppUrl({ ...base, sku: "SNS-001" });
    expect(decodeURIComponent(url)).toContain("SNS-001");
    expect(decodeURIComponent(url)).toContain("(SNS-001)");
  });

  it("no incluye paréntesis vacíos cuando no hay SKU", () => {
    const url = generateWhatsAppUrl({ ...base, sku: null });
    expect(decodeURIComponent(url)).not.toContain("()");
  });

  it("usa mensaje personalizado cuando se proporciona", () => {
    const url = generateWhatsAppUrl({
      ...base,
      customMessage: "Hola, necesito más información.",
    });
    expect(decodeURIComponent(url)).toContain("Hola, necesito más información.");
  });

  it("codifica correctamente los caracteres especiales", () => {
    const url = generateWhatsAppUrl({ ...base, productName: "Ósmosis & RO" });
    // The URL should be properly encoded (not contain raw & in text param)
    const textParam = url.split("?text=")[1];
    expect(textParam).not.toContain(" ");
  });

  it("mensaje por defecto NO incluye paréntesis con SKU nulo", () => {
    const url = generateWhatsAppUrl({ ...base, sku: undefined });
    const decoded = decodeURIComponent(url);
    expect(decoded).not.toMatch(/\(\s*\)/);
  });
});

// ─────────────────────────────────────────────
// formatPrice
// ─────────────────────────────────────────────
describe("formatPrice", () => {
  it("formatea precio en MXN por defecto", () => {
    const result = formatPrice(1500);
    expect(result).toContain("1,500");
  });

  it("formatea precio en USD", () => {
    const result = formatPrice(99.99, "USD");
    expect(result).toContain("99.99");
  });
});

// ─────────────────────────────────────────────
// truncateText
// ─────────────────────────────────────────────
describe("truncateText", () => {
  it("no trunca texto dentro del límite", () => {
    expect(truncateText("hola", 10)).toBe("hola");
  });

  it("trunca texto que excede el límite", () => {
    const result = truncateText("texto muy largo de ejemplo", 10);
    expect(result.length).toBeLessThanOrEqual(13); // 10 + "..."
    expect(result).toMatch(/\.\.\.$/);
  });

  it("retorna exactamente el límite sin truncar cuando es igual", () => {
    expect(truncateText("12345", 5)).toBe("12345");
  });
});

// ─────────────────────────────────────────────
// getSiteUrl
// ─────────────────────────────────────────────
describe("getSiteUrl", () => {
  it("combina base URL con path", () => {
    const url = getSiteUrl("/catalogo/producto-1");
    expect(url).toContain("/catalogo/producto-1");
  });

  it("retorna solo la URL base sin path", () => {
    const url = getSiteUrl();
    expect(url).toBeTruthy();
  });
});

// ─────────────────────────────────────────────
// validateImageFile
// ─────────────────────────────────────────────
describe("validateImageFile", () => {
  function makeFile(name: string, type: string, size: number): File {
    const blob = new Blob(["x".repeat(size)], { type });
    return new File([blob], name, { type });
  }

  it("acepta imagen JPEG válida", () => {
    const file = makeFile("photo.jpg", "image/jpeg", 1024);
    expect(validateImageFile(file).valid).toBe(true);
  });

  it("acepta imagen PNG válida", () => {
    const file = makeFile("photo.png", "image/png", 1024);
    expect(validateImageFile(file).valid).toBe(true);
  });

  it("acepta imagen WebP válida", () => {
    const file = makeFile("photo.webp", "image/webp", 1024);
    expect(validateImageFile(file).valid).toBe(true);
  });

  it("acepta imagen AVIF válida", () => {
    const file = makeFile("photo.avif", "image/avif", 1024);
    expect(validateImageFile(file).valid).toBe(true);
  });

  it("rechaza imagen GIF", () => {
    const file = makeFile("anim.gif", "image/gif", 1024);
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("rechaza archivo PDF", () => {
    const file = makeFile("doc.pdf", "application/pdf", 1024);
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
  });

  it("rechaza imagen mayor a 5MB", () => {
    const file = makeFile("huge.jpg", "image/jpeg", 6 * 1024 * 1024);
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("5MB");
  });

  it("acepta imagen exactamente en el límite de 5MB", () => {
    const file = makeFile("ok.jpg", "image/jpeg", 5 * 1024 * 1024);
    expect(validateImageFile(file).valid).toBe(true);
  });
});
