import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicQuoteView } from "@/components/quotation/public-quote-view";

export const metadata: Metadata = {
  title: "Cotización",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicQuotePage({ params }: PageProps) {
  const { token } = await params;

  // Validate token format (basic check)
  if (!token || token.length < 10) {
    notFound();
  }

  // In production, this fetches from Supabase using the token
  // For now, render a demo view
  return <PublicQuoteView token={token} />;
}
