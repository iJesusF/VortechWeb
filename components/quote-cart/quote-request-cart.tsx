"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Minus, Plus, MessageCircle, FileText, ArrowLeft, Package } from "lucide-react";
import { useQuoteCart } from "./cart-provider";
import { QuoteRequestModal } from "./quote-request-modal";
import { siteConfig } from "@/lib/site-config";

export function QuoteRequestCart() {
  const { items, generalNote, updateQuantity, updateObservations, removeItem, clearCart, setGeneralNote } = useQuoteCart();
  const [showModal, setShowModal] = useState(false);

  function generateWhatsAppMessage(): string {
    if (items.length === 0) return "";

    let message = "Hola, deseo solicitar una cotización para los siguientes productos:\n\n";

    items.forEach((item, idx) => {
      message += `${idx + 1}. ${item.name}\n`;
      if (item.sku) message += `   SKU: ${item.sku}\n`;
      message += `   Cantidad: ${item.quantity}\n`;
      if (item.url) message += `   URL: https://vortech.mx${item.url}\n`;
      if (item.observations) message += `   Observaciones: ${item.observations}\n`;
      message += "\n";
    });

    if (generalNote) {
      message += `Nota general: ${generalNote}\n`;
    }

    return message;
  }

  function handleWhatsApp() {
    const message = generateWhatsAppMessage();
    const url = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  }

  if (items.length === 0) {
    return (
      <section className="container-shell py-16 text-center">
        <Package className="mx-auto size-16 text-slate-600" />
        <h1 className="mt-6 text-2xl font-bold text-white">Sin productos en la solicitud</h1>
        <p className="mt-3 text-slate-400">
          Agrega productos desde el catálogo para solicitar una cotización.
        </p>
        <Link
          href="/catalogo"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyanx px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white"
        >
          <ArrowLeft className="size-4" />
          Ir al catálogo
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="container-shell py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Solicitud de cotización</h1>
            <p className="mt-2 text-sm text-slate-400">
              Los precios y disponibilidad serán confirmados mediante una cotización formal.
            </p>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-slate-500 transition hover:text-red-400"
          >
            Vaciar solicitud
          </button>
        </div>

        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="glass-panel rounded-2xl p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{item.name}</h3>
                  {item.sku && <p className="text-xs text-slate-500">SKU: {item.sku}</p>}
                  {item.url && (
                    <Link href={item.url} className="mt-1 text-xs text-cyanx hover:underline">
                      Ver producto
                    </Link>
                  )}
                  {item.unitPrice && (
                    <p className="mt-1 text-sm text-slate-400">
                      Precio referencial: {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(item.unitPrice)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Quantity */}
                  <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="grid size-8 place-items-center text-slate-400 transition hover:text-white disabled:opacity-30"
                      aria-label="Reducir cantidad"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="grid size-8 place-items-center text-slate-400 transition hover:text-white"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                    aria-label={`Eliminar ${item.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Observations */}
              <div className="mt-3">
                <input
                  type="text"
                  value={item.observations || ""}
                  onChange={(e) => updateObservations(item.productId, e.target.value)}
                  placeholder="Observaciones para este producto (opcional)"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-cyanx/40 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* General note */}
        <div className="mt-6">
          <label htmlFor="general-note" className="mb-2 block text-sm font-medium text-slate-300">
            Nota general (opcional)
          </label>
          <textarea
            id="general-note"
            value={generalNote}
            onChange={(e) => setGeneralNote(e.target.value)}
            rows={3}
            placeholder="Requisitos adicionales, plazos, condiciones..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyanx/40 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
          >
            <MessageCircle className="size-4" />
            Enviar solicitud por WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-cyanx px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:-translate-y-0.5 hover:bg-white"
          >
            <FileText className="size-4" />
            Solicitar cotización formal
          </button>
        </div>

        <div className="mt-6">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyanx"
          >
            <ArrowLeft className="size-4" />
            Continuar explorando el catálogo
          </Link>
        </div>
      </section>

      {showModal && <QuoteRequestModal onClose={() => setShowModal(false)} />}
    </>
  );
}
