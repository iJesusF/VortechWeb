import { FileText, Plus } from "lucide-react";
import Link from "next/link";

export default function CotizacionesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cotizaciones</h1>
          <p className="mt-1 text-sm text-slate-400">Gestión de cotizaciones formales.</p>
        </div>
        <Link
          href="/admin/cotizaciones/nueva"
          className="inline-flex items-center gap-2 rounded-full bg-cyanx px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-white"
        >
          <Plus className="size-4" />
          Nueva cotización
        </Link>
      </div>

      <div className="mt-8">
        <div className="glass-panel overflow-hidden rounded-2xl">
          <div className="border-b border-white/10 px-6 py-4">
            <div className="grid grid-cols-7 gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Folio</span>
              <span>Cliente</span>
              <span>Total</span>
              <span>Estado</span>
              <span>Emisión</span>
              <span>Vigencia</span>
              <span>Acciones</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="size-12 text-slate-700" />
            <p className="mt-4 text-sm text-slate-500">
              Sin cotizaciones. Conecta Supabase y crea tu primera cotización.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
