"use client";

import React from "react";
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Dumbbell,
  Wallet,
  User as UserIcon,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Compass,
  Milestone,
  Settings,
  LogOut,
  LogIn,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import type {
  AreaType,
  HorizonType,
  UserProfile,
} from "@/types/database.types";
import type { User } from "@supabase/supabase-js";

interface SidebarProps {
  currentArea: AreaType | "all";
  onSelectArea: (area: AreaType | "all") => void;
  currentHorizon: HorizonType | "all";
  onSelectHorizon: (horizon: HorizonType | "all") => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  user?: User | null;
  profile?: UserProfile | null;
  taskCounts?: Record<AreaType | "all", number>;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
  onOpenChat?: () => void;
  onLogout?: () => Promise<void>;
}

interface AreaItem {
  id: AreaType;
  label: string;
  icon: React.ElementType;
  colorClass: string;
  activeBgClass: string;
}

interface HorizonItem {
  id: HorizonType | "all";
  label: string;
  icon: React.ElementType;
}

const AREAS: AreaItem[] = [
  {
    id: "trabajo",
    label: "Trabajo",
    icon: Briefcase,
    colorClass: "text-sky-400",
    activeBgClass: "bg-sky-500/10 text-sky-400 font-medium",
  },
  {
    id: "universidad",
    label: "Universidad",
    icon: GraduationCap,
    colorClass: "text-emerald-400",
    activeBgClass: "bg-emerald-500/10 text-emerald-400 font-medium",
  },
  {
    id: "gimnasio",
    label: "Gimnasio",
    icon: Dumbbell,
    colorClass: "text-rose-400",
    activeBgClass: "bg-rose-500/10 text-rose-400 font-medium",
  },
  {
    id: "cashea",
    label: "Cashea / Finanzas",
    icon: Wallet,
    colorClass: "text-amber-400",
    activeBgClass: "bg-amber-500/10 text-amber-400 font-medium",
  },
  {
    id: "personal",
    label: "Personal & AI",
    icon: UserIcon,
    colorClass: "text-indigo-400",
    activeBgClass: "bg-indigo-500/10 text-indigo-400 font-medium",
  },
];

const HORIZONS: HorizonItem[] = [
  { id: "all", label: "Todo el Tiempo", icon: Compass },
  { id: "hoy", label: "Hoy", icon: Calendar },
  { id: "corto", label: "Corto Plazo", icon: Clock },
  { id: "mediano", label: "Mediano Plazo", icon: Milestone },
  { id: "largo", label: "Largo Plazo", icon: Milestone },
];

export function Sidebar({
  currentArea,
  onSelectArea,
  currentHorizon,
  onSelectHorizon,
  isCollapsed = false,
  onToggleCollapse,
  user,
  profile,
  taskCounts,
  isMobileOpen = false,
  onCloseMobile,
  onOpenAuth,
  onOpenProfile,
  onOpenChat,
  onLogout,
}: SidebarProps) {
  const displayName =
    profile?.full_name?.trim() || user?.email?.split("@")[0] || "Usuario";
  const userInitials = (displayName || "SB").slice(0, 2).toUpperCase();

  const handleSelectAreaMobile = (areaId: AreaType | "all") => {
    onSelectArea(areaId);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectHorizonMobile = (horizonId: HorizonType | "all") => {
    onSelectHorizon(horizonId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Menu Movil Fullscreen Centrado (Exclusivo para móviles < md cuando se abre el boton hamburguesa) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-[#0d1117]/98 backdrop-blur-2xl md:hidden flex flex-col justify-between p-5 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 text-zinc-100">
          {/* Header Centrado Movil */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                <BrandLogo size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Second Brain
                </h2>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                  Linear OS
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              title="Cerrar menu"
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Seccion Central: Grilla Centrada de Areas */}
          <div className="py-5 space-y-6 flex-1 flex flex-col justify-center">
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono text-center block">
                Areas de Enfoque
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Todas las Areas */}
                <button
                  type="button"
                  onClick={() => handleSelectAreaMobile("all")}
                  className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-2 transition cursor-pointer ${
                    currentArea === "all"
                      ? "bg-indigo-600/25 border-indigo-500/50 text-white font-semibold shadow-xl"
                      : "bg-white/[0.03] border-white/10 text-zinc-300 hover:bg-white/[0.06]"
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-semibold">Todas las Areas</span>
                  {taskCounts && (taskCounts["all"] || 0) > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                      {taskCounts["all"]} tareas
                    </span>
                  )}
                </button>

                {/* Areas individuales */}
                {AREAS.map((area) => {
                  const Icon = area.icon;
                  const isActive = currentArea === area.id;
                  const count = taskCounts ? taskCounts[area.id] || 0 : 0;
                  return (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => handleSelectAreaMobile(area.id)}
                      className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-2 transition cursor-pointer ${
                        isActive
                          ? `${area.activeBgClass} border-current text-white font-semibold shadow-xl`
                          : "bg-white/[0.03] border-white/10 text-zinc-300 hover:bg-white/[0.06]"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${area.colorClass}`} />
                      <span className="text-xs font-semibold">
                        {area.label}
                      </span>
                      {count > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                          {count} pendientes
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Horizontes Centrados */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono text-center block">
                Horizontes Temporales
              </span>
              <div className="grid grid-cols-2 gap-2">
                {HORIZONS.map((horizon) => {
                  const Icon = horizon.icon;
                  const isActive = currentHorizon === horizon.id;
                  return (
                    <button
                      key={horizon.id}
                      type="button"
                      onClick={() => handleSelectHorizonMobile(horizon.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs transition cursor-pointer ${
                        isActive
                          ? "bg-white/15 border-white/30 text-white font-bold"
                          : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-zinc-400" />
                      <span>{horizon.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pie Centrado Movil */}
          <div className="pt-4 border-t border-white/10 space-y-3 shrink-0">
            {onOpenChat && (
              <button
                type="button"
                onClick={() => {
                  onOpenChat();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-white text-xs font-bold transition cursor-pointer shadow-lg"
              >
                <BrandLogo size={18} />
                <span>Abrir Copiloto AI</span>
              </button>
            )}

            {user ? (
              <div
                onClick={() => {
                  onOpenProfile?.();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 overflow-hidden flex items-center justify-center shrink-0">
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_url}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-indigo-400 font-mono">
                        {userInitials}
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-white block">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {profile?.ai_context?.profession || user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenProfile?.();
                      if (onCloseMobile) onCloseMobile();
                    }}
                    title="Ajustes de Perfil"
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLogout();
                      }}
                      title="Cerrar sesion"
                      className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              onOpenAuth && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuth();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full h-11 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesion</span>
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Sidebar Fijo de Escritorio (Exclusivo para pantallas >= md, oculto 100% en movil) */}
      <aside
        className={`hidden md:flex flex-col h-screen shrink-0 bg-[#0d1117] border-r border-white/10 transition-all duration-300 select-none z-20 ${
          isCollapsed ? "w-20 min-w-[80px]" : "w-64 min-w-[256px]"
        }`}
      >
        {/* Header / Workspace Branding */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 min-h-[65px]">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <BrandLogo className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-zinc-100 tracking-tight truncate">
                  Second Brain
                </span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                  Linear OS
                </span>
              </div>
            </div>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title={
                isCollapsed
                  ? "Expandir barra lateral"
                  : "Colapsar barra lateral"
              }
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition cursor-pointer mx-auto"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5">
          {/* Areas de Enfoque */}
          <div>
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-2 block font-mono">
                Areas de Enfoque
              </span>
            )}
            <nav className="space-y-1">
              {/* Boton Todas las Areas */}
              <button
                type="button"
                onClick={() => onSelectArea("all")}
                title={isCollapsed ? "Todas las Areas" : undefined}
                className={`group h-10 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-3 ${
                  currentArea === "all"
                    ? "bg-white/10 text-zinc-100 font-medium border border-white/5"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                } ${isCollapsed ? "justify-center px-0" : "justify-start"}`}
              >
                <LayoutDashboard
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    currentArea === "all" ? "text-zinc-100" : "text-zinc-400"
                  }`}
                />
                {!isCollapsed && (
                  <>
                    <span className="truncate flex-1 text-left">
                      Todas las Areas
                    </span>
                    {taskCounts && (taskCounts["all"] || 0) > 0 && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                          currentArea === "all"
                            ? "bg-white/15 text-white font-bold"
                            : "bg-white/[0.04] text-zinc-500 group-hover:text-zinc-300"
                        }`}
                      >
                        {taskCounts["all"]}
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* Lista de Areas */}
              {AREAS.map((area) => {
                const Icon = area.icon;
                const isActive = currentArea === area.id;
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => onSelectArea(area.id)}
                    title={isCollapsed ? area.label : undefined}
                    className={`group h-10 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-3 ${
                      isActive
                        ? area.activeBgClass
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                    } ${isCollapsed ? "justify-center px-0" : "justify-start"}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? area.colorClass : "text-zinc-400"
                      }`}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1 text-left">
                          {area.label}
                        </span>
                        {taskCounts && (taskCounts[area.id] || 0) > 0 && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                              isActive
                                ? "bg-white/15 text-white font-bold"
                                : "bg-white/[0.04] text-zinc-500 group-hover:text-zinc-300"
                            }`}
                          >
                            {taskCounts[area.id]}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Horizontes */}
          <div className="mt-6">
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-2 block font-mono">
                Horizontes
              </span>
            )}
            <nav className="space-y-1">
              {HORIZONS.map((horizon) => {
                const Icon = horizon.icon;
                const isActive = currentHorizon === horizon.id;
                return (
                  <button
                    key={horizon.id}
                    type="button"
                    onClick={() => onSelectHorizon(horizon.id)}
                    title={isCollapsed ? horizon.label : undefined}
                    className={`h-10 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-3 ${
                      isActive
                        ? "bg-white/10 text-zinc-100 font-medium border border-white/5"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                    } ${isCollapsed ? "justify-center px-0" : "justify-start"}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? "text-zinc-100" : "text-zinc-400"
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{horizon.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer / User Profile & Auth */}
        <div className="p-3 pt-3 border-t border-white/5 space-y-2">
          {/* Boton Acceso Rapido a Copiloto AI */}
          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              title={isCollapsed ? "Abrir Copiloto AI" : undefined}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-500/40 text-zinc-200 hover:text-white text-xs font-semibold transition cursor-pointer group ${
                isCollapsed ? "justify-center" : "justify-start"
              }`}
            >
              <div className="relative shrink-0 flex items-center justify-center">
                <BrandLogo
                  size={16}
                  className="transition-transform group-hover:scale-110"
                />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              {!isCollapsed && (
                <span className="flex-1 text-left">Copiloto AI</span>
              )}
            </button>
          )}

          {user ? (
            <div
              onClick={onOpenProfile}
              title="Ajustes de Perfil & Contexto de IA"
              className={`group flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition cursor-pointer ${
                isCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 overflow-hidden flex items-center justify-center shrink-0">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-indigo-400 font-mono">
                      {userInitials}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-zinc-500 truncate font-mono">
                      {profile?.ai_context?.profession || user.email}
                    </span>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenProfile?.();
                    }}
                    title="Configurar perfil"
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLogout();
                      }}
                      title="Cerrar sesion"
                      className="p-1 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className={`w-full h-9 px-3 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition flex items-center gap-2 cursor-pointer shadow-sm ${
                  isCollapsed ? "justify-center" : "justify-start"
                }`}
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                {!isCollapsed && <span>Iniciar Sesion</span>}
              </button>
            )
          )}
        </div>
      </aside>
    </>
  );
}
