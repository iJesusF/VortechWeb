import type { PaymentProvider } from "./provider";
import { MockPaymentProvider } from "./mock-provider";
import { PayPalProvider } from "./paypal-provider";

export type { PaymentProvider, CreateCheckoutParams, CheckoutSession, PaymentStatus, WebhookVerification } from "./provider";

/**
 * Get the active payment provider based on configuration.
 * Falls back to mock in development.
 */
export function getPaymentProvider(): PaymentProvider {
  const paypal = new PayPalProvider();
  if (paypal.isConfigured) {
    return paypal;
  }

  // In development or when no provider is configured, use mock
  if (process.env.NODE_ENV === "development") {
    return new MockPaymentProvider();
  }

  // In production without config, return a provider that reports unconfigured
  return new MockPaymentProvider();
}
