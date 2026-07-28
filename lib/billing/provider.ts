/**
 * Billing Provider Interface
 *
 * Decoupled interface for future integration with:
 * - Factura.com
 * - Konta.com
 * - Other CFDI 4.0 compliant providers
 *
 * Before implementing any real provider:
 * 1. Consult current official documentation
 * 2. Confirm authentication method
 * 3. Confirm sandbox availability
 * 4. Confirm endpoint structure
 * 5. Confirm webhook format
 * 6. Confirm CFDI 4.0 structure
 * 7. Confirm cancellation flow
 * 8. Confirm PDF/XML download
 * 9. Confirm certificate handling (CSD)
 */

export interface CustomerTaxData {
  rfc: string;
  businessName: string;
  taxRegime: string;
  cfdiUse: string;
  fiscalZipCode: string;
  email: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  productServiceKey?: string; // SAT catalog key
  unitKey?: string; // SAT unit key
  taxRate: number;
  withholdingRate: number;
}

export interface CreateInvoiceParams {
  quoteId: string;
  customer: CustomerTaxData;
  items: InvoiceLineItem[];
  paymentMethod: string; // SAT payment method code
  paymentForm: string; // SAT payment form code
  currency: string;
  notes?: string;
}

export interface InvoiceResult {
  externalId: string;
  uuid?: string; // UUID fiscal
  status: string;
  pdfUrl?: string;
  xmlUrl?: string;
}

export interface InvoiceStatus {
  status: "pending" | "stamped" | "cancelled" | "error";
  uuid?: string;
  cancellationDate?: string;
  errorMessage?: string;
}

export interface BillingProvider {
  readonly name: string;
  readonly isConfigured: boolean;

  validateCustomerTaxData(data: CustomerTaxData): Promise<{ valid: boolean; errors: string[] }>;
  createInvoice(params: CreateInvoiceParams): Promise<InvoiceResult>;
  getInvoiceStatus(externalId: string): Promise<InvoiceStatus>;
  downloadPdf(externalId: string): Promise<Buffer>;
  downloadXml(externalId: string): Promise<Buffer>;
  cancelInvoice(externalId: string, reason: string): Promise<{ success: boolean; message: string }>;
}
