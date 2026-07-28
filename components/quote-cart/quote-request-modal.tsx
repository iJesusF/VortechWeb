"use client";

import { useState, useRef, useEffect } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { useQuoteCart } from "./cart-provider";

interface Props {
  onClose: () => void;
}

export function QuoteRequestModal({ onClose }: Props) {
  const { items, generalNote, clearCart } = useQuoteCart();
  const [formData, setFormData] = useState({
    customer_name: "",
    company: "",
    phone: "",
    email: "",
    rfc: "",
    comments: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestNumber, setRequestNumber] = useState("");
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const notes = [generalNote.trim(), formData.comments.trim()]
        .filter(Boolean)
        .join("\n\n");

      const response = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: formData.customer_name.trim(),
          company: formData.company.trim() || null,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          rfc: formData.rfc.trim() || null,
          general_notes: notes || null,
          cart_snapshot: items.map((item) => ({
            product_id: item.productId,
            name: item.name,
            sku: item.sku || null,
            quantity: item.quantity,
            url: item.url
              ? new URL(item.url, window.location.origin).toString()
              : null,
            observations: item.observations || null,
            unit_price: item.unitPrice ?? null,
            image_url: item.imageUrl || null,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Error al enviar la solicitud");
      }

      const data = await response.json();
      setRequestNumber(data.request_number || "");
      setSuccess(true);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Solicitud de cotización formal"
        onClick={(e) => e.stopPropagation()}
        className="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-graphite p-6 shadow-panel sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-slate-500 transition hover:text-white"
          aria-label="Cerrar"
        >
          <X className="size-5" />
        </button>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto size-16 text-emerald-400" />
            <h2 className="mt-4 text-xl font-bold text-white">Solicitud enviada</h2>
            {requestNumber && (
              <p className="mt-2 text-sm text-slate-400">
                Folio: <span className="font-mono font-bold text-cyanx">{requestNumber}</span>
              </p>
            )}
            <p className="mt-4 text-sm text-slate-400">
              Hemos recibido tu solicitud. Te contactaremos con una cotización formal a la brevedad.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-cyanx px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white">Solicitar cotización formal</h2>
            <p className="mt-2 text-sm text-slate-400">
              Completa tus datos de contacto. Recibirás una cotización detallada.
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="req-name" className="mb-1 block text-sm font-medium text-slate-300">
                  Nombre o contacto *
                </label>
                <input
                  id="req-name"
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData((p) => ({ ...p, customer_name: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyanx/40 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="req-company" className="mb-1 block text-sm font-medium text-slate-300">
                  Empresa
                </label>
                <input
                  id="req-company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyanx/40 focus:outline-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="req-phone" className="mb-1 block text-sm font-medium text-slate-300">
                    Teléfono *
                  </label>
                  <input
                    id="req-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyanx/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="req-email" className="mb-1 block text-sm font-medium text-slate-300">
                    Correo *
                  </label>
                  <input
                    id="req-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyanx/40 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="req-rfc" className="mb-1 block text-sm font-medium text-slate-300">
                  RFC (opcional)
                </label>
                <input
                  id="req-rfc"
                  type="text"
                  value={formData.rfc}
                  onChange={(e) => setFormData((p) => ({ ...p, rfc: e.target.value.toUpperCase() }))}
                  maxLength={13}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm uppercase text-white placeholder:text-slate-600 focus:border-cyanx/40 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="req-comments" className="mb-1 block text-sm font-medium text-slate-300">
                  Comentarios adicionales
                </label>
                <textarea
                  id="req-comments"
                  rows={3}
                  value={formData.comments}
                  onChange={(e) => setFormData((p) => ({ ...p, comments: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyanx/40 focus:outline-none"
                />
              </div>

              <p className="text-xs text-slate-500">
                {items.length} producto{items.length !== 1 ? "s" : ""} en la solicitud
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyanx px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar solicitud"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
