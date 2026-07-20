import { describe, it, expect, beforeEach, vi } from "vitest";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

describe("generateWhatsAppUrl", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "5215512345678");
  });

  it("generates correct URL with product name and SKU", () => {
    const url = generateWhatsAppUrl({
      productName: "Sistema PLC Siemens",
      sku: "PLC-S7-1200",
      productUrl: "https://example.com/catalogo/sistema-plc-siemens",
    });

    expect(url).toContain("https://wa.me/5215512345678?text=");
    expect(url).toContain(encodeURIComponent('"Sistema PLC Siemens"'));
    expect(url).toContain(encodeURIComponent("(PLC-S7-1200)"));
    expect(url).toContain(encodeURIComponent("https://example.com/catalogo/sistema-plc-siemens"));
  });

  it("generates correct URL without SKU (no empty parentheses)", () => {
    const url = generateWhatsAppUrl({
      productName: "Sensor de temperatura",
      sku: null,
      productUrl: "https://example.com/catalogo/sensor-temperatura",
    });

    expect(url).toContain(encodeURIComponent('"Sensor de temperatura"'));
    expect(url).not.toContain(encodeURIComponent("()"));
    expect(url).not.toContain(encodeURIComponent("(null)"));
    expect(url).not.toContain(encodeURIComponent("(undefined)"));
  });

  it("generates correct URL with empty SKU", () => {
    const url = generateWhatsAppUrl({
      productName: "Bomba dosificadora",
      sku: "",
      productUrl: "https://example.com/catalogo/bomba-dosificadora",
    });

    expect(url).not.toContain(encodeURIComponent("()"));
  });

  it("uses override message when provided", () => {
    const customMessage = "Hola, necesito cotización especial para este producto.";
    const url = generateWhatsAppUrl({
      productName: "Sistema SCADA",
      sku: "SCADA-01",
      productUrl: "https://example.com/catalogo/sistema-scada",
      overrideMessage: customMessage,
    });

    expect(url).toContain(encodeURIComponent(customMessage));
    // Should NOT contain the default template
    expect(url).not.toContain(encodeURIComponent("Quisiera consultar precio"));
  });

  it("uses phone number from environment variable", () => {
    const url = generateWhatsAppUrl({
      productName: "Test",
      sku: null,
      productUrl: "https://example.com",
    });

    expect(url.startsWith("https://wa.me/5215512345678?text=")).toBe(true);
  });

  it("properly encodes special characters in product name", () => {
    const url = generateWhatsAppUrl({
      productName: "Válvula 3/4\" & Check",
      sku: null,
      productUrl: "https://example.com/catalogo/valvula",
    });

    // Should be a valid URL (encodeURIComponent handles special chars)
    expect(url).toContain("https://wa.me/");
    expect(() => new URL(url)).not.toThrow();
  });
});
