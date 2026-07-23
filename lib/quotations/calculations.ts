/**
 * VORTECH Quotation Calculation Engine
 *
 * Pure functions for computing line items, taxes, withholdings,
 * discounts, fees, and totals. All monetary values are handled
 * as integers (centavos) internally to avoid floating point errors.
 * Public API accepts and returns decimals (pesos) for convenience.
 */

import type { DiscountType, FeeType, FeePaidBy } from "@/lib/types/database";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LineItemInput {
  quantity: number;
  unitPrice: number;
  discountType: DiscountType;
  discountValue: number;
  taxRate: number; // e.g. 0.16 for 16%
  withholdingRate: number; // e.g. 0.0 or 0.04 or 0.1067
}

export interface LineItemResult {
  lineSubtotal: number;
  discountAmount: number;
  taxableBase: number;
  taxAmount: number;
  withholdingAmount: number;
  lineTotal: number;
}

export interface QuoteTotalsInput {
  items: LineItemInput[];
  generalDiscountType: DiscountType;
  generalDiscountValue: number;
  shippingTotal: number;
  paymentFeeType: FeeType;
  paymentFeeValue: number;
  paymentFeePaidBy: FeePaidBy;
}

export interface QuoteTotalsResult {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  withholdingTotal: number;
  shippingTotal: number;
  paymentFeeTotal: number;
  grandTotal: number;
  netToSeller: number;
  items: LineItemResult[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert pesos to centavos */
function toCentavos(amount: number): number {
  return Math.round(amount * 100);
}

/** Convert centavos to pesos with 2 decimals */
function toPesos(centavos: number): number {
  return Math.round(centavos) / 100;
}

/** Round to 2 decimal places */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

// ─── Line Item Calculation ───────────────────────────────────────────────────

export function calculateLineItem(input: LineItemInput): LineItemResult {
  const { quantity, unitPrice, discountType, discountValue, taxRate, withholdingRate } = input;

  // Subtotal before any discount
  const lineSubtotalCents = toCentavos(quantity * unitPrice);

  // Discount
  let discountCents = 0;
  if (discountType === "fixed") {
    discountCents = toCentavos(discountValue);
  } else if (discountType === "percentage") {
    discountCents = Math.round(lineSubtotalCents * (discountValue / 100));
  }

  // Cannot discount more than subtotal
  discountCents = Math.min(discountCents, lineSubtotalCents);

  const taxableBaseCents = lineSubtotalCents - discountCents;

  // Tax (IVA)
  const taxCents = Math.round(taxableBaseCents * taxRate);

  // Withholding (ISR, IVA retained, etc.)
  const withholdingCents = Math.round(taxableBaseCents * withholdingRate);

  // Line total = taxable base + tax - withholding
  const lineTotalCents = taxableBaseCents + taxCents - withholdingCents;

  return {
    lineSubtotal: toPesos(lineSubtotalCents),
    discountAmount: toPesos(discountCents),
    taxableBase: toPesos(taxableBaseCents),
    taxAmount: toPesos(taxCents),
    withholdingAmount: toPesos(withholdingCents),
    lineTotal: toPesos(lineTotalCents),
  };
}

// ─── Quote Totals ────────────────────────────────────────────────────────────

export function calculateQuoteTotals(input: QuoteTotalsInput): QuoteTotalsResult {
  const {
    items,
    generalDiscountType,
    generalDiscountValue,
    shippingTotal,
    paymentFeeType,
    paymentFeeValue,
    paymentFeePaidBy,
  } = input;

  // Calculate each line item
  const lineResults = items.map(calculateLineItem);

  // Sum line subtotals (before line discounts)
  const rawSubtotalCents = lineResults.reduce(
    (sum, item) => sum + toCentavos(item.lineSubtotal),
    0
  );

  // Sum line discounts
  const lineDiscountsCents = lineResults.reduce(
    (sum, item) => sum + toCentavos(item.discountAmount),
    0
  );

  // General discount applied to (subtotal - line discounts)
  const afterLineDiscountsCents = rawSubtotalCents - lineDiscountsCents;
  let generalDiscountCents = 0;
  if (generalDiscountType === "fixed") {
    generalDiscountCents = toCentavos(generalDiscountValue);
  } else if (generalDiscountType === "percentage") {
    generalDiscountCents = Math.round(afterLineDiscountsCents * (generalDiscountValue / 100));
  }
  generalDiscountCents = Math.min(generalDiscountCents, afterLineDiscountsCents);

  const totalDiscountCents = lineDiscountsCents + generalDiscountCents;

  // Tax & withholding totals from line items
  const taxTotalCents = lineResults.reduce(
    (sum, item) => sum + toCentavos(item.taxAmount),
    0
  );
  const withholdingTotalCents = lineResults.reduce(
    (sum, item) => sum + toCentavos(item.withholdingAmount),
    0
  );

  // Shipping
  const shippingCents = toCentavos(shippingTotal);

  // Base amount for fee calculation = subtotal - discounts + tax - withholding + shipping
  const preFeeTotalCents =
    rawSubtotalCents - totalDiscountCents + taxTotalCents - withholdingTotalCents + shippingCents;

  // Payment fee
  let feeCents = 0;
  if (paymentFeeType === "fixed") {
    feeCents = toCentavos(paymentFeeValue);
  } else if (paymentFeeType === "percentage") {
    feeCents = Math.round(preFeeTotalCents * (paymentFeeValue / 100));
  }

  // Grand total depends on who pays the fee
  let grandTotalCents: number;
  let netToSellerCents: number;

  if (paymentFeePaidBy === "customer") {
    // Customer pays: fee is added to grand total
    grandTotalCents = preFeeTotalCents + feeCents;
    netToSellerCents = preFeeTotalCents;
  } else {
    // Seller absorbs: grand total is unchanged, net is reduced
    grandTotalCents = preFeeTotalCents;
    netToSellerCents = preFeeTotalCents - feeCents;
  }

  // Ensure grand total is never negative
  grandTotalCents = Math.max(0, grandTotalCents);
  netToSellerCents = Math.max(0, netToSellerCents);

  return {
    subtotal: toPesos(rawSubtotalCents),
    discountTotal: toPesos(totalDiscountCents),
    taxTotal: toPesos(taxTotalCents),
    withholdingTotal: toPesos(withholdingTotalCents),
    shippingTotal: toPesos(shippingCents),
    paymentFeeTotal: toPesos(feeCents),
    grandTotal: toPesos(grandTotalCents),
    netToSeller: toPesos(netToSellerCents),
    items: lineResults,
  };
}

// ─── Formatting ──────────────────────────────────────────────────────────────

export function formatMXN(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
