import { siteConfig } from "@/lib/site-config";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-graphite/70 backdrop-blur-2xl">
      <nav className="container-shell flex h-20 items-center justify-between" aria-label="Navegación principal">
        <a href="#inicio" className="group flex items-center gap-3" aria-label="Ir al inicio">
          <span className="grid size-10 place-items-center rounded-xl border border-cyanx/30 bg-cyanx/10 text-sm font-black text-cyanx shadow-glow">
            VT
          </span>
          <span className="text-lg font-black tracking-[0.22em] text-white">{siteConfig.shortName}</span>
        </a>
        <div className="hidden items-center gap-7 lg:flex">
          {siteConfig.navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium text-slate-300 transition hover:text-cyanx">
              {item.label}
            </a>
          ))}
        </div>
        <a href={`mailto:${siteConfig.email}`} className="cta-button bg-cyanx text-slate-950 shadow-glow hover:-translate-y-0.5 hover:bg-white">
          Contactar
        </a>
      </nav>
    </header>
  );
}
