import type { Metadata } from "next";
import { notFound } from "next/navigation";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function PublicQuote({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; if (!/^[a-f0-9]{64}$/i.test(token)) notFound(); return <main className="container-shell py-20"><span className="section-eyebrow">Cotización VORTECH</span><h1 className="section-title">Enlace de cotización no disponible</h1><p className="section-copy">La consulta de cotizaciones públicas se habilita después de conectar el proyecto Supabase y aplicar las políticas de acceso del sistema.</p></main>; }
