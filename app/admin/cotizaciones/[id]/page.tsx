import { FileText } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuoteDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Cotización</h1>
      <p className="mt-1 text-sm text-slate-400">ID: {id}</p>

      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] py-16">
        <FileText className="size-12 text-slate-700" />
        <p className="mt-4 text-sm text-slate-500">
          Conecta Supabase para ver detalles de la cotización.
        </p>
      </div>
    </div>
  );
}
