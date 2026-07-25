import type { DiscountType, PriceMode } from "@/lib/types/database";

export function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatPrice(value: number, currency = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function getEffectivePrice(price: number | null, unitPrice: number | null): number | null {
  return price ?? unitPrice;
}

export function getEffectivePriceMode(
  mode: PriceMode,
  price: number | null,
  unitPrice: number | null
): PriceMode {
  if (mode === "request_quote" && price === null && unitPrice !== null) return "fixed";
  return mode;
}

export function applyDiscount(
  price: number,
  type: DiscountType,
  value: number
): number {
  if (type === "percentage") return Math.max(0, price * (1 - value / 100));
  if (type === "fixed") return Math.max(0, price - value);
  return price;
}

export function generateWhatsAppUrl({
  productName,
  sku,
  productUrl,
  whatsappNumber,
  customMessage,
}: {
  productName: string;
  sku?: string | null;
  productUrl: string;
  whatsappNumber: string;
  customMessage?: string | null;
}): string {
  const message = customMessage?.trim()
    ? customMessage
    : `Hola, me interesa el producto "${productName}"${sku ? ` (${sku})` : ""}. Quisiera consultar precio, disponibilidad y opciones de suministro.\n\nProducto: ${productUrl}`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = Reflect.get(error, "message");
    if (typeof message === "string") return message;
  }
  return fallback;
}
