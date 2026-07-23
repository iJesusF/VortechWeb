"use client";

import { useState } from "react";
import { Plus, Trash2, Search, GripVertical, Save, Eye, Send, Copy } from "lucide-react";
import { calculateQuoteTotals, formatMXN } from "@/lib/quotations/calculations";
import type { LineItemInput } from "@/lib/quotations/calculations";
import type { DiscountType } from "@/lib/types/database";

interface QuoteItemForm {
  id: string;
  itemType: "catalog" | "custom";
  productId?: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
  withholdingRate: number;
}

function createEmptyItem(): QuoteItemForm {
  return {
    id: crypto.randomUUID(),
    itemType: "custom",
    sku: "",
    name: "",
    description: "",
    quantity: 1,
    unit: "pieza",
    unitPrice: 0,
    discountType: "none",
    discountValue: 0,
    taxRate: 0,
    withholdingRate: 0,
  };
}

export default function NuevaCotizacionPage() {
  const [items, setItems] = useState<QuoteItemForm[]>([createEmptyItem()]);
  const [generalDiscount, setGeneralDiscount] = useState({ type: "none" as DiscountType, value: 0 });
  const [shipping, setShipping] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [validDays, setValidDays] = useState(15);

  function addItem() {
    setItems((prev) => [...prev, createEmptyItem()]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function updateItem(id: string, field: keyof QuoteItemForm, value: string | number) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  // Calculate totals
  const lineInputs: LineItemInput[] = items.map((item) => ({
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discountType: item.discountType,
    discountValue: item.discountValue,
    taxRate: item.taxRate,
    withholdingRate: item.withholdingRate,
  }));

  const totals = calculateQuoteTotals({
    items: lineInputs,
    generalDiscountType: generalDiscount.type,
    generalDiscountValue: generalDiscount.value,
    shippingTotal: shipping,
    paymentFeeType: "none",
    paymentFeeValue: 0,
    paymentFeePaidBy: "seller",
  });

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Nueva cotización</h1>
          <p className="mt-1 text-sm text-slate-400">Constructor de cotización formal.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-cyanx/40">
            <Eye className="size-4" />
            Vista previa
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-full bg-cyanx px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-white">
            <Save className="size-4" />
            Guardar borrador
          </button>
        </div>
      </div>

      {/* Client selection */}
      <div className="mt-8 glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white">Cliente</h2>
        <div className="mt-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar cliente por nombre, RFC o correo..."
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-600 focus:border-cyanx/40 focus:outline-none"
            />
          </div>
          <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-cyanx/30 bg-cyanx/10 px-3 py-2.5 text-sm text-cyanx transition hover:bg-cyanx/20">
            <Plus className="size-4" />
            Nuevo
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">Conecta Supabase para buscar clientes existentes.</p>
      </div>

      {/* Line items */}
      <div className="mt-6 glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Partidas</h2>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 rounded-lg border border-cyanx/30 bg-cyanx/10 px-3 py-2 text-sm text-cyanx transition hover:bg-cyanx/20"
          >
            <Plus className="size-4" />
            Agregar partida
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {items.map((item, idx) => (
            <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-start gap-3">
                <GripVertical className="mt-2 size-4 shrink-0 cursor-move text-slate-600" />
                <div className="flex-1 grid gap-3 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                      placeholder="Nombre del concepto"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-cyanx/40 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                      placeholder="Cant."
                      min={0}
                      step="0.01"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-cyanx/40 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                      placeholder="Unidad"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-cyanx/40 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                      placeholder="Precio unitario"
                      min={0}
                      step="0.01"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-cyanx/40 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                      aria-label="Eliminar partida"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Row 2: Tax, discount */}
              <div className="ml-7 mt-2 grid gap-3 sm:grid-cols-4">
                <div>
                  <label className="text-xs text-slate-500">IVA %</label>
                  <input
                    type="number"
                    value={item.taxRate * 100}
                    onChange={(e) => updateItem(item.id, "taxRate", (parseFloat(e.target.value) || 0) / 100)}
                    min={0}
                    max={100}
                    step="0.01"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white focus:border-cyanx/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Retención %</label>
                  <input
                    type="number"
                    value={item.withholdingRate * 100}
                    onChange={(e) => updateItem(item.id, "withholdingRate", (parseFloat(e.target.value) || 0) / 100)}
                    min={0}
                    max={100}
                    step="0.01"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white focus:border-cyanx/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Descuento</label>
                  <select
                    value={item.discountType}
                    onChange={(e) => updateItem(item.id, "discountType", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white focus:border-cyanx/40 focus:outline-none"
                  >
                    <option value="none">Sin descuento</option>
                    <option value="fixed">Fijo ($)</option>
                    <option value="percentage">Porcentaje (%)</option>
                  </select>
                </div>
                {item.discountType !== "none" && (
                  <div>
                    <label className="text-xs text-slate-500">Valor</label>
                    <input
                      type="number"
                      value={item.discountValue}
                      onChange={(e) => updateItem(item.id, "discountValue", parseFloat(e.target.value) || 0)}
                      min={0}
                      step="0.01"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white focus:border-cyanx/40 focus:outline-none"
                    />
                  </div>
                )}
              </div>
              {/* Line total */}
              <div className="ml-7 mt-2 text-right">
                <span className="text-sm font-medium text-slate-300">
                  Línea: {formatMXN(totals.items[idx]?.lineTotal || 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="mt-6 glass-panel rounded-2xl p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Envío</label>
              <input
                type="number"
                value={shipping}
                onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                min={0}
                step="0.01"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Vigencia (días)</label>
              <input
                type="number"
                value={validDays}
                onChange={(e) => setValidDays(parseInt(e.target.value) || 15)}
                min={1}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Notas</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Condiciones comerciales</label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-base font-semibold text-white">Resumen</h3>
            <dl className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <dt className="text-slate-400">Subtotal</dt>
                <dd className="font-medium text-white">{formatMXN(totals.subtotal)}</dd>
              </div>
              {totals.discountTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <dt className="text-slate-400">Descuentos</dt>
                  <dd className="font-medium text-red-400">-{formatMXN(totals.discountTotal)}</dd>
                </div>
              )}
              {totals.taxTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <dt className="text-slate-400">IVA</dt>
                  <dd className="font-medium text-white">{formatMXN(totals.taxTotal)}</dd>
                </div>
              )}
              {totals.withholdingTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <dt className="text-slate-400">Retenciones</dt>
                  <dd className="font-medium text-orange-400">-{formatMXN(totals.withholdingTotal)}</dd>
                </div>
              )}
              {totals.shippingTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <dt className="text-slate-400">Envío</dt>
                  <dd className="font-medium text-white">{formatMXN(totals.shippingTotal)}</dd>
                </div>
              )}
              <hr className="border-white/10" />
              <div className="flex justify-between">
                <dt className="text-base font-semibold text-white">Total</dt>
                <dd className="text-xl font-bold text-cyanx">{formatMXN(totals.grandTotal)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
