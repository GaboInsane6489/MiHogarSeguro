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
    colorClass: "text-text-primary",
    activeBgClass: "bg-surface-subtle text-text-primary font-medium",
  },
  {
    id: "trabajo",
    label: "Trabajo",
    icon: Briefcase,
    colorClass: "text-work",
    activeBgClass: "bg-work/10 text-work font-medium",
  },
  {
    id: "universidad",
    label: "Universidad",
    icon: GraduationCap,
    colorClass: "text-university",
    activeBgClass: "bg-university/10 text-university font-medium",
  },
  {
    id: "gimnasio",
    label: "Gimnasio",
    icon: Dumbbell,
    colorClass: "text-gym",
    activeBgClass: "bg-gym/10 text-gym font-medium",
  },
  {
    id: "cashea",
    label: "Cashea / Finanzas",
    icon: Wallet,
    colorClass: "text-finance",
    activeBgClass: "bg-finance/10 text-finance font-medium",
  },
  {
    id: "personal",
    label: "Personal & AI",
    icon: UserIcon,
    colorClass: "text-ai",
    activeBgClass: "bg-ai/10 text-ai font-medium",
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
      className={`relative flex flex-col h-screen bg-surface border-r border-border-subtle transition-all duration-300 select-none ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header / Workspace Branding */}
      <div className="flex items-center justify-between p-4 border-b border-border-subtle min-h-[65px]">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-ai/15 border border-ai/30 flex items-center justify-center shrink-0">
              <span className="text-ai font-bold text-xs tracking-wider">SB</span>
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-text-primary tracking-tight truncate">
                Second Brain
              </span>
              <span className="text-[10px] text-text-muted uppercase tracking-widest font-mono">
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
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle border border-transparent hover:border-border-subtle transition cursor-pointer mx-auto"
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-6">
        {/* Areas de Enfoque */}
        <div>
          {!isCollapsed && (
            <h3 className="px-2.5 pb-2 text-[10px] font-bold text-text-muted/80 uppercase tracking-widest">
              Areas de Enfoque
            </h3>
          )}
          <nav className="space-y-1">
            {AREAS.map((area) => {
              const Icon = area.icon;
              const isActive = currentArea === area.id;

              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => onSelectArea(area.id)}
                  title={isCollapsed ? area.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition cursor-pointer ${
                    isActive
                      ? area.activeBgClass
                      : "text-text-muted hover:text-text-primary hover:bg-surface-subtle/50"
                  } ${isCollapsed ? "justify-center" : "justify-start"}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? area.colorClass : "text-text-muted"
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
            <h3 className="px-2.5 pb-2 text-[10px] font-bold text-text-muted/80 uppercase tracking-widest">
              Horizontes
            </h3>
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
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition cursor-pointer ${
                    isActive
                      ? "bg-surface-subtle text-text-primary font-medium border border-border-subtle"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-subtle/50"
                  } ${isCollapsed ? "justify-center" : "justify-start"}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-text-primary" : "text-text-muted"
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
      <div className="p-3 border-t border-border-subtle space-y-2">
        {user ? (
          <div
            className={`flex items-center gap-2 p-2 rounded-xl bg-surface-subtle/60 border border-border-subtle/60 ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-ai/20 border border-ai/40 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-ai">
                  {userInitials}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-medium text-text-primary truncate">
                    {user.email?.split("@")[0]}
                  </span>
                  <span className="text-[9px] text-text-muted truncate">
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
                className="p-1 rounded-lg text-text-muted hover:text-gym hover:bg-gym/10 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className={`w-full flex items-center gap-2 p-2 rounded-xl bg-ai/10 border border-ai/30 text-ai text-xs font-semibold hover:bg-ai/20 transition cursor-pointer ${
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
