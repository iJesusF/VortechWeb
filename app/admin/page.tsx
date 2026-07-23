import Link from "next/link";

const links = [
  ["Solicitudes", "/admin/solicitudes"], ["Clientes", "/admin/clientes"], ["Cotizaciones", "/admin/cotizaciones"], ["Nueva cotización", "/admin/cotizaciones/nueva"], ["Empresa", "/admin/configuracion/empresa"], ["Pagos", "/admin/configuracion/pagos"], ["Facturación", "/admin/configuracion/facturacion"],
] as const;
export default function AdminPage() { return <main className="container-shell py-20"><span className="section-eyebrow">Administración</span><h1 className="section-title">Operación comercial VORTECH</h1><p className="section-copy">Conecta Supabase y autoriza usuarios en <code>admin_users</code> para habilitar datos administrativos. Esta pantalla no expone información de clientes sin esa configuración.</p><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{links.map(([label, href]) => <Link key={href} href={href} className="glass-panel rounded-2xl p-5 font-bold text-white transition hover:border-cyanx/50 hover:text-cyanx">{label}</Link>)}</div></main>; }
