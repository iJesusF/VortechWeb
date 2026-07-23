/**
 * Payment Provider Interface
 *
 * Extensible interface for external payment gateways.
 * VORTECH does not process cards directly - all payments
 * redirect to external providers (PayPal, Stripe, etc.)
 */

export interface CreateCheckoutParams {
  quoteId: string;
  amount: number; // Server-calculated, never from client
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  sessionId: string;
  checkoutUrl: string;
  externalReference: string;
  expiresAt?: string;
}

export interface PaymentStatus {
  status: "pending" | "completed" | "failed" | "cancelled" | "expired";
  externalReference: string;
  paidAt?: string;
  amount?: number;
}

export interface WebhookVerification {
  isValid: boolean;
  eventType?: string;
  externalReference?: string;
  payload?: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: string;
  readonly isConfigured: boolean;

  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession>;
  getCheckoutUrl(sessionId: string): Promise<string>;
  getPaymentStatus(externalReference: string): Promise<PaymentStatus>;
  verifyWebhook(headers: Record<string, string>, body: string): Promise<WebhookVerification>;
  cancelSession(sessionId: string): Promise<void>;
}
