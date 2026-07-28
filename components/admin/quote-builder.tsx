"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, GripVertical, Plus, Save, Trash2 } from "lucide-react";

import { calculateQuoteTotals, formatMXN } from "@/lib/quotations/calculations";
import { quoteStatusOptions } from "@/lib/quotations/status";
import type {
  ClientType,
  Database,
  DiscountType,
  QuoteStatus,
} from "@/lib/types/database";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type CompanySettings = Database["public"]["Tables"]["company_settings"]["Row"];
type QuoteRequest = Database["public"]["Tables"]["quote_requests"]["Row"];

interface ProductOption {
  id: string;
  name: string;
  sku: string | null;
  price: number | null;
  unit_price: number | null;
  unit: string;
  tax_rate: number;
  price_mode: Database["public"]["Tables"]["products"]["Row"]["price_mode"];
}

interface QuoteItemForm {
  id: string;
  itemType: "catalog" | "custom";
  productId: string | null;
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

interface NewClientForm {
  client_type: ClientType;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  rfc: string;
  tax_regime: string;
  cfdi_use: string;
  fiscal_zip_code: string;
  notes: string;
}

interface QuoteBuilderProps {
  clients: Client[];
  products: ProductOption[];
  settings: CompanySettings | null;
  quoteRequest: QuoteRequest | null;
  initialError?: string;
}

function emptyItem(defaultTaxRate: number): QuoteItemForm {
  return {
    id: crypto.randomUUID(),
    itemType: "custom",
    productId: null,
    sku: "",
    name: "",
    description: "",
    quantity: 1,
    unit: "pieza",
    unitPrice: 0,
    discountType: "none",
    discountValue: 0,
    taxRate: defaultTaxRate,
    withholdingRate: 0,
  };
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

export function QuoteBuilder({
  clients,
  products,
  settings,
  quoteRequest,
  initialError = "",
}: QuoteBuilderProps) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const defaultTaxRate = settings?.tax_enabled ? settings.default_tax_rate : 0;
  const initialItems =
    quoteRequest && quoteRequest.cart_snapshot.length > 0
      ? quoteRequest.cart_snapshot.map<QuoteItemForm>((item) => ({
          id: crypto.randomUUID(),
          itemType: item.product_id ? "catalog" : "custom",
          productId: item.product_id ?? null,
          sku: item.sku ?? "",
          name: item.name,
          description: item.observations ?? "",
          quantity: item.quantity,
          unit: "pieza",
          unitPrice: item.unit_price ?? 0,
          discountType: "none",
          discountValue: 0,
          taxRate: defaultTaxRate,
          withholdingRate: settings?.withholding_enabled
            ? settings.default_withholding_rate
            : 0,
        }))
      : [emptyItem(defaultTaxRate)];

  const [clientMode, setClientMode] = useState<"existing" | "new">(
    quoteRequest || clients.length === 0 ? "new" : "existing"
  );
  const [clientId, setClientId] = useState("");
  const [newClient, setNewClient] = useState<NewClientForm>({
    client_type: quoteRequest?.company ? "company" : "individual",
    business_name:
      quoteRequest?.company ?? quoteRequest?.customer_name ?? "",
    contact_name: quoteRequest?.customer_name ?? "",
    email: quoteRequest?.email ?? "",
    phone: quoteRequest?.phone ?? "",
    rfc: quoteRequest?.rfc ?? "",
    tax_regime: "",
    cfdi_use: "",
    fiscal_zip_code: "",
    notes: quoteRequest ? `Creado desde ${quoteRequest.request_number}` : "",
  });
  const [items, setItems] = useState(initialItems);
  const [status, setStatus] = useState<QuoteStatus>("draft");
  const [currency, setCurrency] = useState(settings?.currency ?? "MXN");
  const [issueDate, setIssueDate] = useState(today);
  const [validUntil, setValidUntil] = useState(
    addDays(today, settings?.default_validity_days ?? 15)
  );
  const [shipping, setShipping] = useState(0);
  const [notes, setNotes] = useState(quoteRequest?.general_notes ?? "");
  const [terms, setTerms] = useState(settings?.default_terms ?? "");
  const [internalNotes, setInternalNotes] = useState("");
  const [busyAction, setBusyAction] = useState<"save" | "preview" | null>(null);
  const [error, setError] = useState(initialError);

  const totals = useMemo(
    () =>
      calculateQuoteTotals({
        items: items.map((item) => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountType: item.discountType,
          discountValue: item.discountValue,
          taxRate: item.taxRate,
          withholdingRate: item.withholdingRate,
        })),
        generalDiscountType: "none",
        generalDiscountValue: 0,
        shippingTotal: shipping,
        paymentFeeType: "none",
        paymentFeeValue: 0,
        paymentFeePaidBy: "seller",
      }),
    [items, shipping]
  );

  function updateItem<K extends keyof QuoteItemForm>(
    id: string,
    field: K,
    value: QuoteItemForm[K]
  ) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function selectProduct(itemId: string, productId: string) {
    if (!productId) {
      setItems((current) =>
        current.map((item) =>
          item.id === itemId
            ? { ...item, itemType: "custom", productId: null, sku: "" }
            : item
        )
      );
      return;
    }

    const product = products.find((option) => option.id === productId);
    if (!product) return;
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              itemType: "catalog",
              productId: product.id,
              sku: product.sku ?? "",
              name: product.name,
              unit: product.unit,
              unitPrice: product.price ?? product.unit_price ?? 0,
              taxRate: product.tax_rate,
            }
          : item
      )
    );
  }

  function updateNewClient<K extends keyof NewClientForm>(
    field: K,
    value: NewClientForm[K]
  ) {
    setNewClient((current) => ({ ...current, [field]: value }));
  }

  function buildPayload() {
    return {
      clientId: clientMode === "existing" ? clientId || null : null,
      client: clientMode === "new" ? newClient : null,
      requestId: quoteRequest?.id ?? null,
      status,
      currency,
      issueDate,
      validUntil,
      shippingTotal: shipping,
      notes,
      terms,
      internalNotes,
      items: items.map(({ id: _id, ...item }) => item),
    };
  }

  async function parseError(response: Response) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    return payload?.error ?? `La operación falló (${response.status}).`;
  }

  async function preview() {
    const previewWindow = window.open("", "_blank");
    setBusyAction("preview");
    setError("");
    try {
      const response = await fetch("/api/admin/quotes/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!response.ok) throw new Error(await parseError(response));

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      if (previewWindow) {
        previewWindow.opener = null;
        previewWindow.location.href = url;
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = "vista-previa-cotizacion.pdf";
        link.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "No se pudo generar la vista previa."
      );
      previewWindow?.close();
    } finally {
      setBusyAction(null);
    }
  }

  async function save() {
    setBusyAction("save");
    setError("");
    try {
      const response = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const payload = (await response.json()) as {
        error?: string;
        quote?: { id: string; quoteNumber: string };
      };
      if (!response.ok || !payload.quote) {
        throw new Error(payload.error ?? "No se pudo crear la cotización.");
      }
      router.push(`/admin/cotizaciones/${payload.quote.id}`);
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo crear la cotización.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Nueva cotización</h1>
          <p className="mt-1 text-sm text-slate-400">
            {quoteRequest
              ? `Convirtiendo la solicitud ${quoteRequest.request_number}`
              : "Constructor de cotización formal."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={preview}
            disabled={busyAction !== null}
            className="admin-btn-ghost disabled:opacity-60"
          >
            <Eye className="size-4" />
            {busyAction === "preview" ? "Generando…" : "Vista previa"}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busyAction !== null}
            className="admin-btn-primary disabled:opacity-60"
          >
            <Save className="size-4" />
            {busyAction === "save" ? "Guardando…" : "Guardar cotización"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="glass-panel mt-8 rounded-2xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-white">Cliente</h2>
          {!quoteRequest && clients.length > 0 && (
            <div className="flex rounded-lg border border-white/10 p-1 text-xs">
              <button
                type="button"
                onClick={() => setClientMode("existing")}
                className={`rounded-md px-3 py-1.5 ${clientMode === "existing" ? "bg-cyanx text-slate-950" : "text-slate-400"}`}
              >
                Cliente existente
              </button>
              <button
                type="button"
                onClick={() => setClientMode("new")}
                className={`rounded-md px-3 py-1.5 ${clientMode === "new" ? "bg-cyanx text-slate-950" : "text-slate-400"}`}
              >
                Nuevo cliente
              </button>
            </div>
          )}
        </div>

        {clientMode === "existing" ? (
          <select
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            className="admin-input mt-4"
          >
            <option value="">Seleccionar cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.business_name} · {client.contact_name}
              </option>
            ))}
          </select>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Tipo">
              <select
                value={newClient.client_type}
                onChange={(event) =>
                  updateNewClient("client_type", event.target.value as ClientType)
                }
                className="admin-input"
              >
                <option value="company">Empresa</option>
                <option value="individual">Persona</option>
              </select>
            </Field>
            <Field label="Nombre o razón social *">
              <input
                value={newClient.business_name}
                onChange={(event) => updateNewClient("business_name", event.target.value)}
                className="admin-input"
              />
            </Field>
            <Field label="Contacto *">
              <input
                value={newClient.contact_name}
                onChange={(event) => updateNewClient("contact_name", event.target.value)}
                className="admin-input"
              />
            </Field>
            <Field label="Correo *">
              <input
                type="email"
                value={newClient.email}
                onChange={(event) => updateNewClient("email", event.target.value)}
                className="admin-input"
              />
            </Field>
            <Field label="Teléfono *">
              <input
                value={newClient.phone}
                onChange={(event) => updateNewClient("phone", event.target.value)}
                className="admin-input"
              />
            </Field>
            <Field label="RFC">
              <input
                value={newClient.rfc}
                onChange={(event) => updateNewClient("rfc", event.target.value.toUpperCase())}
                maxLength={13}
                className="admin-input uppercase"
              />
            </Field>
          </div>
        )}
      </section>

      <section className="glass-panel mt-6 rounded-2xl p-6">
        <div className="mb-5 rounded-xl border border-cyanx/20 bg-cyanx/5 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Próximo folio estimado
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-cyanx">
            {(settings?.quote_prefix ?? "COT").toUpperCase()}-
            {String(settings?.next_quote_number ?? 1).padStart(6, "0")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            El consecutivo definitivo se reserva de forma atómica al guardar.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Estado inicial">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as QuoteStatus)}
              className="admin-input"
            >
              {quoteStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fecha de emisión">
            <input
              type="date"
              value={issueDate}
              onChange={(event) => setIssueDate(event.target.value)}
              className="admin-input"
            />
          </Field>
          <Field label="Vigencia">
            <input
              type="date"
              value={validUntil}
              onChange={(event) => setValidUntil(event.target.value)}
              className="admin-input"
            />
          </Field>
          <Field label="Moneda">
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="admin-input"
            >
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="glass-panel mt-6 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Partidas</h2>
          <button
            type="button"
            onClick={() => setItems((current) => [...current, emptyItem(defaultTaxRate)])}
            className="admin-btn-ghost"
          >
            <Plus className="size-4" />
            Agregar partida
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {items.map((item, index) => (
            <article key={item.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex gap-3">
                <GripVertical className="mt-3 size-4 shrink-0 text-slate-600" />
                <div className="grid flex-1 gap-3 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <select
                      value={item.productId ?? ""}
                      onChange={(event) => selectProduct(item.id, event.target.value)}
                      className="admin-input"
                      aria-label={`Producto de partida ${index + 1}`}
                    >
                      <option value="">Concepto personalizado</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      value={item.name}
                      onChange={(event) => updateItem(item.id, "name", event.target.value)}
                      placeholder="Nombre del concepto"
                      className="admin-input"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))
                      }
                      disabled={items.length === 1}
                      className="icon-btn text-red-400 disabled:opacity-30"
                      aria-label={`Eliminar partida ${index + 1}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      value={item.description}
                      onChange={(event) => updateItem(item.id, "description", event.target.value)}
                      placeholder="Descripción"
                      className="admin-input"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="0.0001"
                      step="0.01"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(item.id, "quantity", Number(event.target.value))
                      }
                      className="admin-input"
                      aria-label="Cantidad"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      value={item.unit}
                      onChange={(event) => updateItem(item.id, "unit", event.target.value)}
                      className="admin-input"
                      aria-label="Unidad"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(event) =>
                        updateItem(item.id, "unitPrice", Number(event.target.value))
                      }
                      className="admin-input"
                      aria-label="Precio unitario"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={item.discountType}
                      onChange={(event) =>
                        updateItem(item.id, "discountType", event.target.value as DiscountType)
                      }
                      className="admin-input"
                    >
                      <option value="none">Sin descuento</option>
                      <option value="fixed">Descuento fijo</option>
                      <option value="percentage">Descuento porcentual</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      min="0"
                      max={item.discountType === "percentage" ? 100 : undefined}
                      step="0.01"
                      value={item.discountValue}
                      onChange={(event) =>
                        updateItem(item.id, "discountValue", Number(event.target.value))
                      }
                      className="admin-input"
                      aria-label="Valor de descuento"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.taxRate * 100}
                      onChange={(event) =>
                        updateItem(item.id, "taxRate", Number(event.target.value) / 100)
                      }
                      className="admin-input"
                      aria-label="IVA porcentual"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.withholdingRate * 100}
                      onChange={(event) =>
                        updateItem(item.id, "withholdingRate", Number(event.target.value) / 100)
                      }
                      className="admin-input"
                      aria-label="Retención porcentual"
                    />
                  </div>
                  <div className="flex items-center justify-end sm:col-span-2">
                    <span className="font-semibold text-white">
                      {formatMXN(totals.items[index]?.lineTotal ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-panel mt-6 rounded-2xl p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Envío">
              <input
                type="number"
                min="0"
                step="0.01"
                value={shipping}
                onChange={(event) => setShipping(Number(event.target.value))}
                className="admin-input"
              />
            </Field>
            <Field label="Notas para el cliente">
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="admin-input"
              />
            </Field>
            <Field label="Condiciones comerciales">
              <textarea
                value={terms}
                onChange={(event) => setTerms(event.target.value)}
                rows={3}
                className="admin-input"
              />
            </Field>
            <Field label="Notas internas">
              <textarea
                value={internalNotes}
                onChange={(event) => setInternalNotes(event.target.value)}
                rows={3}
                className="admin-input"
              />
            </Field>
          </div>

          <div className="h-fit rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-semibold text-white">Resumen</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <TotalRow label="Subtotal" value={totals.subtotal} />
              {totals.discountTotal > 0 && (
                <TotalRow label="Descuentos" value={-totals.discountTotal} />
              )}
              {totals.taxTotal > 0 && <TotalRow label="IVA" value={totals.taxTotal} />}
              {totals.withholdingTotal > 0 && (
                <TotalRow label="Retenciones" value={-totals.withholdingTotal} />
              )}
              {totals.shippingTotal > 0 && (
                <TotalRow label="Envío" value={totals.shippingTotal} />
              )}
              <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-base">
                <dt className="font-semibold text-white">Total</dt>
                <dd className="text-xl font-bold text-cyanx">{formatMXN(totals.grandTotal)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-medium text-white">{formatMXN(value)}</dd>
    </div>
  );
}
