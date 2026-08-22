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
  Trash2,
  Palette,
  FolderHeart,
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
  url: string;
}

const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: "obsidian-mesh",
    name: "Obsidian Mesh",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: "cyber-indigo",
    name: "Cyber Indigo",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: "emerald-dark",
    name: "Emerald Aurora",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: "titanium-carbon",
    name: "Deep Space",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1920&auto=format&fit=crop",
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

  // Lista de fondos personalizados guardados por el usuario (Inicializador diferido React 19)
  const [savedWallpapers, setSavedWallpapers] = useState<string[]>(() => {
    const fromProfile = Array.isArray(profile?.preferences?.saved_wallpapers)
      ? (profile?.preferences?.saved_wallpapers as string[])
      : [];

    let fromStorage: string[] = [];
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("sb_saved_wallpapers");
        if (raw) fromStorage = JSON.parse(raw);
      } catch {
        // Ignore local parse error
      }
    }

    const combined = Array.from(new Set([...fromProfile, ...fromStorage]));
    if (profile?.banner_url && !combined.includes(profile.banner_url)) {
      combined.unshift(profile.banner_url);
    }
    return combined;
  });

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
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Subir y optimizar Avatar (400x400 WebP)
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    setFeedback(null);

    try {
      const optimized = await optimizeImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.88,
        format: "image/webp",
      });

      const sizeKb = Math.round(optimized.size / 1024);
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
        message: `Foto de perfil optimizada (${sizeKb} KB WebP). Guarda para aplicar los cambios.`,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al subir foto de perfil.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Subir y optimizar Wallpaper / Banner (2560x1440 2K QHD WebP)
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingBanner(true);
    setFeedback(null);

    try {
      const optimized = await optimizeImage(file, {
        maxWidth: 2560,
        maxHeight: 1440,
        quality: 0.95,
        format: "image/webp",
      });

      const sizeKb = Math.round(optimized.size / 1024);
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

      const newUrl = data.publicUrl;
      setBannerUrl(newUrl);

      // Guardar en la lista de fondos personalizados
      const updatedList = Array.from(new Set([newUrl, ...savedWallpapers]));
      setSavedWallpapers(updatedList);
      try {
        localStorage.setItem("sb_saved_wallpapers", JSON.stringify(updatedList));
      } catch {
        // Ignore local storage error
      }

      setFeedback({
        type: "success",
        message: `Fondo optimizado (${sizeKb} KB WebP) y guardado en tu colección. Guarda para aplicar.`,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al subir fondo de pantalla.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setUploadingBanner(false);
    }
  };

  // Quitar Fondo / Restablecer
  const handleRemoveBanner = () => {
    setBannerUrl("");
    setFeedback({
      type: "success",
      message:
        "Fondo removido. Se usará el tema oscuro nativo. Guarda para aplicar.",
    });
  };

  // Quitar Avatar
  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    setFeedback({
      type: "success",
      message:
        "Foto de perfil removida. Se usarán tus iniciales. Guarda para aplicar.",
    });
  };

  // Seleccionar Preset o Fondo Guardado
  const handleSelectWallpaper = (url: string, title?: string) => {
    setBannerUrl(url);
    setFeedback({
      type: "success",
      message: `Fondo ${title ? `"${title}"` : ""} seleccionado. Guarda para aplicar.`,
    });
  };

  // Eliminar un fondo de la lista personalizada
  const handleDeleteSavedWallpaper = (urlToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedWallpapers.filter((u) => u !== urlToDelete);
    setSavedWallpapers(updated);
    try {
      localStorage.setItem("sb_saved_wallpapers", JSON.stringify(updated));
    } catch {
      // Ignore
    }
    if (bannerUrl === urlToDelete) {
      setBannerUrl("");
    }
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
        preferences: {
          ...(profile?.preferences || {}),
          saved_wallpapers: savedWallpapers,
        },
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
          message: "¡Perfil y colección de fondos guardados exitosamente!",
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
        {/* Header con Banner / Fondo de Portada con Efecto Completo y Ambiente */}
        <div className="relative h-32 sm:h-36 w-full bg-[#0d1117] border-b border-white/10 overflow-hidden shrink-0">
          {bannerUrl ? (
            <>
              {/* Capa de ambiente difuminado */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110"
              />
              {/* Imagen principal completa sin recortes */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerUrl}
                alt="Fondo de pantalla del workspace"
                className="relative w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117]/80 via-transparent to-transparent pointer-events-none" />
            </>
          ) : (
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-900/40 to-transparent flex items-center justify-center">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Fondo Oscuro Nativo
              </span>
            </div>
          )}

          {/* Botones de Acción de Portada */}
          <div className="absolute top-2.5 right-11 flex items-center gap-1.5 z-10">
            {bannerUrl && (
              <button
                type="button"
                onClick={handleRemoveBanner}
                title="Quitar fondo y volver al tema oscuro nativo"
                className="p-1.5 rounded-lg bg-black/70 hover:bg-rose-500/20 hover:text-rose-300 text-zinc-300 border border-white/10 backdrop-blur-md text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Quitar</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingBanner}
              title="Subir nuevo fondo de pantalla (2K QHD WebP)"
              className="p-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/40 backdrop-blur-md text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              {uploadingBanner ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              <span>{bannerUrl ? "Cambiar Fondo" : "Subir Fondo"}</span>
            </button>
          </div>

          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerUpload}
          />

          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={onClose}
            title="Cerrar modal"
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-zinc-400 hover:text-white border border-white/10 backdrop-blur-md transition cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Avatar Superpuesto */}
          <div className="absolute -bottom-5 left-5 flex items-end gap-3 z-10">
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900 border-2 border-indigo-500/60 shadow-2xl overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg sm:text-xl font-bold text-indigo-400 font-mono">
                    {userInitials}
                  </span>
                )}

                {/* Overlay para subir Avatar */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  title="Cambiar foto de perfil"
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1 cursor-pointer"
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

            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                title="Quitar foto y usar iniciales"
                className="mb-1 p-1 rounded-lg bg-zinc-900/90 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-white/10 transition cursor-pointer text-[10px] font-mono"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Navegación por Pestañas */}
        <div className="pt-7 px-6 border-b border-white/10 flex items-center gap-6 bg-[#161b22]/40">
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
                  placeholder="Ej: Gabriel Martínez"
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

              {/* Galería de Mis Fondos Guardados */}
              {savedWallpapers.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <FolderHeart className="w-4 h-4 text-indigo-400" />
                    <label className="text-xs font-semibold text-zinc-200">
                      Mis Fondos Guardados ({savedWallpapers.length})
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {savedWallpapers.map((url, idx) => {
                      const isSelected = bannerUrl === url;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectWallpaper(url)}
                          className={`group relative h-20 rounded-xl border overflow-hidden p-2 flex flex-col justify-between transition cursor-pointer ${
                            isSelected
                              ? "border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg"
                              : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105"
                            style={{ backgroundImage: `url(${url})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {/* Boton Eliminar Fondo Guardado */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSavedWallpaper(url, e)}
                            title="Eliminar de mi colección"
                            className="relative z-10 self-end p-1 rounded-md bg-black/60 hover:bg-rose-500/30 text-zinc-400 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          <span className="relative z-10 text-[10px] font-mono text-zinc-300 font-bold truncate">
                            {isSelected ? "Activo" : `Fondo ${idx + 1}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Galería de Fondos Prediseñados */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  <label className="text-xs font-semibold text-zinc-200">
                    Fondos de Pantalla Prediseñados (Presets Dark)
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {WALLPAPER_PRESETS.map((preset) => {
                    const isSelected = bannerUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          handleSelectWallpaper(preset.url, preset.name)
                        }
                        className={`group relative h-20 rounded-xl border overflow-hidden p-2 flex flex-col justify-end transition cursor-pointer ${
                          isSelected
                            ? "border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105"
                          style={{ backgroundImage: `url(${preset.url})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <span className="relative z-10 text-[11px] font-bold text-white truncate">
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
