"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Credenciales inválidas. Verifique su correo y contraseña.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-[2rem] p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-cyanx/30 bg-cyanx/10">
              <Lock className="size-7 text-cyanx" />
            </div>
            <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
            <p className="mt-2 text-sm text-slate-400">
              Ingrese sus credenciales para continuar
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="size-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="grid gap-2 text-sm font-medium text-slate-200">
              Correo electrónico
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyanx focus:ring-2 focus:ring-cyanx/20"
                  placeholder="admin@empresa.com"
                  required
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-200">
              Contraseña
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyanx focus:ring-2 focus:ring-cyanx/20"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="cta-button w-full bg-cyanx text-slate-950 shadow-glow hover:bg-white disabled:opacity-50 disabled:hover:bg-cyanx disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
