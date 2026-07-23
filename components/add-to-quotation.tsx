"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { CatalogProduct } from "@/lib/catalog";
import { useQuotationCart } from "@/components/quotation-cart";

export function AddToQuotation({ product }: { product: CatalogProduct }) {
  const { add } = useQuotationCart();
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState("");
  const [added, setAdded] = useState(false);
  function addProduct() { add(product, quantity, observations); setAdded(true); }
  return <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
    <label className="block text-sm font-medium text-slate-200">Cantidad<input aria-label="Cantidad" type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} className="mt-1 block w-24 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white" /></label>
    <label className="block text-sm font-medium text-slate-200">Observaciones <span className="text-slate-500">(opcional)</span><textarea value={observations} onChange={(event) => setObservations(event.target.value)} rows={2} className="mt-1 block w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white" /></label>
    <button type="button" onClick={addProduct} className="cta-button w-full bg-cyanx text-slate-950 hover:bg-white">{added ? <><Check className="mr-2 size-4" />Agregado a la solicitud</> : <><Plus className="mr-2 size-4" />Agregar a cotización</>}</button>
    {added ? <Link href="/solicitud-cotizacion" className="block text-center text-sm font-semibold text-cyanx hover:text-white">Ir a la solicitud</Link> : null}
  </div>;
}
