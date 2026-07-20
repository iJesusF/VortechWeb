/**
 * Generates a WhatsApp click-to-chat URL
 */
export function generateWhatsAppUrl({
  productName,
  sku,
  productUrl,
  overrideMessage,
}: {
  productName: string;
  sku?: string | null;
  productUrl: string;
  overrideMessage?: string | null;
}): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

  let message: string;

  if (overrideMessage) {
    message = overrideMessage;
  } else {
    const skuPart = sku ? ` (${sku})` : "";
    message = `Hola, me interesa el producto "${productName}"${skuPart}. Quisiera consultar precio, disponibilidad y opciones de suministro.\n\nProducto: ${productUrl}`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}
