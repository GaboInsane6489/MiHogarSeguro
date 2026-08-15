"use client";

import React from "react";
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Dumbbell,
  Wallet,
  User,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Compass,
  Milestone,
} from "lucide-react";
import type { AreaType, HorizonType } from "@/types/database.types";

interface SidebarProps {
  currentArea: AreaType | "all";
  onSelectArea: (area: AreaType | "all") => void;
  currentHorizon: HorizonType | "all";
  onSelectHorizon: (horizon: HorizonType | "all") => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
    label: "Todas las Áreas",
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
    icon: User,
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
}: SidebarProps) {
  return (
    <aside
      className={`relative flex flex-col h-screen bg-surface border-r border-border transition-all duration-300 select-none ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header / Workspace info */}
      <div className="flex items-center justify-between p-4 border-b border-border min-h-[65px]">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-ai/15 border border-ai/30 flex items-center justify-center shrink-0">
              <span className="text-ai font-bold text-sm">SB</span>
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold text-text-primary truncate">
                Second Brain
              </span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider">
                Workspace
              </span>
            </div>
          </div>
        )}

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle border border-transparent hover:border-border transition cursor-pointer mx-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-6">
        {/* Áreas temáticas */}
        <div>
          {!isCollapsed && (
            <h3 className="px-2.5 pb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
              Áreas de Enfoque
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
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs transition cursor-pointer ${
                    isActive
                      ? area.activeBgClass
                      : "text-text-muted hover:text-text-primary hover:bg-surface-subtle/60"
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

        {/* Horizontes temporales */}
        <div>
          {!isCollapsed && (
            <h3 className="px-2.5 pb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
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
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs transition cursor-pointer ${
                    isActive
                      ? "bg-surface-subtle text-text-primary font-medium border border-border"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-subtle/60"
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

      {/* Footer info */}
      <div className="p-3 border-t border-border">
        <div
          className={`flex items-center gap-2 p-1.5 rounded-lg bg-surface-subtle/40 border border-border/50 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-university animate-pulse shrink-0" />
          {!isCollapsed && (
            <span className="text-[11px] text-text-muted truncate">
              Supabase + Gemini Conectados
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
