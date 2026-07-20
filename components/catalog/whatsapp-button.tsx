import { generateWhatsAppUrl } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  productName: string;
  sku?: string | null;
  productUrl: string;
  whatsappNumber: string;
  customMessage?: string | null;
  className?: string;
}

export function WhatsAppButton({
  productName,
  sku,
  productUrl,
  whatsappNumber,
  customMessage,
  className = "",
}: WhatsAppButtonProps) {
  const url = generateWhatsAppUrl({
    productName,
    sku,
    productUrl,
    whatsappNumber,
    customMessage,
  });

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`cta-button inline-flex items-center gap-2.5 bg-[#25D366] text-white shadow-[0_0_30px_rgba(37,211,102,0.25)] hover:bg-[#1ebe5d] hover:-translate-y-0.5 ${className}`}
      aria-label={`Consultar precio de ${productName} por WhatsApp`}
    >
      <MessageCircle className="size-5" aria-hidden="true" />
      Consultar precio por WhatsApp
    </a>
  );
}
