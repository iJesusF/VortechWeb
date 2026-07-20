import { formatPrice } from "@/lib/utils";
import type { PriceMode } from "@/lib/types/database";

interface PriceDisplayProps {
  priceMode: PriceMode;
  price: number | null;
  currency: string;
  className?: string;
}

export function PriceDisplay({ priceMode, price, currency, className = "" }: PriceDisplayProps) {
  switch (priceMode) {
    case "fixed":
      return (
        <span className={`text-sm font-bold text-white ${className}`}>
          {price ? formatPrice(price, currency) : "Consultar precio"}
        </span>
      );
    case "from":
      return (
        <span className={`text-sm font-bold text-white ${className}`}>
          {price ? `Desde ${formatPrice(price, currency)}` : "Consultar precio"}
        </span>
      );
    case "hidden":
      return null;
    case "request_quote":
    default:
      return (
        <span className={`text-sm font-medium text-cyanx ${className}`}>
          Consultar precio
        </span>
      );
  }
}
