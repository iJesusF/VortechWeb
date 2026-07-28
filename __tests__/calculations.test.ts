import { describe, it, expect } from "vitest";
import {
  calculateLineItem,
  calculateQuoteTotals,
  roundMoney,
  formatMXN,
} from "@/lib/quotations/calculations";

describe("roundMoney", () => {
  it("rounds to 2 decimal places", () => {
    expect(roundMoney(10.005)).toBe(10.01);
    expect(roundMoney(10.004)).toBe(10.0);
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });
});

describe("formatMXN", () => {
  it("formats correctly for es-MX", () => {
    const formatted = formatMXN(1234.5);
    expect(formatted).toContain("1,234.50");
  });
});

describe("calculateLineItem", () => {
  it("calculates basic line without tax or discount", () => {
    const result = calculateLineItem({
      quantity: 2,
      unitPrice: 100,
      discountType: "none",
      discountValue: 0,
      taxRate: 0,
      withholdingRate: 0,
    });
    expect(result.lineSubtotal).toBe(200);
    expect(result.discountAmount).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.withholdingAmount).toBe(0);
    expect(result.lineTotal).toBe(200);
  });

  it("applies IVA 16%", () => {
    const result = calculateLineItem({
      quantity: 1,
      unitPrice: 1000,
      discountType: "none",
      discountValue: 0,
      taxRate: 0.16,
      withholdingRate: 0,
    });
    expect(result.lineSubtotal).toBe(1000);
    expect(result.taxAmount).toBe(160);
    expect(result.lineTotal).toBe(1160);
  });

  it("applies ISR withholding", () => {
    const result = calculateLineItem({
      quantity: 1,
      unitPrice: 1000,
      discountType: "none",
      discountValue: 0,
      taxRate: 0.16,
      withholdingRate: 0.1067,
    });
    expect(result.lineSubtotal).toBe(1000);
    expect(result.taxAmount).toBe(160);
    expect(result.withholdingAmount).toBe(106.7);
    expect(result.lineTotal).toBe(1053.3);
  });

  it("applies fixed discount", () => {
    const result = calculateLineItem({
      quantity: 3,
      unitPrice: 500,
      discountType: "fixed",
      discountValue: 200,
      taxRate: 0,
      withholdingRate: 0,
    });
    expect(result.lineSubtotal).toBe(1500);
    expect(result.discountAmount).toBe(200);
    expect(result.lineTotal).toBe(1300);
  });

  it("applies percentage discount", () => {
    const result = calculateLineItem({
      quantity: 1,
      unitPrice: 1000,
      discountType: "percentage",
      discountValue: 10,
      taxRate: 0.16,
      withholdingRate: 0,
    });
    expect(result.lineSubtotal).toBe(1000);
    expect(result.discountAmount).toBe(100);
    expect(result.taxableBase).toBe(900);
    expect(result.taxAmount).toBe(144);
    expect(result.lineTotal).toBe(1044);
  });

  it("handles decimal quantities", () => {
    const result = calculateLineItem({
      quantity: 2.5,
      unitPrice: 100,
      discountType: "none",
      discountValue: 0,
      taxRate: 0,
      withholdingRate: 0,
    });
    expect(result.lineSubtotal).toBe(250);
    expect(result.lineTotal).toBe(250);
  });

  it("discount cannot exceed subtotal", () => {
    const result = calculateLineItem({
      quantity: 1,
      unitPrice: 100,
      discountType: "fixed",
      discountValue: 500,
      taxRate: 0,
      withholdingRate: 0,
    });
    expect(result.discountAmount).toBe(100);
    expect(result.lineTotal).toBe(0);
  });

  it("handles product without price (zero price)", () => {
    const result = calculateLineItem({
      quantity: 5,
      unitPrice: 0,
      discountType: "none",
      discountValue: 0,
      taxRate: 0.16,
      withholdingRate: 0,
    });
    expect(result.lineSubtotal).toBe(0);
    expect(result.lineTotal).toBe(0);
  });
});

describe("calculateQuoteTotals", () => {
  it("calculates simple quote without taxes", () => {
    const result = calculateQuoteTotals({
      items: [
        { quantity: 2, unitPrice: 500, discountType: "none", discountValue: 0, taxRate: 0, withholdingRate: 0 },
        { quantity: 1, unitPrice: 300, discountType: "none", discountValue: 0, taxRate: 0, withholdingRate: 0 },
      ],
      generalDiscountType: "none",
      generalDiscountValue: 0,
      shippingTotal: 0,
      paymentFeeType: "none",
      paymentFeeValue: 0,
      paymentFeePaidBy: "seller",
    });
    expect(result.subtotal).toBe(1300);
    expect(result.grandTotal).toBe(1300);
  });

  it("calculates with IVA on all items", () => {
    const result = calculateQuoteTotals({
      items: [
        { quantity: 1, unitPrice: 1000, discountType: "none", discountValue: 0, taxRate: 0.16, withholdingRate: 0 },
      ],
      generalDiscountType: "none",
      generalDiscountValue: 0,
      shippingTotal: 0,
      paymentFeeType: "none",
      paymentFeeValue: 0,
      paymentFeePaidBy: "seller",
    });
    expect(result.subtotal).toBe(1000);
    expect(result.taxTotal).toBe(160);
    expect(result.grandTotal).toBe(1160);
  });

  it("applies general percentage discount", () => {
    const result = calculateQuoteTotals({
      items: [
        { quantity: 1, unitPrice: 1000, discountType: "none", discountValue: 0, taxRate: 0, withholdingRate: 0 },
      ],
      generalDiscountType: "percentage",
      generalDiscountValue: 10,
      shippingTotal: 0,
      paymentFeeType: "none",
      paymentFeeValue: 0,
      paymentFeePaidBy: "seller",
    });
    expect(result.subtotal).toBe(1000);
    expect(result.discountTotal).toBe(100);
    expect(result.grandTotal).toBe(900);
  });

  it("adds shipping", () => {
    const result = calculateQuoteTotals({
      items: [
        { quantity: 1, unitPrice: 1000, discountType: "none", discountValue: 0, taxRate: 0, withholdingRate: 0 },
      ],
      generalDiscountType: "none",
      generalDiscountValue: 0,
      shippingTotal: 150,
      paymentFeeType: "none",
      paymentFeeValue: 0,
      paymentFeePaidBy: "seller",
    });
    expect(result.shippingTotal).toBe(150);
    expect(result.grandTotal).toBe(1150);
  });

  it("fixed fee absorbed by seller", () => {
    const result = calculateQuoteTotals({
      items: [
        { quantity: 1, unitPrice: 1000, discountType: "none", discountValue: 0, taxRate: 0, withholdingRate: 0 },
      ],
      generalDiscountType: "none",
      generalDiscountValue: 0,
      shippingTotal: 0,
      paymentFeeType: "fixed",
      paymentFeeValue: 50,
      paymentFeePaidBy: "seller",
    });
    expect(result.grandTotal).toBe(1000);
    expect(result.netToSeller).toBe(950);
    expect(result.paymentFeeTotal).toBe(50);
  });

  it("percentage fee passed to customer", () => {
    const result = calculateQuoteTotals({
      items: [
        { quantity: 1, unitPrice: 1000, discountType: "none", discountValue: 0, taxRate: 0, withholdingRate: 0 },
      ],
      generalDiscountType: "none",
      generalDiscountValue: 0,
      shippingTotal: 0,
      paymentFeeType: "percentage",
      paymentFeeValue: 3.6,
      paymentFeePaidBy: "customer",
    });
    expect(result.paymentFeeTotal).toBe(36);
    expect(result.grandTotal).toBe(1036);
    expect(result.netToSeller).toBe(1000);
  });

  it("handles combined IVA, ISR, discount, shipping, and fee", () => {
    const result = calculateQuoteTotals({
      items: [
        { quantity: 2, unitPrice: 5000, discountType: "percentage", discountValue: 5, taxRate: 0.16, withholdingRate: 0.1067 },
        { quantity: 1, unitPrice: 2000, discountType: "none", discountValue: 0, taxRate: 0.16, withholdingRate: 0 },
      ],
      generalDiscountType: "none",
      generalDiscountValue: 0,
      shippingTotal: 500,
      paymentFeeType: "percentage",
      paymentFeeValue: 3.6,
      paymentFeePaidBy: "customer",
    });
    // Item 1: subtotal=10000, discount=500, base=9500, iva=1520, isr=1013.65, total=10006.35
    // Item 2: subtotal=2000, discount=0, base=2000, iva=320, isr=0, total=2320
    expect(result.subtotal).toBe(12000);
    expect(result.items[0].discountAmount).toBe(500);
    expect(result.items[0].taxAmount).toBe(1520);
    expect(result.items[0].withholdingAmount).toBe(1013.65);
    expect(result.grandTotal).toBeGreaterThan(0);
  });

  it("prevents negative grand total", () => {
    const result = calculateQuoteTotals({
      items: [
        { quantity: 1, unitPrice: 100, discountType: "none", discountValue: 0, taxRate: 0, withholdingRate: 0.5 },
      ],
      generalDiscountType: "fixed",
      generalDiscountValue: 200,
      shippingTotal: 0,
      paymentFeeType: "none",
      paymentFeeValue: 0,
      paymentFeePaidBy: "seller",
    });
    expect(result.grandTotal).toBeGreaterThanOrEqual(0);
  });
});
