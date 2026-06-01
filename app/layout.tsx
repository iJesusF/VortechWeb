import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://integra-controls.vercel.app"),
  title: {
    default: `${siteConfig.companyName} | Automatización, control y tratamiento de agua`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description:
    "Landing corporativa premium para automatización industrial, PLC, medición de utilities, tratamiento de agua y dashboards cloud.",
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
      "Automatización, PLC, utilities, tratamiento de agua y monitoreo en la nube para edificios, plantas e infraestructura crítica.",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
