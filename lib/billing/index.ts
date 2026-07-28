import type { BillingProvider } from "./provider";
import { MockBillingProvider } from "./mock-provider";

export type { BillingProvider, CustomerTaxData, CreateInvoiceParams, InvoiceResult, InvoiceStatus } from "./provider";

/**
 * Get the active billing provider based on configuration.
 * Returns mock for development; real providers require:
 * - BILLING_PROVIDER environment variable
 * - BILLING_API_KEY
 * - BILLING_API_SECRET
 */
export function getBillingProvider(): BillingProvider {
  const provider = process.env.BILLING_PROVIDER;

  switch (provider) {
    case "factura_com":
      // TODO: Implement after consulting official Factura.com documentation
      // and confirming sandbox credentials
      return new MockBillingProvider();

    case "konta":
      // TODO: Implement after consulting official Konta.com documentation
      return new MockBillingProvider();

    default:
      return new MockBillingProvider();
  }
}
