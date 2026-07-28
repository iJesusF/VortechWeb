import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | VORTECH Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 pt-20 lg:p-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
