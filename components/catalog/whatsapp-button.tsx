import { MessageCircle } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/catalog/utils";

interface WhatsAppButtonProps {
  productName: string;
  sku: string | null;
  productUrl: string;
  whatsappNumber: string;
  customMessage: string | null;
  compact?: boolean;
}

export function WhatsAppButton({ productName, sku, productUrl, whatsappNumber, customMessage, compact = false }: WhatsAppButtonProps) {
  const href = generateWhatsAppUrl({ productName, sku, productUrl, whatsappNumber, customMessage });
  return <a href={href} target="_blank" rel="noopener noreferrer" className={compact ? "inline-flex items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2 text-xs font-semibold text-[#6ee7a3] transition hover:bg-[#25D366]/20" : "inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-[#4ade80]"}><MessageCircle className={compact ? "size-4" : "size-5"} />Consultar por WhatsApp</a>;
}
