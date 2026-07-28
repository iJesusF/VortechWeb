import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { QuoteCartProvider } from "@/components/quote-cart/cart-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://vortech.mx"),
  title: {
    default: `${siteConfig.companyName} | Automatización, control y tratamiento de agua`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description:
    "Integración de sistemas mecánicos, automatización industrial, PLC, medición de utilities, tratamiento de agua y dashboards cloud.",
  keywords: [
    "automatización industrial",
    "PLC",
    "tratamiento de agua",
    "ósmosis inversa",
    "SCADA",
    "BMS",
    "medición de utilities",
    "monitoreo cloud",
    "catálogo industrial",
  ],
  openGraph: {
    title: `${siteConfig.companyName} | Operaciones inteligentes`,
    description:
      "Integración de sistemas mecánicos, automatización, PLC, utilities, tratamiento de agua y monitoreo cloud.",
    type: "website",
    locale: "es_MX",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased">
        <QuoteCartProvider>
          {children}
        </QuoteCartProvider>
      </body>
    </html>
  );
}
