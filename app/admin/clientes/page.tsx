import { Users, Plus } from "lucide-react";

export default function ClientesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="mt-1 text-sm text-slate-400">Administra la base de clientes para cotizaciones.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-cyanx px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-white"
        >
          <Plus className="size-4" />
          Nuevo cliente
        </button>
      </div>

      <div className="mt-8">
        <div className="glass-panel overflow-hidden rounded-2xl">
          <div className="border-b border-white/10 px-6 py-4">
            <div className="grid grid-cols-6 gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Nombre</span>
              <span>Empresa</span>
              <span>Email</span>
              <span>Teléfono</span>
              <span>RFC</span>
              <span>Estado</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="size-12 text-slate-700" />
            <p className="mt-4 text-sm text-slate-500">
              Sin clientes registrados. Conecta Supabase para administrar clientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
