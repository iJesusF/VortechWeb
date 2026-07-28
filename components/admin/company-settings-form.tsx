"use client";

import { useRef, useState } from "react";
import { Building2, ImagePlus, Save, Trash2 } from "lucide-react";

import type { Address, Database } from "@/lib/types/database";

type CompanySettings = Database["public"]["Tables"]["company_settings"]["Row"];

interface CompanySettingsFormProps {
  initialSettings: CompanySettings | null;
  initialError?: string;
}

type EditableSettings = {
  legal_name: string;
  trade_name: string;
  rfc: string;
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
  responsible_name: string;
  currency: "MXN" | "USD";
  default_validity_days: number;
  default_terms: string;
  default_tax_rate: number;
  default_withholding_rate: number;
  tax_enabled: boolean;
  withholding_enabled: boolean;
  quote_prefix: string;
  next_quote_number: number;
  pdf_footer: string;
  address: Address;
};

const emptyAddress: Address = {
  street: "",
  exterior_number: "",
  interior_number: "",
  neighborhood: "",
  city: "",
  state: "Baja California",
  zip_code: "",
  country: "México",
};

function getInitialState(settings: CompanySettings | null): EditableSettings {
  return {
    legal_name: settings?.legal_name ?? "VORTECH",
    trade_name: settings?.trade_name ?? "VORTECH",
    rfc: settings?.rfc ?? "",
    phone: settings?.phone ?? "+52 6861455822",
    email: settings?.email ?? "ventas@vortech.mx",
    website: settings?.website ?? "https://vortech.mx",
    whatsapp: settings?.whatsapp ?? "5216861455822",
    responsible_name: settings?.responsible_name ?? "",
    currency: settings?.currency === "USD" ? "USD" : "MXN",
    default_validity_days: settings?.default_validity_days ?? 15,
    default_terms: settings?.default_terms ?? "",
    default_tax_rate: (settings?.default_tax_rate ?? 0.16) * 100,
    default_withholding_rate: (settings?.default_withholding_rate ?? 0) * 100,
    tax_enabled: settings?.tax_enabled ?? false,
    withholding_enabled: settings?.withholding_enabled ?? false,
    quote_prefix: settings?.quote_prefix ?? "COT",
    next_quote_number: settings?.next_quote_number ?? 1,
    pdf_footer: settings?.pdf_footer ?? "",
    address: settings?.address ?? emptyAddress,
  };
}

export function CompanySettingsForm({
  initialSettings,
  initialError = "",
}: CompanySettingsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [config, setConfig] = useState(() => getInitialState(initialSettings));
  const [logoUrl, setLogoUrl] = useState(initialSettings?.logo_url ?? "");
  const [busy, setBusy] = useState<"save" | "logo" | "delete-logo" | null>(null);
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState("");

  function update<K extends keyof EditableSettings>(
    field: K,
    value: EditableSettings[K]
  ) {
    setConfig((current) => ({ ...current, [field]: value }));
  }

  function updateAddress<K extends keyof Address>(field: K, value: Address[K]) {
    setConfig((current) => ({
      ...current,
      address: { ...current.address, [field]: value },
    }));
  }

  async function readResponse(response: Response) {
    return (await response.json().catch(() => null)) as {
      error?: string;
      settings?: CompanySettings;
    } | null;
  }

  async function save() {
    setBusy("save");
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/admin/company-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          default_tax_rate: config.default_tax_rate / 100,
          default_withholding_rate: config.default_withholding_rate / 100,
        }),
      });
      const payload = await readResponse(response);
      if (!response.ok || !payload?.settings) {
        throw new Error(payload?.error ?? "No se pudo guardar la configuración.");
      }
      setConfig(getInitialState(payload.settings));
      setLogoUrl(payload.settings.logo_url ?? "");
      setSuccess("Configuración guardada. Los siguientes PDFs usarán estos datos.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo guardar la configuración."
      );
    } finally {
      setBusy(null);
    }
  }

  async function uploadLogo(file: File) {
    setBusy("logo");
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.set("logo", file);
      const response = await fetch("/api/admin/company-settings", {
        method: "POST",
        body: formData,
      });
      const payload = await readResponse(response);
      if (!response.ok || !payload?.settings) {
        throw new Error(payload?.error ?? "No se pudo subir el logo.");
      }
      setLogoUrl(payload.settings.logo_url ?? "");
      setSuccess("Logo actualizado. Ya está disponible para las cotizaciones PDF.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "No se pudo subir el logo."
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setBusy(null);
    }
  }

  async function deleteLogo() {
    setBusy("delete-logo");
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/admin/company-settings", {
        method: "DELETE",
      });
      const payload = await readResponse(response);
      if (!response.ok || !payload?.settings) {
        throw new Error(payload?.error ?? "No se pudo eliminar el logo.");
      }
      setLogoUrl("");
      setSuccess("Logo eliminado. El PDF usará el nombre comercial como respaldo.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "No se pudo eliminar el logo."
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Empresa y documentos</h1>
          <p className="mt-1 text-sm text-slate-400">
            Identidad, condiciones comerciales y datos utilizados en cotizaciones y PDF.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={busy !== null}
          className="admin-btn-primary disabled:opacity-60"
        >
          <Save className="size-4" />
          {busy === "save" ? "Guardando…" : "Guardar"}
        </button>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {success}
        </div>
      )}

      <div className="mt-8 space-y-6">
        <section className="glass-panel rounded-2xl p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <ImagePlus className="size-5 text-cyanx" />
            Logo para documentos
          </h2>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div
              className="flex h-28 w-52 shrink-0 items-center justify-center rounded-xl border border-dashed border-white/15 bg-white p-3 bg-contain bg-center bg-no-repeat"
              style={logoUrl ? { backgroundImage: `url("${logoUrl}")` } : undefined}
            >
              {!logoUrl && (
                <span className="text-center text-sm font-bold tracking-[0.2em] text-slate-800">
                  {config.trade_name || "VORTECH"}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-slate-300">
                PNG o JPG/JPEG, máximo 5 MB. PNG con fondo transparente es la mejor opción.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadLogo(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy !== null}
                  className="admin-btn-ghost disabled:opacity-60"
                >
                  <ImagePlus className="size-4" />
                  {busy === "logo" ? "Subiendo…" : logoUrl ? "Reemplazar" : "Subir logo"}
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={deleteLogo}
                    disabled={busy !== null}
                    className="admin-btn-ghost text-red-300 disabled:opacity-60"
                  >
                    <Trash2 className="size-4" />
                    {busy === "delete-logo" ? "Eliminando…" : "Eliminar"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Building2 className="size-5 text-cyanx" />
            Identidad y contacto
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField label="Razón social" value={config.legal_name} onChange={(value) => update("legal_name", value)} />
            <TextField label="Nombre comercial" value={config.trade_name} onChange={(value) => update("trade_name", value)} />
            <TextField label="RFC" value={config.rfc} onChange={(value) => update("rfc", value.toUpperCase())} maxLength={13} />
            <TextField label="Teléfono" value={config.phone} onChange={(value) => update("phone", value)} />
            <TextField label="Correo" type="email" value={config.email} onChange={(value) => update("email", value)} />
            <TextField label="Sitio web" type="url" value={config.website} onChange={(value) => update("website", value)} />
            <TextField label="WhatsApp" value={config.whatsapp} onChange={(value) => update("whatsapp", value)} />
            <TextField label="Responsable" value={config.responsible_name} onChange={(value) => update("responsible_name", value)} />
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white">Domicilio</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField label="Calle" value={config.address.street} onChange={(value) => updateAddress("street", value)} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="No. exterior" value={config.address.exterior_number} onChange={(value) => updateAddress("exterior_number", value)} />
              <TextField label="No. interior" value={config.address.interior_number ?? ""} onChange={(value) => updateAddress("interior_number", value)} />
            </div>
            <TextField label="Colonia" value={config.address.neighborhood} onChange={(value) => updateAddress("neighborhood", value)} />
            <TextField label="Ciudad" value={config.address.city} onChange={(value) => updateAddress("city", value)} />
            <TextField label="Estado" value={config.address.state} onChange={(value) => updateAddress("state", value)} />
            <TextField label="Código postal" value={config.address.zip_code} onChange={(value) => updateAddress("zip_code", value)} />
            <TextField label="País" value={config.address.country} onChange={(value) => updateAddress("country", value)} />
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white">Cotizaciones y PDF</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <CheckField label="IVA habilitado por defecto" checked={config.tax_enabled} onChange={(value) => update("tax_enabled", value)} />
            <CheckField label="Retención habilitada por defecto" checked={config.withholding_enabled} onChange={(value) => update("withholding_enabled", value)} />
            <NumberField label="IVA predeterminado (%)" value={config.default_tax_rate} min={0} max={100} onChange={(value) => update("default_tax_rate", value)} />
            <NumberField label="Retención predeterminada (%)" value={config.default_withholding_rate} min={0} max={100} onChange={(value) => update("default_withholding_rate", value)} />
            <TextField label="Prefijo de cotización" value={config.quote_prefix} maxLength={10} onChange={(value) => update("quote_prefix", value.toUpperCase())} />
            <NumberField label="Próximo folio (automático)" value={config.next_quote_number} min={1} disabled onChange={() => undefined} />
            <NumberField label="Vigencia predeterminada (días)" value={config.default_validity_days} min={1} max={365} onChange={(value) => update("default_validity_days", Math.trunc(value))} />
            <label className="block">
              <span className="mb-1 block text-sm text-slate-400">Moneda</span>
              <select
                value={config.currency}
                onChange={(event) => update("currency", event.target.value === "USD" ? "USD" : "MXN")}
                className="admin-input"
              >
                <option value="MXN">MXN - Peso mexicano</option>
                <option value="USD">USD - Dólar estadounidense</option>
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-1 block text-sm text-slate-400">Condiciones comerciales predeterminadas</span>
            <textarea value={config.default_terms} onChange={(event) => update("default_terms", event.target.value)} rows={6} className="admin-input" />
          </label>
          <label className="mt-4 block">
            <span className="mb-1 block text-sm text-slate-400">Pie de página del PDF</span>
            <textarea value={config.pdf_footer} onChange={(event) => update("pdf_footer", event.target.value)} rows={3} className="admin-input" />
          </label>
        </section>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "url";
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="admin-input"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  disabled = false,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-400">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step="0.01"
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="admin-input disabled:cursor-not-allowed disabled:opacity-50"
      />
    </label>
  );
}

function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 rounded border-white/20"
      />
      <span className="text-sm text-slate-300">{label}</span>
    </label>
  );
}
