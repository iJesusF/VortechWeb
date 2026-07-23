"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";

export type CartItem = Pick<CatalogProduct, "id" | "slug" | "name" | "sku" | "image"> & { quantity: number; observations: string };
type CartContextValue = { items: CartItem[]; itemCount: number; generalNote: string; add: (product: CatalogProduct, quantity: number, observations: string) => void; update: (id: string, values: Partial<Pick<CartItem, "quantity" | "observations">>) => void; remove: (id: string) => void; clear: () => void; setGeneralNote: (note: string) => void };
const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "vortech-quotation-request-v1";

export function QuotationCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [generalNote, setGeneralNote] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) { const value = JSON.parse(saved) as { items?: CartItem[]; generalNote?: string }; setItems(Array.isArray(value.items) ? value.items : []); setGeneralNote(value.generalNote ?? ""); } } finally { setReady(true); } }, []);
  useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, generalNote })); }, [items, generalNote, ready]);
  const value = useMemo<CartContextValue>(() => ({
    items, generalNote, itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    add(product, quantity, observations) { setItems((current) => { const found = current.find((item) => item.id === product.id); return found ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity, observations: observations || item.observations } : item) : [...current, { id: product.id, slug: product.slug, name: product.name, sku: product.sku, image: product.image, quantity, observations }]; }); },
    update(id, values) { setItems((current) => current.map((item) => item.id === id ? { ...item, ...values, quantity: Math.max(1, Number(values.quantity ?? item.quantity)) } : item)); },
    remove(id) { setItems((current) => current.filter((item) => item.id !== id)); }, clear() { setItems([]); setGeneralNote(""); }, setGeneralNote,
  }), [items, generalNote]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useQuotationCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useQuotationCart must be used inside QuotationCartProvider");
  return context;
}

export function buildWhatsAppRequest(items: CartItem[], generalNote: string) {
  const lines = ["Hola, deseo solicitar una cotización para los siguientes productos:", ""];
  items.forEach((item, index) => { lines.push(`${index + 1}. ${item.name}`); if (item.sku) lines.push(`SKU: ${item.sku}`); lines.push(`Cantidad: ${item.quantity}`); lines.push(`URL: ${typeof window === "undefined" ? "" : `${window.location.origin}/catalogo/${item.slug}`}`); if (item.observations.trim()) lines.push(`Observaciones: ${item.observations.trim()}`); lines.push(""); });
  if (generalNote.trim()) lines.push("Nota general:", generalNote.trim());
  return encodeURIComponent(lines.join("\n").trim());
}
