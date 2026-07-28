import { describe, it, expect } from "vitest";
import { MockBillingProvider } from "@/lib/billing/mock-provider";

describe("MockBillingProvider", () => {
  const provider = new MockBillingProvider();

  it("reports as configured", () => {
    expect(provider.isConfigured).toBe(true);
    expect(provider.name).toBe("mock");
  });

  it("validates complete tax data", async () => {
    const result = await provider.validateCustomerTaxData({
      rfc: "XAXX010101000",
      businessName: "Empresa SA de CV",
      taxRegime: "601",
      cfdiUse: "G03",
      fiscalZipCode: "22000",
      email: "fiscal@empresa.com",
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects incomplete tax data", async () => {
    const result = await provider.validateCustomerTaxData({
      rfc: "ABC", // too short
      businessName: "",
      taxRegime: "",
      cfdiUse: "",
      fiscalZipCode: "123", // not 5 digits
      email: "test@test.com",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors).toContain("RFC debe tener al menos 12 caracteres");
    expect(result.errors).toContain("Razón social requerida");
  });

  it("creates mock invoice", async () => {
    const result = await provider.createInvoice({
      quoteId: "q1",
      customer: {
        rfc: "XAXX010101000",
        businessName: "Test SA",
        taxRegime: "601",
        cfdiUse: "G03",
        fiscalZipCode: "22000",
        email: "test@test.com",
      },
      items: [
        { description: "Servicio", quantity: 1, unit: "pieza", unitPrice: 1000, taxRate: 0.16, withholdingRate: 0 },
      ],
      paymentMethod: "PUE",
      paymentForm: "03",
      currency: "MXN",
    });
    expect(result.externalId).toContain("MOCK-INV");
    expect(result.status).toBe("stamped");
    expect(result.uuid).toContain("MOCK-UUID");
  });

  it("gets invoice status", async () => {
    const status = await provider.getInvoiceStatus("MOCK-INV-123");
    expect(status.status).toBe("stamped");
  });

  it("downloads mock PDF", async () => {
    const pdf = await provider.downloadPdf("MOCK-INV-123");
    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(0);
  });

  it("downloads mock XML", async () => {
    const xml = await provider.downloadXml("MOCK-INV-123");
    expect(xml).toBeInstanceOf(Buffer);
    expect(xml.toString()).toContain("xml");
  });

  it("cancels mock invoice", async () => {
    const result = await provider.cancelInvoice("MOCK-INV-123", "02");
    expect(result.success).toBe(true);
  });
});

describe("BillingProvider - Missing Credentials", () => {
  it("falls back to mock when no provider is configured", async () => {
    const { getBillingProvider } = await import("@/lib/billing");
    const provider = getBillingProvider();
    expect(provider.name).toBe("mock");
    expect(provider.isConfigured).toBe(true);
  });
});
