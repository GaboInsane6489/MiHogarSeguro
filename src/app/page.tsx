"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabaseClient } from "@/lib/supabase";
import { Sidebar } from "@/components/Sidebar";
import { AiTaskInput } from "@/components/AiTaskInput";
import { EntryDetailDrawer } from "@/components/EntryDetailDrawer";
import { AuthModal } from "@/components/AuthModal";
import type { EntryItem, AreaType, HorizonType } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";
import {
  Briefcase,
  GraduationCap,
  Dumbbell,
  Wallet,
  User as UserIcon,
  LayoutDashboard,
  Calendar,
  Clock,
  Milestone,
  CheckCircle2,
  Circle,
  Trash2,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Edit3,
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
    label: "Todas las Areas",
    icon: LayoutDashboard,
    colorClass: "text-text-primary",
    borderClass: "border-border-subtle",
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
    icon: UserIcon,
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
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<EntryItem | null>(null);

  // Estado de Autenticacion
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Filtros de navegacion
  const [currentArea, setCurrentArea] = useState<AreaType | "all">("all");
  const [currentHorizon, setCurrentHorizon] = useState<HorizonType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Filter>("all");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Formulario de creacion
  const [inputTitle, setInputTitle] = useState("");
  const [inputArea, setInputArea] = useState<AreaType>("personal");
  const [inputHorizon, setInputHorizon] = useState<HorizonType>("hoy");

  // Escuchar cambios de Auth en Supabase
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar entradas desde Supabase
  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from("entries")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error al obtener las tareas:", error.message);
    } else if (data) {
      setTasks(data);
    }
    setLoadingTasks(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadEntries() {
      const { data, error } = await supabaseClient
        .from("entries")
        .select("*")
        .order("created_at", { ascending: true });

      if (isMounted) {
        if (error) {
          console.error("Error al obtener las tareas:", error.message);
        } else if (data) {
          setTasks(data);
        }
        setLoadingTasks(false);
      }
    }

    loadEntries();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Cerrar Sesion
  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
  };

  // Crear entrada en Supabase con vinculacion de user_id
  const handleAddTask = async () => {
    if (!inputTitle.trim()) return;

    setCreating(true);

    const targetArea = currentArea === "all" ? inputArea : currentArea;
    const targetHorizon = currentHorizon === "all" ? inputHorizon : currentHorizon;

    const { data, error } = await supabaseClient
      .from("entries")
      .insert({
        title: inputTitle.trim(),
        area: targetArea,
        horizon: targetHorizon,
        content: [],
        is_completed: false,
        user_id: user?.id || undefined,
      })
      .select()
      .single();

    if (error) {
      console.error("Error al agregar la nueva tarea:", error.message);
    } else if (data) {
      setTasks((prev) => [...prev, data]);
      setInputTitle("");
    }

    setCreating(false);
  };

  // Alternar completada/pendiente en Supabase
  const handleToggleTask = async (
    idToToggle: string,
    currentCompletedStatus: boolean,
  ) => {
    const newStatus = !currentCompletedStatus;

    // Actualizacion optimista
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

  // Actualizar entrada completa desde el Drawer
  const handleUpdateEntry = async (
    updatedData: Partial<EntryItem> & { id: string },
  ) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedData.id ? { ...t, ...updatedData } : t)),
    );

    if (selectedEntry && selectedEntry.id === updatedData.id) {
      setSelectedEntry((prev) => (prev ? { ...prev, ...updatedData } : null));
    }

    const { data, error } = await supabaseClient
      .from("entries")
      .update(updatedData)
      .eq("id", updatedData.id)
      .select()
      .single();

    if (error) {
      console.error("Error al actualizar la entrada:", error.message);
    } else if (data) {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedData.id ? data : t)),
      );
    }
  };

  // Eliminar entrada en Supabase
  const handleDeleteTask = async (idToDelete: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== idToDelete));
    if (selectedEntry?.id === idToDelete) {
      setSelectedEntry(null);
    }

    const { error } = await supabaseClient
      .from("entries")
      .delete()
      .eq("id", idToDelete);

    if (error) {
      console.error("Hubo un error al eliminar la tarea:", error.message);
    }
  };

  // Filtrado bidimensional
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter === "pending" && task.is_completed) return false;
      if (statusFilter === "completed" && !task.is_completed) return false;
      if (currentArea !== "all" && task.area !== currentArea) return false;
      if (currentHorizon !== "all" && task.horizon !== currentHorizon) return false;
      return true;
    });
  }, [tasks, statusFilter, currentArea, currentHorizon]);

  // Metricas de ejecucion del dia (Horizonte 'hoy')
  const todayTasks = useMemo(() => tasks.filter((t) => t.horizon === "hoy"), [tasks]);
  const todayCompleted = useMemo(() => todayTasks.filter((t) => t.is_completed).length, [todayTasks]);
  const todayProgressPercent = todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;

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
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Area Principal de Contenido */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <div className="max-w-4xl w-full mx-auto p-6 md:p-8 space-y-6">
          {/* Header Superior con Metricas de Rendimiento Linear-style */}
          <header className="space-y-4 pb-5 border-b border-border-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${activeAreaMeta.bgClass} ${activeAreaMeta.borderClass}`}
                >
                  <ActiveAreaIcon className={`w-5 h-5 ${activeAreaMeta.colorClass}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">
                      {activeAreaMeta.label}
                    </h1>
                    {currentHorizon !== "all" && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-subtle border border-border-subtle text-text-muted">
                        {HORIZON_LABELS[currentHorizon].label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    Second Brain & Espacio de Ejecucion Diaria
                  </p>
                </div>
              </div>

              {/* Filtros de estado */}
              <div className="flex gap-1 bg-surface p-1 rounded-xl border border-border-subtle text-xs text-text-muted">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`py-1.5 px-3 rounded-lg transition cursor-pointer font-medium ${
                    statusFilter === "all"
                      ? "bg-surface-subtle text-text-primary shadow-xs font-semibold"
                      : "hover:text-text-primary"
                  }`}
                >
                  Todas ({tasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("pending")}
                  className={`py-1.5 px-3 rounded-lg transition cursor-pointer font-medium ${
                    statusFilter === "pending"
                      ? "bg-surface-subtle text-text-primary shadow-xs font-semibold"
                      : "hover:text-text-primary"
                  }`}
                >
                  Pendientes ({tasks.filter((t) => !t.is_completed).length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("completed")}
                  className={`py-1.5 px-3 rounded-lg transition cursor-pointer font-medium ${
                    statusFilter === "completed"
                      ? "bg-surface-subtle text-text-primary shadow-xs font-semibold"
                      : "hover:text-text-primary"
                  }`}
                >
                  Completadas ({tasks.filter((t) => t.is_completed).length})
                </button>
              </div>
            </div>

            {/* Barra de Progreso del Dia */}
            <div className="bg-surface/60 border border-border-subtle p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-ai" />
                  <span className="font-semibold text-text-primary">
                    Progreso de Hoy
                  </span>
                  <span className="text-[11px] text-text-muted">
                    ({todayCompleted}/{todayTasks.length} completadas)
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-ai">
                  {todayProgressPercent}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-ai via-work to-university transition-all duration-500 rounded-full"
                  style={{ width: `${todayProgressPercent}%` }}
                />
              </div>
            </div>
          </header>

          {/* Formulario de Captura Rapida Linear-Style */}
          <section className="w-full flex flex-col gap-4 bg-surface border border-border-subtle p-5 rounded-2xl shadow-xl">
            <div className="w-full">
              <AiTaskInput
                value={inputTitle}
                onChange={setInputTitle}
                category={currentArea === "all" ? inputArea : currentArea}
              />
            </div>

            <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-subtle/50">
              <div className="flex flex-wrap items-center gap-2">
                {/* Selector de Area si esta en 'all' */}
                {currentArea === "all" && (
                  <select
                    value={inputArea}
                    onChange={(e) => setInputArea(e.target.value as AreaType)}
                    className="bg-surface-subtle border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-ai cursor-pointer capitalize transition-colors"
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
                  value={currentHorizon === "all" ? inputHorizon : currentHorizon}
                  onChange={(e) => setInputHorizon(e.target.value as HorizonType)}
                  disabled={currentHorizon !== "all"}
                  className="bg-surface-subtle border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-ai cursor-pointer disabled:opacity-50 transition-colors"
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
                disabled={creating || !inputTitle.trim()}
                className="bg-text-primary text-canvas font-semibold px-5 py-2 rounded-xl text-xs hover:opacity-90 active:scale-95 transition cursor-pointer disabled:opacity-40"
              >
                {creating ? "Guardando..." : "Crear Entrada"}
              </button>
            </div>
          </section>

          {/* Lista de Entradas con Animaciones y Hover Actions */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">
                Entradas ({filteredTasks.length})
              </h2>
            </div>

            {loadingTasks ? (
              // Skeleton Loaders
              <div className="space-y-2.5">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-14 rounded-xl bg-surface border border-border-subtle animate-pulse"
                  />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              // Empty State
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border-subtle bg-surface/30 space-y-2">
                <div className="w-10 h-10 rounded-full bg-surface-subtle border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-sm text-text-primary font-medium">
                  No hay entradas en esta vista
                </p>
                <p className="text-xs text-text-muted">
                  Crea una nueva entrada usando el formulario superior o selecciona otra area en la barra lateral.
                </p>
              </div>
            ) : (
              // Task Rows
              <ul className="space-y-2">
                {filteredTasks.map((task) => {
                  const areaInfo = AREA_META[task.area] || AREA_META.personal;
                  const horizonInfo = HORIZON_LABELS[task.horizon] || HORIZON_LABELS.hoy;
                  const HorizonIcon = horizonInfo.icon;

                  return (
                    <li
                      key={task.id}
                      className="group flex items-center justify-between bg-surface border border-border-subtle hover:border-white/15 hover:bg-surface-subtle/30 p-3.5 rounded-xl transition-all duration-150 shadow-xs"
                    >
                      <div
                        onClick={() => setSelectedEntry(task)}
                        className="flex items-start sm:items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTask(task.id, task.is_completed);
                          }}
                          className="mt-0.5 sm:mt-0 text-text-muted hover:text-ai transition shrink-0 cursor-pointer"
                        >
                          {task.is_completed ? (
                            <CheckCircle2 className="w-4 h-4 text-university" />
                          ) : (
                            <Circle className="w-4 h-4 text-text-muted hover:text-text-primary" />
                          )}
                        </button>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
                          <span
                            className={`text-xs sm:text-sm transition truncate ${
                              task.is_completed
                                ? "line-through text-text-muted opacity-50"
                                : "text-text-primary font-medium"
                            }`}
                          >
                            {task.title}
                          </span>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Tag de Area */}
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${areaInfo.bgClass} ${areaInfo.borderClass} ${areaInfo.colorClass}`}
                            >
                              {areaInfo.label}
                            </span>

                            {/* Tag de Horizonte */}
                            <span className="flex items-center gap-1 text-[10px] text-text-muted bg-surface-subtle border border-border-subtle px-2 py-0.5 rounded-md font-mono">
                              <HorizonIcon className="w-3 h-3" />
                              <span>{horizonInfo.label}</span>
                            </span>

                            {/* Indicador de Bloques AI */}
                            {task.content && task.content.length > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-ai bg-ai/10 border border-ai/20 px-1.5 py-0.5 rounded-md">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>{task.content.length}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions on Hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <button
                          type="button"
                          onClick={() => setSelectedEntry(task)}
                          title="Editar detalles"
                          className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-subtle transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          title="Eliminar entrada"
                          className="text-text-muted hover:text-gym p-1.5 rounded-lg hover:bg-gym/10 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </main>

      {/* Modal de Autenticacion Supabase */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          fetchTasks();
        }}
      />

      {/* Drawer lateral de detalles */}
      <EntryDetailDrawer
        entry={selectedEntry}
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onUpdate={handleUpdateEntry}
      />
    </div>
  );
}
