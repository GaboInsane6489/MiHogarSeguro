"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase";
import { Mail, Lock, KeyRound, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4 font-sans text-text-primary">
      <div className="w-full max-w-md space-y-6">
        {/* Enlace volver */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Workspace</span>
        </Link>

        {/* Card Principal */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Logo / Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-ai/15 border border-ai/30 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-ai" />
            </div>
            <div>
              <h1 className="text-base font-bold text-text-primary">
                Second Brain
              </h1>
              <p className="text-xs text-text-muted">
                Autenticacion de Usuario
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-surface-subtle p-1 rounded-xl border border-border-subtle text-xs">
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-1.5 px-2 rounded-lg font-medium transition cursor-pointer ${
                tab === "signin"
                  ? "bg-surface text-text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
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
                  ? "bg-surface text-text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
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
                  ? "bg-surface text-text-primary shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Magic Link
            </button>
          </div>

          {/* Mensajes */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gym/10 border border-gym/30 text-xs text-gym">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-university/10 border border-university/30 text-xs text-university">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">
                Correo Electronico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-surface-subtle border border-border-subtle rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-ai transition"
                />
              </div>
            </div>

            {tab !== "magic_link" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">
                  Contrasena
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 6 caracteres"
                    className="w-full bg-surface-subtle border border-border-subtle rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-ai transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || (tab !== "magic_link" && !password.trim())}
              className="w-full bg-text-primary text-canvas font-semibold py-2.5 rounded-xl text-xs hover:opacity-90 active:scale-95 transition cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
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
