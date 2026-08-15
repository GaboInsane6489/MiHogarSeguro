"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabase";
import {
  X,
  Mail,
  Lock,
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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
        setSuccessMessage(
          "Cuenta creada. Revisa tu correo si requiere confirmacion.",
        );
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
      } else if (tab === "magic_link") {
        const { error } = await supabaseClient.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo:
              typeof window !== "undefined"
                ? window.location.origin
                : undefined,
          },
        });
        if (error) throw error;
        setSuccessMessage("Enlace magico enviado a tu correo electronico.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al procesar la autenticacion.";
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
        className="fixed inset-0 bg-black/80 backdrop-blur-xl transition-opacity"
      />

      {/* Modal Card */}
      <div className="w-full max-w-md bg-[#161b22] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl z-50 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Second Brain Auth
              </h3>
              <p className="text-xs text-zinc-400">
                Acceso a tu espacio de trabajo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-xl mb-5 border border-white/5">
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
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
            className={`py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
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
            className={`py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
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
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {/* Campo Correo Electronico */}
          <div className="space-y-1.5 mb-4 text-left">
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
                className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 transition-all"
              />
            </div>
          </div>

          {/* Campo Contrasena */}
          {tab !== "magic_link" && (
            <div className="space-y-1.5 mb-4 text-left">
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
                  className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 transition-all"
                />
              </div>
            </div>
          )}

          {/* Boton Submit */}
          <button
            type="submit"
            disabled={
              loading ||
              !email.trim() ||
              (tab !== "magic_link" && !password.trim())
            }
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
  );
}
