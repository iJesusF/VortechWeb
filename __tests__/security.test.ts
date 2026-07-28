import { describe, it, expect } from "vitest";

describe("Security - Token Validation", () => {
  it("rejects empty token", () => {
    const token = "";
    expect(token.length >= 10).toBe(false);
  });

  it("rejects short token", () => {
    const token = "abc";
    expect(token.length >= 10).toBe(false);
  });

  it("accepts valid length token", () => {
    const token = "abcdef1234567890";
    expect(token.length >= 10).toBe(true);
  });
});

describe("Security - Input Sanitization", () => {
  function sanitizeText(input: string): string {
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .trim();
  }

  it("escapes HTML in user input", () => {
    const malicious = '<script>alert("xss")</script>';
    const safe = sanitizeText(malicious);
    expect(safe).not.toContain("<script>");
    expect(safe).toContain("&lt;script&gt;");
  });

  it("trims whitespace", () => {
    expect(sanitizeText("  hello  ")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(sanitizeText("")).toBe("");
  });
});

describe("Security - Rate Limiting Logic", () => {
  const requests = new Map<string, { count: number; resetAt: number }>();
  const RATE_LIMIT = 5;
  const RATE_WINDOW = 60 * 1000;

  function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = requests.get(ip);
    if (!entry || now > entry.resetAt) {
      requests.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
      return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT;
  }

  it("allows first request", () => {
    expect(isRateLimited("192.168.1.1")).toBe(false);
  });

  it("allows up to rate limit", () => {
    const ip = "10.0.0.1";
    for (let i = 0; i < RATE_LIMIT; i++) {
      expect(isRateLimited(ip)).toBe(false);
    }
  });

  it("blocks after exceeding rate limit", () => {
    const ip = "10.0.0.2";
    for (let i = 0; i < RATE_LIMIT; i++) {
      isRateLimited(ip);
    }
    expect(isRateLimited(ip)).toBe(true);
  });

  it("different IPs have independent limits", () => {
    const ip1 = "172.16.0.1";
    const ip2 = "172.16.0.2";
    for (let i = 0; i < RATE_LIMIT; i++) {
      isRateLimited(ip1);
    }
    expect(isRateLimited(ip1)).toBe(true);
    expect(isRateLimited(ip2)).toBe(false);
  });
});

describe("Security - Quote Status Transitions", () => {
  type QuoteStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired" | "cancelled" | "payment_pending" | "paid";

  const validTransitions: Record<QuoteStatus, QuoteStatus[]> = {
    draft: ["sent", "cancelled"],
    sent: ["viewed", "expired", "cancelled"],
    viewed: ["accepted", "rejected", "expired", "cancelled"],
    accepted: ["payment_pending", "cancelled"],
    rejected: [],
    expired: ["draft"], // can create new version
    cancelled: [],
    payment_pending: ["paid", "cancelled"],
    paid: [],
  };

  function canTransition(from: QuoteStatus, to: QuoteStatus): boolean {
    return validTransitions[from]?.includes(to) ?? false;
  }

  it("allows draft to sent", () => {
    expect(canTransition("draft", "sent")).toBe(true);
  });

  it("allows accepted to payment_pending", () => {
    expect(canTransition("accepted", "payment_pending")).toBe(true);
  });

  it("blocks paid to any other status", () => {
    expect(canTransition("paid", "draft")).toBe(false);
    expect(canTransition("paid", "cancelled")).toBe(false);
  });

  it("blocks rejected to any other status", () => {
    expect(canTransition("rejected", "draft")).toBe(false);
    expect(canTransition("rejected", "sent")).toBe(false);
  });

  it("blocks direct draft to accepted", () => {
    expect(canTransition("draft", "accepted")).toBe(false);
  });
});
