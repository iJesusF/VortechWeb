"use client";

import { useState } from "react";
import { Save, Building2 } from "lucide-react";

export default function EmpresaConfigPage() {
  const [config, setConfig] = useState({
    legal_name: "VORTECH",
    trade_name: "VORTECH",
    rfc: "",
    phone: "+52 6861455822",
    email: "ventas@vortech.mx",
    website: "https://vortech.mx",
    currency: "MXN",
    default_validity_days: 15,
    default_terms: "",
    default_tax_rate: 16,
    default_withholding_rate: 0,
    tax_enabled: false,
    withholding_enabled: false,
    quote_prefix: "COT",
    next_quote_number: 1,
    pdf_footer: "",
    responsible_name: "",
    whatsapp: "5216861455822",
    // Address fields
    street: "",
    exterior_number: "",
    interior_number: "",
    neighborhood: "",
    city: "",
    state: "Baja California",
    zip_code: "",
    country: "México",
  });

  function handleChange(field: string, value: string | number | boolean) {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Configuración de empresa</h1>
          <p className="mt-1 text-sm text-slate-400">Datos fiscales y comerciales para cotizaciones y PDF.</p>
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-full bg-cyanx px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-white">
          <Save className="size-4" />
          Guardar
        </button>
      </div>

      <div className="mt-8 space-y-6">
        {/* Identity */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Building2 className="size-5 text-cyanx" />
            Identidad
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Razón social</label>
              <input type="text" value={config.legal_name} onChange={(e) => handleChange("legal_name", e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Nombre comercial</label>
              <input type="text" value={config.trade_name} onChange={(e) => handleChange("trade_name", e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">RFC</label>
              <input type="text" value={config.rfc} onChange={(e) => handleChange("rfc", e.target.value.toUpperCase())} maxLength={13} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm uppercase text-white focus:border-cyanx/40 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Teléfono</label>
              <input type="tel" value={config.phone} onChange={(e) => handleChange("phone", e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Correo</label>
              <input type="email" value={config.email} onChange={(e) => handleChange("email", e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Sitio web</label>
              <input type="url" value={config.website} onChange={(e) => handleChange("website", e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">WhatsApp</label>
              <input type="text" value={config.whatsapp} onChange={(e) => handleChange("whatsapp", e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Responsable / Firma</label>
              <input type="text" value={config.responsible_name} onChange={(e) => handleChange("responsible_name", e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Tax defaults */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white">Impuestos y cotización</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="tax-enabled" checked={config.tax_enabled} onChange={(e) => handleChange("tax_enabled", e.target.checked)} className="size-4 rounded border-white/20" />
              <label htmlFor="tax-enabled" className="text-sm text-slate-300">IVA habilitado por defecto</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="withholding-enabled" checked={config.withholding_enabled} onChange={(e) => handleChange("withholding_enabled", e.target.checked)} className="size-4 rounded border-white/20" />
              <label htmlFor="withholding-enabled" className="text-sm text-slate-300">Retención habilitada por defecto</label>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">IVA predeterminado (%)</label>
              <input type="number" value={config.default_tax_rate} onChange={(e) => handleChange("default_tax_rate", parseFloat(e.target.value) || 0)} min={0} max={100} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Retención predeterminada (%)</label>
              <input type="number" value={config.default_withholding_rate} onChange={(e) => handleChange("default_withholding_rate", parseFloat(e.target.value) || 0)} min={0} max={100} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Prefijo de cotización</label>
              <input type="text" value={config.quote_prefix} onChange={(e) => handleChange("quote_prefix", e.target.value.toUpperCase())} maxLength={5} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm uppercase text-white focus:border-cyanx/40 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Próximo folio</label>
              <input type="number" value={config.next_quote_number} onChange={(e) => handleChange("next_quote_number", parseInt(e.target.value) || 1)} min={1} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Vigencia predeterminada (días)</label>
              <input type="number" value={config.default_validity_days} onChange={(e) => handleChange("default_validity_days", parseInt(e.target.value) || 15)} min={1} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Moneda</label>
              <select value={config.currency} onChange={(e) => handleChange("currency", e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none">
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="USD">USD - Dólar Americano</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm text-slate-400">Condiciones predeterminadas</label>
            <textarea value={config.default_terms} onChange={(e) => handleChange("default_terms", e.target.value)} rows={3} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm text-slate-400">Pie de página PDF</label>
            <textarea value={config.pdf_footer} onChange={(e) => handleChange("pdf_footer", e.target.value)} rows={2} className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-cyanx/40 focus:outline-none" />
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Conecta Supabase para persistir la configuración. Sin conexión, los valores se pierden al recargar.
        </p>
      </div>
    </div>
  );
}
