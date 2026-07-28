import { calculateQuoteTotals } from "@/lib/quotations/calculations";
import type { Json } from "@/lib/types/database";
import type { QuoteInput } from "@/lib/validations/quote";

export function prepareQuote(input: QuoteInput) {
  const totals = calculateQuoteTotals({
    items: input.items.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountType: item.discountType,
      discountValue: item.discountValue,
      taxRate: item.taxRate,
      withholdingRate: item.withholdingRate,
    })),
    generalDiscountType: "none",
    generalDiscountValue: 0,
    shippingTotal: input.shippingTotal,
    paymentFeeType: "none",
    paymentFeeValue: 0,
    paymentFeePaidBy: "seller",
  });

  const rpcItems: Json = input.items.map((item, index) => ({
    item_type: item.itemType,
    product_id: item.productId ?? null,
    sku: item.sku,
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unitPrice,
    discount_type: item.discountType,
    discount_value: item.discountValue,
    tax_rate: item.taxRate,
    withholding_rate: item.withholdingRate,
    line_subtotal: totals.items[index]?.lineSubtotal ?? 0,
    line_total: totals.items[index]?.lineTotal ?? 0,
    sort_order: index,
  }));

  return { totals, rpcItems };
}
