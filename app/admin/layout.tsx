import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin | INTEGRA",
    template: "%s | Admin INTEGRA",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
