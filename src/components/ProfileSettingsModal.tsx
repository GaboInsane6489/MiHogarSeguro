"use client";

import React, { useState, useRef } from "react";
import {
  X,
  User as UserIcon,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  Briefcase,
  Target,
  FileText,
} from "lucide-react";
import { supabaseClient } from "@/lib/supabase";
import { optimizeImage } from "@/lib/imageOptimizer";
import type { UserProfile, AiContextData } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  profile: UserProfile | null;
  onProfileUpdated: (profile: UserProfile) => void;
}

type TabType = "general" | "ai_context";

export function ProfileSettingsModal({
  isOpen,
  onClose,
  user,
  profile,
  onProfileUpdated,
}: ProfileSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("general");

  // Form State
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [bannerUrl, setBannerUrl] = useState(profile?.banner_url || "");

  // AI Context State
  const [profession, setProfession] = useState(profile?.ai_context?.profession || "");
  const [goals, setGoals] = useState(profile?.ai_context?.goals || "");
  const [customInstructions, setCustomInstructions] = useState(
    profile?.ai_context?.custom_instructions || "",
  );

  // Loading & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Subir y optimizar Avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    setFeedback(null);

    try {
      // Optimizar en el cliente a WebP ligero 400x400
      const optimized = await optimizeImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.88,
        format: "image/webp",
      });

      const fileExt = "webp";
      const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("entry-attachments")
        .upload(filePath, optimized, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabaseClient.storage
        .from("entry-attachments")
        .getPublicUrl(filePath);

      setAvatarUrl(data.publicUrl);
      setFeedback({
        type: "success",
        message: "Foto de perfil optimizada y cargada. Guarda para aplicar.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al subir avatar.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Subir y optimizar Banner
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingBanner(true);
    setFeedback(null);

    try {
      // Optimizar en el cliente a WebP panorámico 1200x450
      const optimized = await optimizeImage(file, {
        maxWidth: 1200,
        maxHeight: 450,
        quality: 0.85,
        format: "image/webp",
      });

      const fileExt = "webp";
      const filePath = `banners/${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("entry-attachments")
        .upload(filePath, optimized, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabaseClient.storage
        .from("entry-attachments")
        .getPublicUrl(filePath);

      setBannerUrl(data.publicUrl);
      setFeedback({
        type: "success",
        message: "Banner de portada optimizado y cargado. Guarda para aplicar.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al subir banner.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setUploadingBanner(false);
    }
  };

  // Guardar Cambios en Supabase
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      const ai_context: AiContextData = {
        profession: profession.trim(),
        goals: goals.trim(),
        custom_instructions: customInstructions.trim(),
      };

      const updatedProfilePayload = {
        id: user.id,
        full_name: fullName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        banner_url: bannerUrl.trim() || null,
        ai_context,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseClient
        .from("profiles")
        .upsert(updatedProfilePayload)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        onProfileUpdated(data as UserProfile);
        setFeedback({
          type: "success",
          message: "Perfil y Contexto de IA actualizados correctamente.",
        });
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar el perfil.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const userInitials = (fullName || user?.email || "U")
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 transition-opacity"
      />

      {/* Modal Central */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto flex flex-col max-h-[90vh]">
          {/* Header con Banner de Portada */}
          <div className="relative h-32 sm:h-36 w-full bg-gradient-to-r from-indigo-950 via-slate-900 to-zinc-950 border-b border-white/10 overflow-hidden shrink-0">
            {bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bannerUrl}
                alt="Banner de perfil"
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-900/20 to-transparent" />
            )}

            {/* Botón para cambiar Banner */}
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingBanner}
              title="Cambiar banner de portada"
              className="absolute top-3 right-12 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
            >
              {uploadingBanner ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Cambiar Portada</span>
            </button>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
            />

            {/* Botón Cerrar Modal */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-zinc-400 hover:text-white border border-white/10 backdrop-blur-md transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Avatar Superpuesto */}
            <div className="absolute -bottom-6 left-6 flex items-end gap-4">
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-900 border-2 border-indigo-500/50 shadow-xl overflow-hidden flex items-center justify-center">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Avatar de usuario"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl font-bold text-indigo-400 font-mono">
                      {userInitials}
                    </span>
                  )}

                  {/* Overlay para subir Avatar */}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    title="Cambiar foto de perfil"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1 cursor-pointer"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        <span>Cambiar</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navegación por Pestañas */}
          <div className="pt-8 px-6 border-b border-white/10 bg-[#161b22]/50 flex items-center justify-between shrink-0">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "general"
                    ? "border-indigo-500 text-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Perfil General</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ai_context")}
                className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "ai_context"
                    ? "border-indigo-500 text-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Contexto de IA & Cerebro</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline pb-3">
              {user?.email}
            </span>
          </div>

          {/* Formulario Principal con Scroll */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
            {feedback && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                  feedback.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {activeTab === "general" ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Nombre Completo o Alias
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej: Gabriel González"
                    className="w-full h-11 px-3.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Este nombre será utilizado por el Copiloto AI para dirigirse a ti.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 space-y-2">
                  <span className="text-xs font-semibold text-zinc-300 block">
                    Optimización Automática de Imágenes
                  </span>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Las fotos de perfil y portadas se comprimen automáticamente en tu navegador al formato WebP de alto rendimiento antes de subirse a la nube, garantizando tiempos de carga instantáneos.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-300">
                      Personalización Profunda del Copiloto
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    La IA adaptará automáticamente su tono, recomendaciones y desgloses de subtareas según tu contexto personal y profesional.
                  </p>
                </div>

                {/* Profesión / Rol */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Profesión / Rol Actual</span>
                  </label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="Ej: Desarrollador Full-Stack / Estudiante de Ingeniería / Atleta"
                    className="w-full h-11 px-3.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                {/* Objetivos y Metas */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                    <Target className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Objetivos Principales del Trimestre / Año</span>
                  </label>
                  <textarea
                    rows={3}
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="Ej: Lanzar aplicación SaaS en producción, aprobar cálculo con 18+, aumentar press banca a 100kg..."
                    className="w-full p-3 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                  />
                </div>

                {/* Directivas de Estilo */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Directivas de Estilo e Instrucciones Personalizadas</span>
                  </label>
                  <textarea
                    rows={3}
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Ej: Responde siempre directo al grano con pasos accionables. Prioriza código limpio en TypeScript. Sin explicaciones obvias..."
                    className="w-full p-3 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                  />
                </div>
              </div>
            )}

            {/* Footer de Acciones */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="h-10 px-5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Ajustes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
