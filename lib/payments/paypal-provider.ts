/**
 * PayPal Payment Provider (scaffold)
 *
 * This is a prepared adapter for PayPal integration.
 * It requires valid credentials in environment variables:
 * - PAYPAL_CLIENT_ID
 * - PAYPAL_CLIENT_SECRET
 * - PAYPAL_WEBHOOK_ID
 *
 * Without credentials, isConfigured returns false and methods throw.
 * Do NOT invent endpoints - use official PayPal REST API documentation.
 * PayPal REST API base URLs:
 * - Sandbox: https://api-m.sandbox.paypal.com
 * - Production: https://api-m.paypal.com
 */

import type {
  PaymentProvider,
  CreateCheckoutParams,
  CheckoutSession,
  PaymentStatus,
  WebhookVerification,
} from "./provider";

export class PayPalProvider implements PaymentProvider {
  readonly name = "paypal";

  get isConfigured(): boolean {
    return !!(
      process.env.PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET
    );
  }

  private get baseUrl(): string {
    // Use sandbox by default; switch to production via env
    return process.env.PAYPAL_ENVIRONMENT === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
  }

  private assertConfigured() {
    if (!this.isConfigured) {
      throw new Error(
        "PayPal no está configurado. Configure PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET."
      );
    }
  }

  async createCheckoutSession(_params: CreateCheckoutParams): Promise<CheckoutSession> {
    this.assertConfigured();
    // TODO: Implement using PayPal Orders API v2
    // POST /v2/checkout/orders
    // Documentation: https://developer.paypal.com/docs/api/orders/v2/
    throw new Error("PayPal integration pending - requires verified API documentation and sandbox testing.");
  }

  async getCheckoutUrl(_sessionId: string): Promise<string> {
    this.assertConfigured();
    throw new Error("PayPal integration pending.");
  }

  async getPaymentStatus(_externalReference: string): Promise<PaymentStatus> {
    this.assertConfigured();
    // TODO: GET /v2/checkout/orders/{id}
    throw new Error("PayPal integration pending.");
  }

  async verifyWebhook(_headers: Record<string, string>, _body: string): Promise<WebhookVerification> {
    this.assertConfigured();
    // TODO: POST /v1/notifications/verify-webhook-signature
    // Must verify using PAYPAL_WEBHOOK_ID
    throw new Error("PayPal webhook verification pending.");
  }

  async cancelSession(_sessionId: string): Promise<void> {
    this.assertConfigured();
    throw new Error("PayPal integration pending.");
  }
}
