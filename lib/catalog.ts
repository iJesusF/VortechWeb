export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  image: string;
  isActive: boolean;
};

// This local seed keeps the public catalogue operational until the existing catalogue
// table is connected through Supabase. It intentionally contains no public prices.
export const catalogProducts: CatalogProduct[] = [
  { id: "plc-hmi", slug: "plc-hmi-industrial", name: "PLC y HMI industrial", sku: "VT-CTRL-001", category: "Automatización", description: "Control, visualización e integración para procesos industriales.", image: "/catalogo/plc-hmi.svg", isActive: true },
  { id: "water-ro", slug: "sistema-osmosis-inversa", name: "Sistema de ósmosis inversa", sku: "VT-WTR-001", category: "Tratamiento de agua", description: "Solución técnica para agua de proceso con instrumentación y control.", image: "/catalogo/osmosis.svg", isActive: true },
  { id: "utility-meter", slug: "medicion-utilities", name: "Medición de utilities", sku: "VT-MTR-001", category: "Monitoreo", description: "Medición conectada de energía, agua, aire y vapor para decisiones operativas.", image: "/catalogo/medicion.svg", isActive: true },
];

export function getProductUrl(slug: string) {
  return `/catalogo/${slug}`;
}
