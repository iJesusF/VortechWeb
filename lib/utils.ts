/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generate a WhatsApp click-to-chat URL
 */
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
  let message: string;

  if (customMessage) {
    message = customMessage;
  } else {
    const skuPart = sku ? ` (${sku})` : "";
    message = `Hola, me interesa el producto "${productName}"${skuPart}. Quisiera consultar precio, disponibilidad y opciones de suministro.\n\nProducto: ${productUrl}`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Get the full site URL for a given path
 */
export function getSiteUrl(path: string = ""): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${baseUrl}${path}`;
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Solo se permiten archivos JPG, PNG, WebP o AVIF" };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "El archivo no debe exceder 5MB" };
  }

  return { valid: true };
}
