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
  LogOut,
  LogIn,
} from "lucide-react";
import type { AreaType, HorizonType } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";

interface SidebarProps {
  currentArea: AreaType | "all";
  onSelectArea: (area: AreaType | "all") => void;
  currentHorizon: HorizonType | "all";
  onSelectHorizon: (horizon: HorizonType | "all") => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  user?: User | null;
  onOpenAuth?: () => void;
  onLogout?: () => Promise<void>;
}

interface AreaItem {
  id: AreaType | "all";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  activeBgClass: string;
}

interface HorizonItem {
  id: HorizonType | "all";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const AREAS: AreaItem[] = [
  {
    id: "all",
    label: "Todas las Areas",
    icon: LayoutDashboard,
    colorClass: "text-zinc-100",
    activeBgClass: "bg-white/10 text-zinc-100 font-medium",
  },
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
  onOpenAuth,
  onLogout,
}: SidebarProps) {
  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "SB";

  return (
    <aside
      className={`relative flex flex-col h-screen bg-[#0d1117] border-r border-white/5 transition-all duration-300 select-none ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header / Workspace Branding */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 min-h-[65px]">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <span className="text-indigo-400 font-bold text-xs tracking-wider">SB</span>
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
            title={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
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
            <h3 className="px-3 pt-5 pb-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider select-none">
              Areas de Enfoque
            </h3>
          )}
          <nav className="space-y-0.5">
            {AREAS.map((area) => {
              const Icon = area.icon;
              const isActive = currentArea === area.id;

              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => onSelectArea(area.id)}
                  title={isCollapsed ? area.label : undefined}
                  className={`h-10 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-3 ${
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
                    <span className="truncate">{area.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Horizontes Temporales */}
        <div>
          {!isCollapsed && (
            <h3 className="px-3 pt-5 pb-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider select-none">
              Horizontes
            </h3>
          )}
          <nav className="space-y-0.5">
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
        {user ? (
          <div
            className={`flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5 ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-indigo-400">
                  {userInitials}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-medium text-zinc-200 truncate">
                    {user.email?.split("@")[0]}
                  </span>
                  <span className="text-[9px] text-zinc-500 truncate">
                    {user.email}
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Cerrar sesion"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold hover:bg-indigo-600/25 transition cursor-pointer ${
              isCollapsed ? "justify-center" : "justify-start"
            }`}
          >
            <LogIn className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Iniciar Sesion</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
