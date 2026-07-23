"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, FileText } from "lucide-react";
import { siteConfig, type NavItem } from "@/lib/site-config";
import { useQuoteCart } from "@/components/quote-cart/cart-provider";

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const pathname = usePathname();

  // For anchor links from non-home pages, use full URL
  if (item.isAnchor) {
    const isHome = pathname === "/";
    if (isHome) {
      // On home page, use simple anchor
      return (
        <a
          href={item.href.replace("/", "")}
          onClick={onClick}
          className="text-sm font-medium text-slate-300 transition hover:text-cyanx"
        >
          {item.label}
        </a>
      );
    }
    // From other pages, navigate to home + anchor
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className="text-sm font-medium text-slate-300 transition hover:text-cyanx"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="text-sm font-medium text-slate-300 transition hover:text-cyanx"
    >
      {item.label}
    </Link>
  );
}

function CartBadge() {
  const { items } = useQuoteCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  if (count === 0) return null;

  return (
    <Link
      href="/solicitud"
      className="relative flex items-center gap-2 rounded-full border border-cyanx/30 bg-cyanx/10 px-3 py-2 text-sm font-medium text-cyanx transition hover:bg-cyanx/20"
      aria-label={`Solicitud de cotización: ${count} artículo${count !== 1 ? "s" : ""}`}
    >
      <FileText className="size-4" aria-hidden="true" />
      <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-cyanx text-[10px] font-bold text-slate-950">
        {count > 99 ? "99+" : count}
      </span>
    </Link>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileOpen) {
        closeMobile();
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, closeMobile]);

  // Trap focus within mobile menu
  useEffect(() => {
    if (!mobileOpen || !menuRef.current) return;

    const focusableElements = menuRef.current.querySelectorAll<HTMLElement>(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleTab);
    firstFocusable?.focus();
    return () => document.removeEventListener("keydown", handleTab);
  }, [mobileOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-graphite/70 backdrop-blur-2xl">
      <nav className="container-shell flex h-16 items-center justify-between sm:h-20" aria-label="Navegación principal">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3" aria-label="Ir al inicio">
          <span className="grid size-10 place-items-center rounded-xl border border-cyanx/30 bg-cyanx/10 text-sm font-black text-cyanx shadow-glow">
            VT
          </span>
          <span className="text-lg font-black tracking-[0.22em] text-white">{siteConfig.shortName}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 lg:flex">
          {siteConfig.navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hidden items-center gap-4 lg:flex">
          <CartBadge />
          <a
            href={`mailto:${siteConfig.email}`}
            className="cta-button bg-cyanx text-slate-950 shadow-glow hover:-translate-y-0.5 hover:bg-white"
          >
            Contactar
          </a>
        </div>

        {/* Mobile: cart badge + hamburger */}
        <div className="flex items-center gap-3 lg:hidden">
          <CartBadge />
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/5 text-white transition hover:border-cyanx/40 hover:text-cyanx"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-black/60 backdrop-blur-sm sm:top-20 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu panel */}
      <div
        ref={menuRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className={`fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-white/10 bg-graphite/95 backdrop-blur-2xl transition-transform duration-300 sm:top-20 sm:max-h-[calc(100vh-5rem)] lg:hidden ${
          mobileOpen ? "translate-y-0" : "-translate-y-full pointer-events-none"
        }`}
      >
        <div className="container-shell flex flex-col gap-2 py-6">
          {siteConfig.navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              onClick={closeMobile}
            />
          ))}
          <hr className="my-3 border-white/10" />
          <Link
            href="/solicitud"
            onClick={closeMobile}
            className="text-sm font-medium text-cyanx transition hover:text-white"
          >
            Solicitud de cotización
          </Link>
          <a
            href={`mailto:${siteConfig.email}`}
            onClick={closeMobile}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-cyanx px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white"
          >
            Contactar
          </a>
        </div>
      </div>
    </header>
  );
}
