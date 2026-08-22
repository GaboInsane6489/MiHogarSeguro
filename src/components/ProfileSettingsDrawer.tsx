"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { UserProfile, AiContextData } from "@/types/database.types";
import {
  X,
  Save,
  Loader2,
  Sparkles,
  User as UserIcon,
  Briefcase,
  Target,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface ProfileSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  profile: UserProfile | null;
  onProfileUpdated: (updatedProfile: UserProfile) => void;
}

interface ProfileSettingsFormProps {
  onClose: () => void;
  user: User;
  profile: UserProfile | null;
  onProfileUpdated: (updatedProfile: UserProfile) => void;
}

function ProfileSettingsForm({
  onClose,
  user,
  profile,
  onProfileUpdated,
}: ProfileSettingsFormProps) {
  const [fullName, setFullName] = useState(
    profile?.full_name || user.user_metadata?.full_name || ""
  );
  const [profession, setProfession] = useState(
    profile?.ai_context?.profession || ""
  );
  const [goals, setGoals] = useState(profile?.ai_context?.goals || "");
  const [customInstructions, setCustomInstructions] = useState(
    profile?.ai_context?.custom_instructions || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const updatedAiContext: AiContextData = {
      profession: profession.trim(),
      goals: goals.trim(),
      custom_instructions: customInstructions.trim(),
    };

    try {
      const { data, error } = await supabaseClient
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          ai_context: updatedAiContext,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        onProfileUpdated(data as UserProfile);
        setStatusMessage({
          type: "success",
          text: "Perfil y contexto de IA actualizados correctamente.",
        });
        setTimeout(() => {
          setStatusMessage(null);
        }, 3000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar el perfil.";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const userInitials = (fullName.trim() || user.email || "SB")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 transition-opacity"
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#0d1117] border-l border-white/10 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto">
        <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between p-6">
          <div className="space-y-6 pr-1">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Perfil & Contexto de IA
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Ajustes de personalización para el Second Brain
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes de Estado */}
            {statusMessage && (
              <div
                className={`flex items-center gap-2.5 p-3.5 rounded-xl text-xs animate-in fade-in ${
                  statusMessage.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Información Básica */}
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-white/5">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center font-bold text-sm text-indigo-400">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold text-zinc-300 truncate">
                    {fullName || "Usuario sin nombre"}
                  </span>
                  <span className="block text-[11px] text-zinc-500 font-mono truncate">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Nombre Completo */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium text-zinc-300 select-none">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre o alias"
                  className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl px-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Sección de Contexto de IA */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  Contexto Personal para Gemini AI
                </h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Este contexto se inyecta automáticamente en las solicitudes a la IA para que adapte el tono, metodologías y recomendaciones a tu perfil.
              </p>

              {/* Profesión / Rol */}
              <div className="space-y-1.5 text-left">
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 select-none">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Profesión / Rol Principal</span>
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Ej: Ingeniero de Software, Estudiante de Medicina, Diseñador UX"
                  className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl px-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Metas / Objetivos */}
              <div className="space-y-1.5 text-left">
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 select-none">
                  <Target className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Objetivos y Metas Actuales</span>
                </label>
                <textarea
                  rows={3}
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="Ej: Lanzar MVP en 1 mes, aprobar exámenes finales, aumentar fuerza en sentadilla..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Instrucciones Personalizadas */}
              <div className="space-y-1.5 text-left">
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 select-none">
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Directivas / Estilo de Respuesta para la IA</span>
                </label>
                <textarea
                  rows={3}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Ej: Respuestas concisas, desglose en pasos accionables, priorizar código TypeScript..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer de Guardado */}
          <div className="pt-5 mt-6 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-500/10 transition cursor-pointer disabled:opacity-40"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? "Guardando..." : "Guardar Perfil"}</span>
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

export function ProfileSettingsDrawer({
  isOpen,
  onClose,
  user,
  profile,
  onProfileUpdated,
}: ProfileSettingsDrawerProps) {
  if (!isOpen || !user) return null;

  return (
    <ProfileSettingsForm
      key={profile?.updated_at || profile?.id || user.id}
      onClose={onClose}
      user={user}
      profile={profile}
      onProfileUpdated={onProfileUpdated}
    />
  );
}
