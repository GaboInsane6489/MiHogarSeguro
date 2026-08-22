"use client";

import React, { useState } from "react";
import {
  X,
  User as UserIcon,
  Sparkles,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  Briefcase,
  Target,
  FileText,
  Palette,
  Check,
  Ban,
} from "lucide-react";
import { supabaseClient } from "@/lib/supabase";
import { optimizeImage } from "@/lib/imageOptimizer";
import type { UserProfile } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  profile: UserProfile | null;
  onProfileUpdated: (profile: UserProfile) => void;
}

type TabType = "general" | "ai_context";

interface WallpaperPreset {
  id: string;
  name: string;
  category: string;
  url: string;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: "obsidian-mesh",
    name: "Obsidian Mesh",
    category: "Geométrico 3D",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=90&w=3840&auto=format&fit=crop",
  },
  {
    id: "cyber-indigo",
    name: "Cyber Indigo",
    category: "Atmósfera",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=90&w=3840&auto=format&fit=crop",
  },
  {
    id: "emerald-aurora",
    name: "Emerald Aurora",
    category: "Naturaleza Dark",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=90&w=3840&auto=format&fit=crop",
  },
  {
    id: "deep-space",
    name: "Deep Space",
    category: "Galaxia",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=90&w=3840&auto=format&fit=crop",
  },
  {
    id: "cyberpunk-rain",
    name: "Cyberpunk Rain",
    category: "Urbano Nocturno",
    url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=90&w=3840&auto=format&fit=crop",
  },
  {
    id: "dark-mountains",
    name: "Dark Mountains",
    category: "Paisaje Crepuscular",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=90&w=3840&auto=format&fit=crop",
  },
  {
    id: "neon-horizon",
    name: "Neon Synthwave",
    category: "Cyberwave",
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=90&w=3840&auto=format&fit=crop",
  },
  {
    id: "midnight-forest",
    name: "Midnight Forest",
    category: "Bosque Místico",
    url: "https://images.unsplash.com/photo-1511497584788-87676104235f?q=90&w=3840&auto=format&fit=crop",
  },
  {
    id: "black-dunes",
    name: "Obsidian Dunes",
    category: "Minimalismo",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=90&w=3840&auto=format&fit=crop",
  },
  {
    id: "tech-matrix",
    name: "Titanium Matrix",
    category: "Tech Sci-Fi",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=90&w=3840&auto=format&fit=crop",
  },
  {
    id: "anime-twilight",
    name: "Tokyo Twilight",
    category: "Estilo Anime",
    url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=90&w=3840&auto=format&fit=crop",
  },
  {
    id: "cosmic-eclipse",
    name: "Cosmic Eclipse",
    category: "Astro Dark",
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=90&w=3840&auto=format&fit=crop",
  },
];

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
  const [profession, setProfession] = useState(
    profile?.ai_context?.profession || "",
  );
  const [goals, setGoals] = useState(profile?.ai_context?.goals || "");
  const [customInstructions, setCustomInstructions] = useState(
    profile?.ai_context?.custom_instructions || "",
  );

  // Loading & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Subir y optimizar Avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    setFeedback(null);

    try {
      const optimized = await optimizeImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.9,
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
        message: "Foto de perfil actualizada. Guarda para aplicar.",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al subir foto de perfil.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Seleccionar Preset o Sin Fondo
  const handleSelectWallpaper = (url: string, name: string) => {
    setBannerUrl(url);
    setFeedback({
      type: "success",
      message: url
        ? `Fondo "${name}" seleccionado. Guarda para aplicar.`
        : "Tema oscuro nativo seleccionado. Guarda para aplicar.",
    });
  };

  // Guardar Cambios en Supabase
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      const updatedProfilePayload: Partial<UserProfile> = {
        full_name: fullName.trim(),
        avatar_url: avatarUrl.trim() || null,
        banner_url: bannerUrl.trim() || null,
        ai_context: {
          profession: profession.trim(),
          goals: goals.trim(),
          custom_instructions: customInstructions.trim(),
        },
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseClient
        .from("profiles")
        .upsert({
          id: user.id,
          ...updatedProfilePayload,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        onProfileUpdated(data as UserProfile);
        setFeedback({
          type: "success",
          message: "¡Perfil y fondo actualizados exitosamente!",
        });
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al guardar el perfil.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const userInitials = (fullName || user?.email || "U")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop con desenfoque */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Centralizado */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl bg-[#0d1117]/98 border border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto flex flex-col max-h-[92vh] text-zinc-100"
      >
        {/* Header con Banner de Portada Elegante */}
        <div className="relative h-32 sm:h-36 w-full bg-gradient-to-r from-indigo-950 via-slate-900 to-zinc-950 border-b border-white/10 overflow-hidden shrink-0">
          {bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bannerUrl}
              alt="Banner de perfil"
              className="w-full h-full object-cover opacity-85 transition-opacity"
            />
          ) : (
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-900/40 to-transparent flex items-center justify-center">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Tema Oscuro Nativo
              </span>
            </div>
          )}

          {/* Botón Cerrar Modal */}
          <button
            type="button"
            onClick={onClose}
            title="Cerrar modal"
            className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-zinc-400 hover:text-white border border-white/10 backdrop-blur-md transition cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Avatar Superpuesto */}
          <div className="absolute -bottom-6 left-6 flex items-end gap-4 z-10">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-900 border-2 border-indigo-500/60 shadow-2xl overflow-hidden flex items-center justify-center">
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
              </div>

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

        {/* Navegación por Pestañas */}
        <div className="pt-8 px-6 border-b border-white/10 flex items-center gap-6 bg-[#161b22]/40">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "general"
                ? "border-indigo-500 text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>General & Fondos</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ai_context")}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "ai_context"
                ? "border-indigo-500 text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Contexto de IA</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl flex items-center gap-2.5 text-xs font-medium ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Form Content */}
        <form
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {activeTab === "general" ? (
            <div className="space-y-6">
              {/* Nombre de Usuario */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Nombre Completo / Apodo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Gabriel González"
                  className="w-full h-11 px-4 text-xs sm:text-sm bg-zinc-900/90 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Email (Solo lectura) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 block">
                  Correo Electrónico (Cuenta Supabase)
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full h-11 px-4 text-xs sm:text-sm bg-zinc-950/80 border border-white/5 rounded-xl text-zinc-500 cursor-not-allowed font-mono"
                />
              </div>

              {/* Galería de Fondos Predeterminados Curados */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-indigo-400" />
                    <label className="text-xs font-bold text-zinc-200">
                      Fondos de Pantalla Predeterminados (Curados 4K/2K)
                    </label>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Optimizados para PC & Móvil
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Opción Sin Fondo / Tema Oscuro Nativo */}
                  <button
                    type="button"
                    onClick={() => handleSelectWallpaper("", "Tema Oscuro")}
                    className={`group relative h-24 rounded-2xl border overflow-hidden p-3 flex flex-col justify-between transition cursor-pointer text-left ${
                      !bannerUrl
                        ? "border-indigo-500 ring-2 ring-indigo-500/60 bg-indigo-500/10 shadow-xl"
                        : "border-white/10 hover:border-white/30 bg-[#090d16]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Ban className="w-4 h-4 text-zinc-400" />
                      {!bannerUrl && (
                        <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Tema Oscuro
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Sin fondo (Nativo)
                      </span>
                    </div>
                  </button>

                  {/* Presets Curados */}
                  {WALLPAPER_PRESETS.map((preset) => {
                    const isSelected = bannerUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          handleSelectWallpaper(preset.url, preset.name)
                        }
                        className={`group relative h-24 rounded-2xl border overflow-hidden p-3 flex flex-col justify-between transition cursor-pointer text-left shadow-md ${
                          isSelected
                            ? "border-indigo-500 ring-2 ring-indigo-500/60 shadow-xl"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                          style={{ backgroundImage: `url(${preset.url})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-zinc-300 border border-white/10">
                            {preset.category}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-sm">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <span className="relative z-10 text-xs font-bold text-white truncate">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
                Este contexto se inyecta dinámicamente a{" "}
                <strong>Google Gemini</strong> para que sus respuestas y
                desgloses de tareas se adapten a tu perfil profesional.
              </div>

              {/* Profesión */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Profesión / Rol Actual</span>
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Ej: Desarrollador Frontend Senior & Estudiante de Ingeniería"
                  className="w-full h-11 px-4 text-xs sm:text-sm bg-zinc-900/90 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Metas Principales */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Metas Principales & Enfoque Actual</span>
                </label>
                <textarea
                  rows={3}
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="Ej: Dominar Next.js 16, mantener 4 días de entrenamiento semanales y graduarme con honores."
                  className="w-full p-3 text-xs sm:text-sm bg-zinc-900/90 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                />
              </div>

              {/* Instrucciones Personalizadas */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Directivas de Estilo para la IA</span>
                </label>
                <textarea
                  rows={3}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Ej: Respuestas directas y ejecutivas. Sin explicaciones obvias, código estructurado en TypeScript."
                  className="w-full p-3 text-xs sm:text-sm bg-zinc-900/90 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                />
              </div>
            </div>
          )}

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
