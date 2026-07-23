import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="container-shell grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="text-lg font-black tracking-[0.22em] text-white">
            {siteConfig.shortName}
          </Link>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
            {siteConfig.companyName} — integración de sistemas mecánicos, automatización, control industrial, tratamiento de agua y medición inteligente de utilities.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-white">Servicios</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>Automatización BMS</li>
            <li>PLC, HMI y SCADA</li>
            <li>RO, UF, MF, EDI y PTAR</li>
            <li>Dashboards cloud</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white">Contacto</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>{siteConfig.email}</li>
            <li>{siteConfig.phone}</li>
            <li>{siteConfig.location}</li>
          </ul>
        </div>
      </div>
      <div className="container-shell mt-8 text-xs text-slate-500">
        © {new Date().getFullYear()} {siteConfig.companyName}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
