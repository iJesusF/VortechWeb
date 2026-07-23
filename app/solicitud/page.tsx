import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { QuoteRequestCart } from "@/components/quote-cart/quote-request-cart";

export const metadata: Metadata = {
  title: "Solicitud de cotización",
  description: "Revisa y envía tu solicitud de cotización para productos y soluciones industriales VORTECH.",
};

export default function SolicitudPage() {
  return (
    <>
      <Header />
      <main className="overflow-hidden pt-24 sm:pt-32">
        <QuoteRequestCart />
      </main>
      <Footer />
    </>
  );
}
