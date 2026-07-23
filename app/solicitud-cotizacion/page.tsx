"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Header } from "@/components/header";
import { buildWhatsAppRequest, useQuotationCart } from "@/components/quotation-cart";
import { siteConfig } from "@/lib/site-config";

const contactFields = [
  { name: "customerName", label: "Nombre o contacto", required: true },
  { name: "company", label: "Empresa", required: false },
  { name: "phone", label: "Teléfono", required: true },
  { name: "email", label: "Correo", required: true },
  { name: "rfc", label: "RFC", required: false },
  { name: "comments", label: "Comentarios", required: false },
] as const;

export default function QuotationRequestPage() {
  const { items, generalNote, update, remove, clear, setGeneralNote } = useQuotationCart();
  const [result, setResult] = useState<string>("");
  const [sending, setSending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSending(true); const form = new FormData(event.currentTarget); const response = await fetch("/api/quote-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerName: form.get("customerName"), company: form.get("company"), phone: form.get("phone"), email: form.get("email"), rfc: form.get("rfc"), comments: form.get("comments"), generalNote, items }) }); const data = await response.json() as { requestNumber?: string; error?: string }; setSending(false); if (response.ok) { setResult(`Solicitud enviada. Folio: ${data.requestNumber}`); clear(); } else setResult(data.error ?? "No fue posible enviar la solicitud."); }
  return <><Header /><main className="container-shell pt-32 pb-20"><span className="section-eyebrow">Revisión comercial</span><h1 className="section-title">Solicitud de cotización</h1><p className="section-copy">Los precios y disponibilidad serán confirmados mediante una cotización formal.</p>{items.length === 0 ? <div className="mt-10 rounded-3xl border border-white/10 p-8 text-slate-300">Aún no agregas conceptos. <Link className="font-bold text-cyanx" href="/catalogo">Explorar catálogo</Link></div> : <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_.8fr]"><section className="space-y-4">{items.map((item) => <article key={item.id} className="glass-panel rounded-2xl p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-white">{item.name}</h2><p className="text-sm text-slate-400">{item.sku ? `SKU: ${item.sku}` : "Sin SKU"}</p><Link href={`/catalogo/${item.slug}`} className="text-sm text-cyanx">Ver producto</Link></div><button onClick={() => remove(item.id)} className="text-sm text-rose-300">Eliminar</button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm">Cantidad<input type="number" min="1" value={item.quantity} onChange={(e) => update(item.id, { quantity: Number(e.target.value) })} className="mt-1 block w-full rounded-lg border border-white/15 bg-white/5 p-2" /></label><label className="text-sm">Observaciones<textarea value={item.observations} onChange={(e) => update(item.id, { observations: e.target.value })} className="mt-1 block w-full rounded-lg border border-white/15 bg-white/5 p-2" /></label></div></article>)}<label className="block text-sm font-medium">Nota general<textarea value={generalNote} onChange={(e) => setGeneralNote(e.target.value)} className="mt-1 block w-full rounded-lg border border-white/15 bg-white/5 p-3" /></label><button onClick={clear} className="text-sm text-slate-400">Vaciar solicitud</button></section><aside className="glass-panel h-fit rounded-3xl p-6"><a href={`https://wa.me/${siteConfig.whatsapp}?text=${buildWhatsAppRequest(items, generalNote)}`} target="_blank" rel="noreferrer" className="cta-button w-full bg-emerald-400 text-slate-950 hover:bg-emerald-300">Enviar solicitud por WhatsApp</a><form onSubmit={submit} className="mt-6 space-y-3"><h2 className="font-bold text-white">Solicitar cotización formal</h2>{contactFields.map((field) => <label key={field.name} className="block text-sm">{field.label}<input required={field.required} name={field.name} className="mt-1 block w-full rounded-lg border border-white/15 bg-white/5 p-2" /></label>)}<button disabled={sending} className="cta-button w-full bg-cyanx text-slate-950 disabled:opacity-50">{sending ? "Enviando…" : "Enviar solicitud formal"}</button>{result ? <p role="status" className="text-sm text-cyanx">{result}</p> : null}</form></aside></div>}</main></>;
}
