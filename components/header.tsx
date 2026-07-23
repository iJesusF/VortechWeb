"use client";

import Link from "next/link";
import { Menu, MessageSquareText, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navigationItems, siteConfig } from "@/lib/site-config";
import { useQuotationCart } from "@/components/quotation-cart";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useQuotationCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-graphite/70 backdrop-blur-2xl">
      <nav className="container-shell flex h-20 items-center justify-between" aria-label="Navegación principal">
        <Link href="/" className="group flex items-center gap-3" aria-label="Ir al inicio">
          <span className="grid size-10 place-items-center rounded-xl border border-cyanx/30 bg-cyanx/10 text-sm font-black text-cyanx shadow-glow">
            VT
          </span>
          <span className="text-lg font-black tracking-[0.22em] text-white">{siteConfig.shortName}</span>
        </Link>
        <div className="hidden items-center gap-7 lg:flex">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-300 transition hover:text-cyanx">
              {item.label}
            </Link>
          ))}
          <Link href="/solicitud-cotizacion" className="relative text-sm font-medium text-slate-300 transition hover:text-cyanx">
            Solicitud{itemCount ? <span className="ml-1 rounded-full bg-cyanx px-1.5 py-0.5 text-xs font-bold text-slate-950">{itemCount}</span> : null}
          </Link>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/solicitud-cotizacion" className="relative rounded-full border border-cyanx/30 p-2 text-cyanx" aria-label={`Solicitud de cotización, ${itemCount} artículos`}>
            <MessageSquareText className="size-5" />
            {itemCount ? <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-cyanx text-[10px] font-bold text-slate-950">{itemCount}</span> : null}
          </Link>
          <button type="button" className="rounded-full border border-cyanx/30 p-2 text-cyanx" aria-label={isOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={isOpen} aria-controls="mobile-navigation" onClick={() => setIsOpen((open) => !open)}>
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        <a href={`mailto:${siteConfig.email}`} className="cta-button hidden bg-cyanx text-slate-950 shadow-glow hover:-translate-y-0.5 hover:bg-white lg:inline-flex">Contactar</a>
      </nav>
      {isOpen ? <div id="mobile-navigation" className="border-t border-white/10 bg-graphite/95 px-5 py-5 lg:hidden">
        <div className="container-shell grid gap-1 px-0">
          {navigationItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="rounded-xl px-4 py-3 text-base font-semibold text-slate-100 hover:bg-cyanx/10 hover:text-cyanx">{item.label}</Link>)}
          <Link href="/solicitud-cotizacion" onClick={() => setIsOpen(false)} className="mt-2 rounded-xl bg-cyanx px-4 py-3 text-center font-bold text-slate-950">Solicitud de cotización{itemCount ? ` (${itemCount})` : ""}</Link>
        </div>
      </div> : null}
    </header>
  );
}
