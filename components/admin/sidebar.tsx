"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  ClipboardList,
  CreditCard,
  Receipt,
  Building2,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Solicitudes", href: "/admin/solicitudes", icon: ClipboardList },
  { label: "Clientes", href: "/admin/clientes", icon: Users },
  { label: "Cotizaciones", href: "/admin/cotizaciones", icon: FileText },
  { label: "Empresa", href: "/admin/configuracion/empresa", icon: Building2 },
  { label: "Pagos", href: "/admin/configuracion/pagos", icon: CreditCard },
  { label: "Facturación", href: "/admin/configuracion/facturacion", icon: Receipt },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 grid size-10 place-items-center rounded-xl border border-white/15 bg-graphite/90 text-white backdrop-blur-xl lg:hidden"
        aria-label={mobileOpen ? "Cerrar menú admin" : "Abrir menú admin"}
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-graphite/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <span className="grid size-8 place-items-center rounded-lg border border-cyanx/30 bg-cyanx/10 text-xs font-black text-cyanx">
            VT
          </span>
          <span className="text-sm font-bold tracking-wider text-white">ADMIN</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Navegación administrativa">
          <ul className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-cyanx/10 text-cyanx"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition hover:text-white"
          >
            <ExternalLink className="size-4" />
            Ver sitio
          </Link>
        </div>
      </aside>
    </>
  );
}
