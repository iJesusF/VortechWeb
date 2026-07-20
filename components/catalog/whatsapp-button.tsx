"use client";

import { MessageCircle } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import type { Product } from "@/lib/types/database";

interface WhatsAppButtonProps {
  product: Product;
}

export function WhatsAppButton({ product }: WhatsAppButtonProps) {
  const productUrl = typeof window !== "undefined"
    ? window.location.href
    : `${process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : ""}/catalogo/${product.slug}`;

  const whatsappUrl = generateWhatsAppUrl({
    productName: product.name,
    sku: product.sku,
    productUrl,
    overrideMessage: product.whatsapp_message_override,
  });

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="cta-button inline-flex w-full items-center justify-center gap-2 bg-emerald-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:-translate-y-0.5 hover:bg-emerald-500 sm:w-auto"
      aria-label={`Consultar precio de ${product.name} por WhatsApp`}
    >
      <MessageCircle className="size-5" aria-hidden="true" />
      Consultar precio por WhatsApp
    </a>
  );
}
