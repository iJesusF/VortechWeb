import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";


export const metadata: Metadata = {
  metadataBase: new URL("https://vortech.mx"),
  title: {
    default: `${siteConfig.companyName} | Automatización, control y tratamiento de agua`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description:
    "Landing corporativa premium para integración de sistemas mecánicos, automatización industrial, PLC, medición de utilities, tratamiento de agua y dashboards cloud.",
  keywords: [
    "automatización industrial",
    "PLC",
    "tratamiento de agua",
    "ósmosis inversa",
    "SCADA",
    "BMS",
    "medición de utilities",
    "monitoreo cloud",
  ],
  openGraph: {
    title: `${siteConfig.companyName} | Operaciones inteligentes`,
    description:
      "Integración de sistemas mecánicos, automatización, PLC, utilities, tratamiento de agua y monitoreo cloud para edificios, plantas e infraestructura crítica.",
    type: "website",
    locale: "es_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
