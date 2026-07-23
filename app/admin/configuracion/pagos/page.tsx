"use client";

import { useState } from "react";
import { CreditCard, Building, ToggleLeft, ToggleRight, Save, AlertCircle } from "lucide-react";

export default function PagosConfigPage() {
  const [bankTransfer, setBankTransfer] = useState({
    enabled: false,
    bank: "",
    beneficiary: "",
    account: "",
    clabe: "",
    reference: "",
    currency: "MXN",
    instructions: "",
  });

  const [paypal, setPaypal] = useState({
    enabled: false,
    feeType: "percentage" as "none" | "fixed" | "percentage",
    feeValue: 3.6,
    feePaidBy: "seller" as "seller" | "customer",
  });

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Métodos de pago</h1>
          <p className="mt-1 text-sm text-slate-400">Configura las opciones de pago disponibles para tus clientes.</p>
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-full bg-cyanx px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-white">
          <Save className="size-4" />
          Guardar
        </button>
      </div>

      <div className="mt-8 space-y-6">
        {/* Bank Transfer */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Building className="size-5 text-cyanx" />
              Transferencia bancaria
            </h2>
            <button
              type="button"
              onClick={() => setBankTransfer((p) => ({ ...p, enabled: !p.enabled }))}
              className="text-cyanx"
              aria-label={bankTransfer.enabled ? "Desactivar" : "Activar"}
            >
              {bankTransfer.enabled ? <ToggleRight className="size-8" /> : <ToggleLeft className="size-8 text-slate-600" />}
            </button>
          </div>

          {bankTransfer.enabled && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-400">Banco</label>
                <input type="text" value={bankTransfer.bank} onChange={(e) => setBankTransfer((p) => ({ ...p, bank: e.target.value }))} placeholder="BBVA, Banorte, etc." className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-cyanx/40 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Beneficiario</label>
                <input type="text" value={bankTransfer.beneficiary} onChange={(e) => setBankTransfer((p) => ({ ...p, beneficiary: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Cuenta</label>
                <input type="text" value={bankTransfer.account} onChange={(e) => setBankTransfer((p) => ({ ...p, account: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">CLABE interbancaria</label>
                <input type="text" value={bankTransfer.clabe} onChange={(e) => setBankTransfer((p) => ({ ...p, clabe: e.target.value }))} maxLength={18} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Referencia</label>
                <input type="text" value={bankTransfer.reference} onChange={(e) => setBankTransfer((p) => ({ ...p, reference: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Moneda</label>
                <select value={bankTransfer.currency} onChange={(e) => setBankTransfer((p) => ({ ...p, currency: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none">
                  <option value="MXN">MXN</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-slate-400">Instrucciones adicionales</label>
                <textarea value={bankTransfer.instructions} onChange={(e) => setBankTransfer((p) => ({ ...p, instructions: e.target.value }))} rows={3} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
              </div>
            </div>
          )}
        </div>

        {/* PayPal */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <CreditCard className="size-5 text-cyanx" />
              PayPal (pasarela externa)
            </h2>
            <button
              type="button"
              onClick={() => setPaypal((p) => ({ ...p, enabled: !p.enabled }))}
              className="text-cyanx"
            >
              {paypal.enabled ? <ToggleRight className="size-8" /> : <ToggleLeft className="size-8 text-slate-600" />}
            </button>
          </div>

          {paypal.enabled && (
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-400" />
                <p className="text-xs text-amber-200">
                  Requiere credenciales de PayPal configuradas en variables de entorno.
                  Sin credenciales, el botón de pago estará deshabilitado en producción.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Tipo de comisión</label>
                  <select value={paypal.feeType} onChange={(e) => setPaypal((p) => ({ ...p, feeType: e.target.value as "none" | "fixed" | "percentage" }))} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none">
                    <option value="none">Sin comisión</option>
                    <option value="fixed">Fija ($)</option>
                    <option value="percentage">Porcentual (%)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Valor de comisión</label>
                  <input type="number" value={paypal.feeValue} onChange={(e) => setPaypal((p) => ({ ...p, feeValue: parseFloat(e.target.value) || 0 }))} min={0} step="0.01" className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Comisión pagada por</label>
                  <select value={paypal.feePaidBy} onChange={(e) => setPaypal((p) => ({ ...p, feePaidBy: e.target.value as "seller" | "customer" }))} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none">
                    <option value="seller">Vendedor (VORTECH absorbe)</option>
                    <option value="customer">Cliente (se suma al total)</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Variables requeridas: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Conecta Supabase para persistir la configuración de métodos de pago.
        </p>
      </div>
    </div>
  );
}
