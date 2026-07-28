import { applyDiscount, formatPrice } from "@/lib/catalog/utils";
import type { DiscountType, PriceMode } from "@/lib/types/database";

interface PriceDisplayProps {
  priceMode: PriceMode;
  price: number | null;
  currency: string;
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
  compact?: boolean;
}

export function PriceDisplay({ priceMode, price, currency, discountType, discountValue, taxRate, compact = false }: PriceDisplayProps) {
  if (priceMode === "hidden") return <span className="text-xs text-slate-500">Precio no publicado</span>;
  if (priceMode === "request_quote" || price === null) return <span className="inline-flex rounded-full border border-cyanx/25 bg-cyanx/10 px-3 py-1 text-sm font-semibold text-cyanx">Solicitar cotización</span>;

  const discounted = applyDiscount(price, discountType, discountValue);
  const hasDiscount = discountType !== "none" && discountValue > 0 && discounted < price;
  return (
    <div>
      {hasDiscount && <div className="text-xs text-slate-500 line-through">{formatPrice(price, currency)}</div>}
      <div className={compact ? "text-base font-bold text-white" : "text-2xl font-bold text-white"}>{priceMode === "from" ? "Desde " : ""}{formatPrice(discounted, currency)}</div>
      {hasDiscount && <span className="mt-1 inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">{discountType === "percentage" ? `${discountValue}% de descuento` : `Descuento ${formatPrice(discountValue, currency)}`}</span>}
      {taxRate > 0 && <p className="mt-1 text-xs text-slate-500">Más {(taxRate * 100).toLocaleString("es-MX")}% de IVA</p>}
    </div>
  );
}
