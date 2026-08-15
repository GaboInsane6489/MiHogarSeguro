"use client";

import { useState, useEffect, useMemo } from "react";
import { supabaseClient } from "@/lib/supabase";
import { Sidebar } from "@/components/Sidebar";
import { AiTaskInput } from "@/components/AiTaskInput";
import type { EntryItem, AreaType, HorizonType } from "@/types/database.types";
import {
  Briefcase,
  GraduationCap,
  Dumbbell,
  Wallet,
  User,
  LayoutDashboard,
  Calendar,
  Clock,
  Milestone,
  CheckCircle2,
  Circle,
  Trash2,
} from "lucide-react";

type Filter = "all" | "pending" | "completed";

const AREA_META: Record<
  AreaType | "all",
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    borderClass: string;
    bgClass: string;
  }
> = {
  all: {
    label: "Todas las Áreas",
    icon: LayoutDashboard,
    colorClass: "text-text-primary",
    borderClass: "border-border",
    bgClass: "bg-surface-subtle",
  },
  trabajo: {
    label: "Trabajo",
    icon: Briefcase,
    colorClass: "text-work",
    borderClass: "border-work/30",
    bgClass: "bg-work/10",
  },
  universidad: {
    label: "Universidad",
    icon: GraduationCap,
    colorClass: "text-university",
    borderClass: "border-university/30",
    bgClass: "bg-university/10",
  },
  gimnasio: {
    label: "Gimnasio",
    icon: Dumbbell,
    colorClass: "text-gym",
    borderClass: "border-gym/30",
    bgClass: "bg-gym/10",
  },
  cashea: {
    label: "Cashea / Finanzas",
    icon: Wallet,
    colorClass: "text-finance",
    borderClass: "border-finance/30",
    bgClass: "bg-finance/10",
  },
  personal: {
    label: "Personal & AI",
    icon: User,
    colorClass: "text-ai",
    borderClass: "border-ai/30",
    bgClass: "bg-ai/10",
  },
};

const HORIZON_LABELS: Record<
  HorizonType,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  hoy: { label: "Hoy", icon: Calendar },
  corto: { label: "Corto Plazo", icon: Clock },
  mediano: { label: "Mediano Plazo", icon: Milestone },
  largo: { label: "Largo Plazo", icon: Milestone },
};

export default function Home() {
  const [tasks, setTasks] = useState<EntryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros de navegación
  const [currentArea, setCurrentArea] = useState<AreaType | "all">("all");
  const [currentHorizon, setCurrentHorizon] = useState<HorizonType | "all">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<Filter>("all");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Formulario de creación
  const [inputTitle, setInputTitle] = useState("");
  const [inputArea, setInputArea] = useState<AreaType>("personal");
  const [inputHorizon, setInputHorizon] = useState<HorizonType>("hoy");

  // Cargar entradas desde Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabaseClient
        .from("entries")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error al obtener las tareas:", error.message);
      } else if (data) {
        setTasks(data);
      }
    };

    fetchTasks();
  }, []);

  // Crear entrada en Supabase
  const handleAddTask = async () => {
    if (!inputTitle.trim()) return;

    setLoading(true);

    const targetArea = currentArea === "all" ? inputArea : currentArea;
    const targetHorizon =
      currentHorizon === "all" ? inputHorizon : currentHorizon;

    const { data, error } = await supabaseClient
      .from("entries")
      .insert({
        title: inputTitle.trim(),
        area: targetArea,
        horizon: targetHorizon,
        content: [],
        is_completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error al agregar la nueva tarea:", error.message);
    } else if (data) {
      setTasks((prev) => [...prev, data]);
      setInputTitle("");
    }

    setLoading(false);
  };

  // Alternar completada/pendiente en Supabase
  const handleToggleTask = async (
    idToToggle: string,
    currentCompletedStatus: boolean,
  ) => {
    const newStatus = !currentCompletedStatus;

    // Actualización optimista
    setTasks((prev) =>
      prev.map((task) =>
        task.id === idToToggle ? { ...task, is_completed: newStatus } : task,
      ),
    );

    const { data, error } = await supabaseClient
      .from("entries")
      .update({ is_completed: newStatus })
      .eq("id", idToToggle)
      .select()
      .single();

    if (error) {
      console.error("Error al actualizar el estado:", error.message);
      // Revertir estado si falla
      setTasks((prev) =>
        prev.map((task) =>
          task.id === idToToggle
            ? { ...task, is_completed: currentCompletedStatus }
            : task,
        ),
      );
    } else if (data) {
      setTasks((prev) =>
        prev.map((task) => (task.id === idToToggle ? data : task)),
      );
    }
  };

  // Eliminar entrada en Supabase
  const handleDeleteTask = async (idToDelete: string) => {
    // Actualización optimista
    setTasks((prev) => prev.filter((task) => task.id !== idToDelete));

    const { error } = await supabaseClient
      .from("entries")
      .delete()
      .eq("id", idToDelete);

    if (error) {
      console.error("Hubo un error al eliminar la tarea:", error.message);
    }
  };

  // Filtrado bidimensional (Status + Área + Horizonte)
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filtro de estado
      if (statusFilter === "pending" && task.is_completed) return false;
      if (statusFilter === "completed" && !task.is_completed) return false;

      // Filtro de área
      if (currentArea !== "all" && task.area !== currentArea) return false;

      // Filtro de horizonte
      if (currentHorizon !== "all" && task.horizon !== currentHorizon)
        return false;

      return true;
    });
  }, [tasks, statusFilter, currentArea, currentHorizon]);

  const activeAreaMeta = AREA_META[currentArea];
  const ActiveAreaIcon = activeAreaMeta.icon;

  return (
    <div className="flex h-screen bg-canvas overflow-hidden text-text-primary font-sans">
      {/* Sidebar lateral */}
      <Sidebar
        currentArea={currentArea}
        onSelectArea={setCurrentArea}
        currentHorizon={currentHorizon}
        onSelectHorizon={setCurrentHorizon}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Área principal de contenido */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <div className="max-w-4xl w-full mx-auto p-6 md:p-8 space-y-6">
          {/* Header dinámico por Área */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border ${activeAreaMeta.bgClass} ${activeAreaMeta.borderClass}`}
              >
                <ActiveAreaIcon
                  className={`w-5 h-5 ${activeAreaMeta.colorClass}`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">
                    {activeAreaMeta.label}
                  </h1>
                  {currentHorizon !== "all" && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-subtle border border-border text-text-muted">
                      {HORIZON_LABELS[currentHorizon].label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  Second Brain & Espacio de Ejecución
                </p>
              </div>
            </div>

            {/* Filtros de estado */}
            <div className="flex gap-1 bg-surface p-1 rounded-lg border border-border text-xs text-text-muted">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`py-1.5 px-3 rounded-md transition cursor-pointer font-medium ${
                  statusFilter === "all"
                    ? "bg-surface-subtle text-text-primary shadow-xs"
                    : "hover:text-text-primary"
                }`}
              >
                Todas ({tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("pending")}
                className={`py-1.5 px-3 rounded-md transition cursor-pointer font-medium ${
                  statusFilter === "pending"
                    ? "bg-surface-subtle text-text-primary shadow-xs"
                    : "hover:text-text-primary"
                }`}
              >
                Pendientes ({tasks.filter((t) => !t.is_completed).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("completed")}
                className={`py-1.5 px-3 rounded-md transition cursor-pointer font-medium ${
                  statusFilter === "completed"
                    ? "bg-surface-subtle text-text-primary shadow-xs"
                    : "hover:text-text-primary"
                }`}
              >
                Completadas ({tasks.filter((t) => t.is_completed).length})
              </button>
            </div>
          </header>

          {/* Formulario de captura rápida Notion-like */}
          <section className="bg-surface border border-border p-5 rounded-2xl shadow-lg space-y-4 my-6">
            <AiTaskInput
              value={inputTitle}
              onChange={setInputTitle}
              category={currentArea === "all" ? inputArea : currentArea}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
              <div className="flex flex-wrap items-center gap-2">
                {/* Selector de Área si está en 'all' */}
                {currentArea === "all" && (
                  <select
                    value={inputArea}
                    onChange={(e) => setInputArea(e.target.value as AreaType)}
                    className="bg-surface-subtle border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-muted hover:text-text-primary focus:text-text-primary focus:outline-none focus:border-ai/50 cursor-pointer capitalize transition"
                  >
                    <option value="personal">Personal & AI</option>
                    <option value="trabajo">Trabajo</option>
                    <option value="universidad">Universidad</option>
                    <option value="gimnasio">Gimnasio</option>
                    <option value="cashea">Cashea</option>
                  </select>
                )}

                {/* Selector de Horizonte */}
                <select
                  value={
                    currentHorizon === "all" ? inputHorizon : currentHorizon
                  }
                  onChange={(e) =>
                    setInputHorizon(e.target.value as HorizonType)
                  }
                  disabled={currentHorizon !== "all"}
                  className="bg-surface-subtle border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-muted hover:text-text-primary focus:text-text-primary focus:outline-none focus:border-ai/50 cursor-pointer disabled:opacity-50 transition"
                >
                  <option value="hoy">Horizonte: Hoy</option>
                  <option value="corto">Horizonte: Corto Plazo</option>
                  <option value="mediano">Horizonte: Mediano Plazo</option>
                  <option value="largo">Horizonte: Largo Plazo</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddTask}
                disabled={loading || !inputTitle.trim()}
                className="bg-text-primary text-canvas font-semibold px-5 py-2 rounded-xl text-xs hover:opacity-90 transition cursor-pointer disabled:opacity-40"
              >
                {loading ? "Guardando..." : "Crear Entrada"}
              </button>
            </div>
          </section>

          {/* Lista de Entradas */}
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Entradas ({filteredTasks.length})
              </h2>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border bg-surface/40 space-y-1">
                <p className="text-sm text-text-primary font-medium">
                  No hay entradas en esta vista
                </p>
                <p className="text-xs text-text-muted">
                  Crea una nueva entrada usando el formulario superior o
                  selecciona otra área/horizonte en la barra lateral.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredTasks.map((task) => {
                  const areaInfo = AREA_META[task.area] || AREA_META.personal;
                  const horizonInfo =
                    HORIZON_LABELS[task.horizon] || HORIZON_LABELS.hoy;
                  const HorizonIcon = horizonInfo.icon;

                  return (
                    <li
                      key={task.id}
                      className="group flex items-center justify-between bg-surface border border-border hover:border-text-muted/30 p-3.5 rounded-xl transition shadow-xs"
                    >
                      <div
                        onClick={() =>
                          handleToggleTask(task.id, task.is_completed)
                        }
                        className="flex items-start sm:items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <button
                          type="button"
                          className="mt-0.5 sm:mt-0 text-text-muted hover:text-ai transition shrink-0"
                        >
                          {task.is_completed ? (
                            <CheckCircle2 className="w-4 h-4 text-university" />
                          ) : (
                            <Circle className="w-4 h-4 text-text-muted" />
                          )}
                        </button>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0">
                          <span
                            className={`text-sm transition truncate ${
                              task.is_completed
                                ? "line-through text-text-muted opacity-60"
                                : "text-text-primary font-medium"
                            }`}
                          >
                            {task.title}
                          </span>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Tag de Área */}
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${areaInfo.bgClass} ${areaInfo.borderClass} ${areaInfo.colorClass}`}
                            >
                              {areaInfo.label}
                            </span>

                            {/* Tag de Horizonte */}
                            <span className="flex items-center gap-1 text-[10px] text-text-muted bg-surface-subtle border border-border px-2 py-0.5 rounded-md">
                              <HorizonIcon className="w-3 h-3" />
                              <span>{horizonInfo.label}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        title="Eliminar entrada"
                        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-gym transition p-1.5 rounded-md hover:bg-gym/10 cursor-pointer ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
