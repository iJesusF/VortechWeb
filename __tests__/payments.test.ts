import { describe, it, expect } from "vitest";
import { MockPaymentProvider } from "@/lib/payments/mock-provider";
import { PayPalProvider } from "@/lib/payments/paypal-provider";

describe("MockPaymentProvider", () => {
  const provider = new MockPaymentProvider();

  it("reports as configured", () => {
    expect(provider.isConfigured).toBe(true);
    expect(provider.name).toBe("mock");
  });

  it("creates checkout session", async () => {
    const session = await provider.createCheckoutSession({
      quoteId: "quote-123",
      amount: 1000,
      currency: "MXN",
      description: "Test quote",
      returnUrl: "https://vortech.mx/cotizacion/abc",
      cancelUrl: "https://vortech.mx/cotizacion/abc?cancelled=true",
    });

    expect(session.sessionId).toBeDefined();
    expect(session.checkoutUrl).toContain("mock_session");
    expect(session.externalReference).toBe(session.sessionId);
  });

  it("returns completed payment status", async () => {
    const session = await provider.createCheckoutSession({
      quoteId: "quote-123",
      amount: 500,
      currency: "MXN",
      description: "Test",
      returnUrl: "https://vortech.mx",
      cancelUrl: "https://vortech.mx",
    });

    const status = await provider.getPaymentStatus(session.externalReference);
    expect(status.status).toBe("completed");
    expect(status.amount).toBe(500);
  });

  it("verifies webhook", async () => {
    const result = await provider.verifyWebhook({}, JSON.stringify({ session_id: "test" }));
    expect(result.isValid).toBe(true);
    expect(result.eventType).toBe("payment.completed");
  });

  it("rejects invalid webhook", async () => {
    const result = await provider.verifyWebhook({}, "invalid json{{{");
    expect(result.isValid).toBe(false);
  });

  it("cancels session", async () => {
    const session = await provider.createCheckoutSession({
      quoteId: "q1",
      amount: 100,
      currency: "MXN",
      description: "test",
      returnUrl: "https://vortech.mx",
      cancelUrl: "https://vortech.mx",
    });

    await expect(provider.cancelSession(session.sessionId)).resolves.not.toThrow();
  });

  it("prevents duplicate sessions by using unique IDs", async () => {
    const s1 = await provider.createCheckoutSession({
      quoteId: "q1",
      amount: 100,
      currency: "MXN",
      description: "test1",
      returnUrl: "https://vortech.mx",
      cancelUrl: "https://vortech.mx",
    });
    const s2 = await provider.createCheckoutSession({
      quoteId: "q1",
      amount: 100,
      currency: "MXN",
      description: "test2",
      returnUrl: "https://vortech.mx",
      cancelUrl: "https://vortech.mx",
    });
    expect(s1.sessionId).not.toBe(s2.sessionId);
  });
});

describe("PayPalProvider", () => {
  const provider = new PayPalProvider();

  it("reports as not configured without env vars", () => {
    expect(provider.isConfigured).toBe(false);
    expect(provider.name).toBe("paypal");
  });

  it("throws when trying to create session without config", async () => {
    await expect(
      provider.createCheckoutSession({
        quoteId: "q1",
        amount: 1000,
        currency: "MXN",
        description: "test",
        returnUrl: "https://vortech.mx",
        cancelUrl: "https://vortech.mx",
      })
    ).rejects.toThrow("no está configurado");
  });
});
