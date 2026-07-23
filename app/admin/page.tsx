import { FileText, ClipboardList, Users, CheckCircle2, Clock, AlertTriangle, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Solicitudes nuevas", value: "—", icon: ClipboardList, href: "/admin/solicitudes", color: "text-blue-400" },
  { label: "Cotizaciones borrador", value: "—", icon: FileText, href: "/admin/cotizaciones", color: "text-slate-400" },
  { label: "Cotizaciones enviadas", value: "—", icon: Clock, href: "/admin/cotizaciones", color: "text-amber-400" },
  { label: "Cotizaciones aceptadas", value: "—", icon: CheckCircle2, href: "/admin/cotizaciones", color: "text-emerald-400" },
  { label: "Cotizaciones vencidas", value: "—", icon: AlertTriangle, href: "/admin/cotizaciones", color: "text-red-400" },
  { label: "Pendientes de pago", value: "—", icon: DollarSign, href: "/admin/cotizaciones", color: "text-orange-400" },
  { label: "Total cotizado", value: "—", icon: TrendingUp, href: "/admin/cotizaciones", color: "text-cyanx" },
  { label: "Total aceptado", value: "—", icon: DollarSign, href: "/admin/cotizaciones", color: "text-emerald-400" },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-400">
        Resumen general de cotizaciones y solicitudes.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="glass-panel group rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-cyanx/30"
            >
              <div className="flex items-center justify-between">
                <Icon className={`size-5 ${stat.color}`} />
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="mt-3 text-xs font-medium text-slate-400">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-sm text-slate-500">
          Conecta Supabase para visualizar datos reales. Las estadísticas se actualizarán automáticamente.
        </p>
      </div>
    </div>
  );
}
