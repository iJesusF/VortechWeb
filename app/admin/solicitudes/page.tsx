import { ClipboardList } from "lucide-react";

export default function SolicitudesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Solicitudes de cotización</h1>
          <p className="mt-1 text-sm text-slate-400">Solicitudes recibidas desde el catálogo público.</p>
        </div>
      </div>

      <div className="mt-8">
        {/* Table placeholder - populated with Supabase data */}
        <div className="glass-panel overflow-hidden rounded-2xl">
          <div className="border-b border-white/10 px-6 py-4">
            <div className="grid grid-cols-6 gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Folio</span>
              <span>Contacto</span>
              <span>Empresa</span>
              <span>Productos</span>
              <span>Estado</span>
              <span>Fecha</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="size-12 text-slate-700" />
            <p className="mt-4 text-sm text-slate-500">
              Sin solicitudes. Conecta Supabase para ver datos reales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
