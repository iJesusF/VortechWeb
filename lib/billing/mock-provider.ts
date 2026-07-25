/**
 * Mock Billing Provider for development and testing.
 * Simulates invoice operations without external API calls.
 */

import type {
  BillingProvider,
  CustomerTaxData,
  CreateInvoiceParams,
  InvoiceResult,
  InvoiceStatus,
} from "./provider";

export class MockBillingProvider implements BillingProvider {
  readonly name = "mock";
  readonly isConfigured = true;

  async validateCustomerTaxData(data: CustomerTaxData): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!data.rfc || data.rfc.length < 12) {
      errors.push("RFC debe tener al menos 12 caracteres");
    }
    if (!data.businessName) {
      errors.push("Razón social requerida");
    }
    if (!data.taxRegime) {
      errors.push("Régimen fiscal requerido");
    }
    if (!data.cfdiUse) {
      errors.push("Uso CFDI requerido");
    }
    if (!data.fiscalZipCode || data.fiscalZipCode.length !== 5) {
      errors.push("Código postal fiscal debe tener 5 dígitos");
    }

    return { valid: errors.length === 0, errors };
  }

  async createInvoice(_params: CreateInvoiceParams): Promise<InvoiceResult> {
    const externalId = `MOCK-INV-${Date.now()}`;
    return {
      externalId,
      uuid: `MOCK-UUID-${crypto.randomUUID().substring(0, 8)}`,
      status: "stamped",
      pdfUrl: undefined,
      xmlUrl: undefined,
    };
  }

  async getInvoiceStatus(_externalId: string): Promise<InvoiceStatus> {
    return {
      status: "stamped",
      uuid: `MOCK-UUID-${_externalId.substring(9)}`,
    };
  }

  async downloadPdf(_externalId: string): Promise<Buffer> {
    return Buffer.from("Mock PDF content for development");
  }

  async downloadXml(_externalId: string): Promise<Buffer> {
    return Buffer.from('<?xml version="1.0"?><mock>Development XML</mock>');
  }

  async cancelInvoice(_externalId: string, _reason: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: "Mock invoice cancelled" };
  }
}
