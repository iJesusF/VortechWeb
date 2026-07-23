export type NavItem = {
  label: string;
  href: string;
  isAnchor?: boolean;
};

export const siteConfig = {
  companyName: "VORTECH",
  shortName: "VORTECH",
  email: "ventas@vortech.mx",
  phone: "+52 6861455822",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5216861455822",
  location: "Baja California, Mexico",
  website: "https://vortech.mx",
  navItems: [
    { label: "Inicio", href: "/", isAnchor: false },
    { label: "Servicios", href: "/#servicios", isAnchor: true },
    { label: "Soluciones", href: "/#soluciones", isAnchor: true },
    { label: "Proceso", href: "/#proceso", isAnchor: true },
    { label: "Tecnología", href: "/#tecnologia", isAnchor: true },
    { label: "Catálogo", href: "/catalogo", isAnchor: false },
    { label: "Contacto", href: "/#contacto", isAnchor: true },
  ] as NavItem[],
} as const;
