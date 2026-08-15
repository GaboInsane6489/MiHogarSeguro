"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabase";
import { X, Mail, Lock, KeyRound, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthTab = "signin" | "signup" | "magic_link";

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

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
        setSuccessMessage("Sesion iniciada correctamente.");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 800);
      } else if (tab === "signup") {
        const { error } = await supabaseClient.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        setSuccessMessage("Cuenta creada. Revisa tu correo si requiere confirmacion.");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
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
      const msg = err instanceof Error ? err.message : "Error al procesar la autenticacion.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      />

      {/* Card */}
      <div className="relative w-full max-w-md bg-surface border border-border-subtle rounded-2xl p-6 shadow-2xl z-10 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ai/15 border border-ai/30 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-ai" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Second Brain Auth
              </h3>
              <p className="text-[11px] text-text-muted">
                Acceso a tu espacio de ejecucion
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs de Navegacion */}
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

        {/* Mensajes de Alerta */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gym/10 border border-gym/30 text-xs text-gym animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-university/10 border border-university/30 text-xs text-university animate-in fade-in">
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
  );
}
