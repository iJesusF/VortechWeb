/**
 * Mock Payment Provider for development and testing.
 * Simulates a payment gateway without external calls.
 */

import type {
  PaymentProvider,
  CreateCheckoutParams,
  CheckoutSession,
  PaymentStatus,
  WebhookVerification,
} from "./provider";

export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";
  readonly isConfigured = true;

  private sessions = new Map<string, { params: CreateCheckoutParams; status: string }>();

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
    const sessionId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.sessions.set(sessionId, { params, status: "pending" });

    return {
      sessionId,
      checkoutUrl: `${params.returnUrl}?mock_session=${sessionId}&mock_status=completed`,
      externalReference: sessionId,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }

  async getCheckoutUrl(sessionId: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Session not found");
    return `${session.params.returnUrl}?mock_session=${sessionId}`;
  }

  async getPaymentStatus(externalReference: string): Promise<PaymentStatus> {
    const session = this.sessions.get(externalReference);
    return {
      status: session ? "completed" : "pending",
      externalReference,
      paidAt: session ? new Date().toISOString() : undefined,
      amount: session?.params.amount,
    };
  }

  async verifyWebhook(_headers: Record<string, string>, body: string): Promise<WebhookVerification> {
    try {
      const payload = JSON.parse(body);
      return {
        isValid: true,
        eventType: "payment.completed",
        externalReference: payload.session_id || "unknown",
        payload,
      };
    } catch {
      return { isValid: false };
    }
  }

  async cancelSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }
}
