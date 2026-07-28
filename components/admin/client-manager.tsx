"use client";

import { useMemo, useState } from "react";
import { Building2, Pencil, Plus, Search, UserRound, X } from "lucide-react";

import type { ClientType, Database } from "@/lib/types/database";

type Client = Database["public"]["Tables"]["clients"]["Row"];

interface ClientManagerProps {
  initialClients: Client[];
  initialError?: string;
}

interface ClientFormState {
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
  is_active: boolean;
}

const emptyForm: ClientFormState = {
  client_type: "company",
  business_name: "",
  contact_name: "",
  email: "",
  phone: "",
  rfc: "",
  tax_regime: "",
  cfdi_use: "",
  fiscal_zip_code: "",
  notes: "",
  is_active: true,
};

export function ClientManager({ initialClients, initialError = "" }: ClientManagerProps) {
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormState>(emptyForm);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState("");

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clients.filter((client) => {
      const matchesSearch =
        !term ||
        client.business_name.toLowerCase().includes(term) ||
        client.contact_name.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.phone.toLowerCase().includes(term) ||
        (client.rfc?.toLowerCase().includes(term) ?? false);
      const matchesStatus =
        status === "all" ||
        (status === "active" ? client.is_active : !client.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [clients, search, status]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setIsOpen(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setForm({
      client_type: client.client_type,
      business_name: client.business_name,
      contact_name: client.contact_name,
      email: client.email,
      phone: client.phone,
      rfc: client.rfc ?? "",
      tax_regime: client.tax_regime ?? "",
      cfdi_use: client.cfdi_use ?? "",
      fiscal_zip_code: client.fiscal_zip_code ?? "",
      notes: client.notes ?? "",
      is_active: client.is_active,
    });
    setError("");
    setSuccess("");
    setIsOpen(true);
  }

  function updateField<K extends keyof ClientFormState>(field: K, value: ClientFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveClient() {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        editing ? `/api/admin/clients/${editing.id}` : "/api/admin/clients",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const payload = (await response.json()) as { error?: string; client?: Client };

      if (!response.ok || !payload.client) {
        throw new Error(payload.error ?? "No se pudo guardar el cliente.");
      }

      const savedClient = payload.client;
      setClients((current) =>
        editing
          ? current.map((client) => (client.id === savedClient.id ? savedClient : client))
          : [savedClient, ...current]
      );
      setSuccess(editing ? "Cliente actualizado correctamente." : "Cliente creado correctamente.");
      setIsOpen(false);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo guardar el cliente.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(client: Client) {
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !client.is_active }),
      });
      const payload = (await response.json()) as { error?: string; client?: Client };
      if (!response.ok || !payload.client) {
        throw new Error(payload.error ?? "No se pudo cambiar el estado.");
      }
      const savedClient = payload.client;
      setClients((current) =>
        current.map((item) => (item.id === savedClient.id ? savedClient : item))
      );
      setSuccess(savedClient.is_active ? "Cliente activado." : "Cliente desactivado.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo cambiar el estado.");
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="mt-1 text-sm text-slate-400">
            Administra la base de clientes utilizada por las cotizaciones.
          </p>
        </div>
        <button type="button" onClick={openCreate} className="admin-btn-primary">
          <Plus className="size-4" />
          Nuevo cliente
        </button>
      </div>

      {(error || success) && (
        <div
          className={`mt-5 rounded-xl border p-4 text-sm ${
            error
              ? "border-red-500/30 bg-red-500/10 text-red-300"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, empresa, correo, teléfono o RFC"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-600 focus:border-cyanx/40 focus:outline-none"
          />
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
          className="rounded-xl border border-white/10 bg-graphite px-3 py-2.5 text-sm text-white focus:border-cyanx/40 focus:outline-none"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <UserRound className="size-12 text-slate-700" />
            <p className="mt-4 text-sm text-slate-500">
              {clients.length === 0 ? "Aún no hay clientes registrados." : "No hay coincidencias."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Cliente</th>
                  <th className="px-5 py-4">Contacto</th>
                  <th className="px-5 py-4">Correo</th>
                  <th className="px-5 py-4">Teléfono</th>
                  <th className="px-5 py-4">RFC</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-white/5 text-slate-300 last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-lg bg-cyanx/10 text-cyanx">
                          {client.client_type === "company" ? (
                            <Building2 className="size-4" />
                          ) : (
                            <UserRound className="size-4" />
                          )}
                        </span>
                        <span className="font-medium text-white">{client.business_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">{client.contact_name}</td>
                    <td className="px-5 py-4">{client.email}</td>
                    <td className="px-5 py-4">{client.phone}</td>
                    <td className="px-5 py-4 font-mono text-xs">{client.rfc ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          client.is_active
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {client.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(client)}
                          className="rounded-lg border border-white/10 p-2 text-slate-300 hover:border-cyanx/40 hover:text-cyanx"
                          aria-label={`Editar ${client.business_name}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(client)}
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-cyanx/40 hover:text-white"
                        >
                          {client.is_active ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-graphite p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editing ? "Editar cliente" : "Nuevo cliente"}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Los campos marcados son necesarios para crear cotizaciones.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Tipo">
                <select
                  value={form.client_type}
                  onChange={(event) => updateField("client_type", event.target.value as ClientType)}
                  className="admin-input"
                >
                  <option value="company">Empresa</option>
                  <option value="individual">Persona</option>
                </select>
              </Field>
              <Field label="Nombre o razón social *">
                <input
                  value={form.business_name}
                  onChange={(event) => updateField("business_name", event.target.value)}
                  className="admin-input"
                />
              </Field>
              <Field label="Contacto *">
                <input
                  value={form.contact_name}
                  onChange={(event) => updateField("contact_name", event.target.value)}
                  className="admin-input"
                />
              </Field>
              <Field label="Correo *">
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="admin-input"
                />
              </Field>
              <Field label="Teléfono *">
                <input
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="admin-input"
                />
              </Field>
              <Field label="RFC">
                <input
                  value={form.rfc}
                  onChange={(event) => updateField("rfc", event.target.value.toUpperCase())}
                  maxLength={13}
                  className="admin-input uppercase"
                />
              </Field>
              <Field label="Régimen fiscal">
                <input
                  value={form.tax_regime}
                  onChange={(event) => updateField("tax_regime", event.target.value)}
                  className="admin-input"
                />
              </Field>
              <Field label="Uso CFDI">
                <input
                  value={form.cfdi_use}
                  onChange={(event) => updateField("cfdi_use", event.target.value)}
                  className="admin-input"
                />
              </Field>
              <Field label="Código postal fiscal">
                <input
                  value={form.fiscal_zip_code}
                  onChange={(event) => updateField("fiscal_zip_code", event.target.value)}
                  className="admin-input"
                />
              </Field>
              <Field label="Estado">
                <label className="flex h-10 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) => updateField("is_active", event.target.checked)}
                  />
                  Cliente activo
                </label>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Notas internas">
                  <textarea
                    value={form.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    rows={3}
                    className="admin-input min-h-24"
                  />
                </Field>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsOpen(false)} className="admin-btn-ghost">
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveClient}
                disabled={isSaving}
                className="admin-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Guardando…" : "Guardar cliente"}
              </button>
            </div>
          </div>
        </div>
      )}
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
