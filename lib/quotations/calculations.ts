export type Discount = { type: "none" | "fixed" | "percentage"; valueCents?: number; valueBasisPoints?: number };
export type CalculationItem = { quantityMilliunits: number; unitPriceCents?: number | null; discount?: Discount; taxBasisPoints?: number; withholdingBasisPoints?: number };
export type CalculationInput = { items: CalculationItem[]; generalDiscount?: Discount; shippingCents?: number; paymentFee?: { type: "none" | "fixed" | "percentage"; valueCents?: number; valueBasisPoints?: number; paidBy: "seller" | "customer" } };
export type CalculationResult = { subtotalCents: number; discountCents: number; taxCents: number; withholdingCents: number; shippingCents: number; paymentFeeCents: number; grandTotalCents: number; sellerNetCents: number };

function rounded(value: number) { return Math.round(value); }
function discount(base: number, value: Discount | undefined) { if (!value || value.type === "none") return 0; const result = value.type === "fixed" ? value.valueCents ?? 0 : rounded(base * (value.valueBasisPoints ?? 0) / 10_000); return Math.min(base, Math.max(0, result)); }
export function calculateQuote(input: CalculationInput): CalculationResult {
  let subtotalCents = 0; let discountCents = 0; let taxCents = 0; let withholdingCents = 0;
  for (const item of input.items) { if (!Number.isInteger(item.quantityMilliunits) || item.quantityMilliunits <= 0) throw new Error("La cantidad debe ser positiva."); const price = item.unitPriceCents ?? 0; if (!Number.isInteger(price) || price < 0) throw new Error("El precio no puede ser negativo."); const line = rounded(item.quantityMilliunits * price / 1000); const lineDiscount = discount(line, item.discount); const taxable = line - lineDiscount; subtotalCents += line; discountCents += lineDiscount; taxCents += rounded(taxable * (item.taxBasisPoints ?? 0) / 10_000); withholdingCents += rounded(taxable * (item.withholdingBasisPoints ?? 0) / 10_000); }
  const generalDiscount = discount(subtotalCents - discountCents, input.generalDiscount); discountCents += generalDiscount;
  const shippingCents = Math.max(0, input.shippingCents ?? 0); const beforeFee = subtotalCents - discountCents + taxCents - withholdingCents + shippingCents; if (beforeFee < 0) throw new Error("El total no puede ser negativo.");
  const fee = input.paymentFee; const paymentFeeCents = fee?.paidBy === "customer" ? (fee.type === "fixed" ? Math.max(0, fee.valueCents ?? 0) : fee.type === "percentage" ? rounded(beforeFee * (fee.valueBasisPoints ?? 0) / 10_000) : 0) : 0; const sellerFee = fee?.paidBy === "seller" ? (fee.type === "fixed" ? Math.max(0, fee.valueCents ?? 0) : fee.type === "percentage" ? rounded(beforeFee * (fee.valueBasisPoints ?? 0) / 10_000) : 0) : 0;
  return { subtotalCents, discountCents, taxCents, withholdingCents, shippingCents, paymentFeeCents, grandTotalCents: beforeFee + paymentFeeCents, sellerNetCents: beforeFee - sellerFee };
}
export const formatMXN = (cents: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(cents / 100);
