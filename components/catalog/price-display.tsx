import { formatPrice } from "@/lib/utils";

interface PriceDisplayProps {
  priceMode: "request_quote" | "fixed" | "from" | "hidden";
  price?: number | null;
  currency?: string;
}

export function PriceDisplay({ priceMode, price, currency = "MXN" }: PriceDisplayProps) {
  if (priceMode === "hidden") return null;

  if (priceMode === "request_quote") {
    return (
      <span className="inline-flex items-center rounded-full border border-cyanx/25 bg-cyanx/10 px-3 py-1 text-sm font-semibold text-cyanx">
        Consultar precio
      </span>
    );
  }

  if (priceMode === "fixed" && price) {
    return (
      <span className="text-2xl font-bold text-white">
        {formatPrice(price, currency)}
        <span className="ml-1 text-sm font-normal text-slate-400">{currency}</span>
      </span>
    );
  }

  if (priceMode === "from" && price) {
    return (
      <span className="text-2xl font-bold text-white">
        Desde {formatPrice(price, currency)}
        <span className="ml-1 text-sm font-normal text-slate-400">{currency}</span>
      </span>
    );
  }

  return null;
}
