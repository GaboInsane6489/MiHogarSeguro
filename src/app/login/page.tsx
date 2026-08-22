"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase";
import { Mail, Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import Link from "next/link";

type AuthTab = "signin" | "signup" | "magic_link";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabaseClient.auth.getSession();
      if (data.session) {
        router.push("/");
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (tab === "signin") {
        const { error } = await supabaseClient.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        setSuccessMessage("Sesion iniciada correctamente. Redirigiendo...");
        setTimeout(() => router.push("/"), 800);
      } else if (tab === "signup") {
        const { error } = await supabaseClient.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        setSuccessMessage("Cuenta creada. Revisa tu correo para verificar el acceso.");
      } else if (tab === "magic_link") {
        const { error } = await supabaseClient.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
        setSuccessMessage("Enlace magico enviado a tu correo electronico.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar la solicitud.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4 font-sans text-zinc-100">
      <div className="w-full max-w-md space-y-6">
        {/* Enlace volver */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Workspace</span>
        </Link>

        {/* Card Principal */}
        <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Logo / Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center">
              <BrandLogo className="w-6 h-6 text-indigo-400" size={24} />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">
                Second Brain
              </h1>
              <p className="text-xs text-zinc-400">
                Autenticacion de Usuario
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-xl border border-white/5 text-xs">
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-1.5 px-2 rounded-lg font-medium transition cursor-pointer ${
                tab === "signin"
                  ? "bg-zinc-800 text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-1.5 px-2 rounded-lg font-medium transition cursor-pointer ${
                tab === "signup"
                  ? "bg-zinc-800 text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Registrarse
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("magic_link");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-1.5 px-2 rounded-lg font-medium transition cursor-pointer ${
                tab === "magic_link"
                  ? "bg-zinc-800 text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Magic Link
            </button>
          </div>

          {/* Mensajes */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-medium text-zinc-300 select-none">
                Correo Electronico
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {tab !== "magic_link" && (
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium text-zinc-300 select-none">
                  Contrasena
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 6 caracteres"
                    className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || (tab !== "magic_link" && !password.trim())}
              className="w-full h-11 mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {tab === "signin"
                  ? "Iniciar Sesion"
                  : tab === "signup"
                  ? "Crear Cuenta"
                  : "Enviar Magic Link"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
