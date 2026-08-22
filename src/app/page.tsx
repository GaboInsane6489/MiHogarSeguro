"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase";
import { Sidebar } from "@/components/Sidebar";
import { AiTaskInput } from "@/components/AiTaskInput";
import { EntryDetailDrawer } from "@/components/EntryDetailDrawer";
import { AuthModal } from "@/components/AuthModal";
import { BrandLogo } from "@/components/BrandLogo";
import { ProfileSettingsModal } from "@/components/ProfileSettingsModal";
import { SecondBrainChatDrawer } from "@/components/SecondBrainChatDrawer";
import type {
  EntryItem,
  AreaType,
  HorizonType,
  UserProfile,
} from "@/types/database.types";
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
  Plus,
  Loader2,
  Paperclip,
  Flag,
  Menu,
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
    colorClass: "text-zinc-100",
    borderClass: "border-white/10",
    bgClass: "bg-zinc-800",
  },
  trabajo: {
    label: "Trabajo",
    icon: Briefcase,
    colorClass: "text-sky-400",
    borderClass: "border-sky-500/30",
    bgClass: "bg-sky-500/10",
  },
  universidad: {
    label: "Universidad",
    icon: GraduationCap,
    colorClass: "text-emerald-400",
    borderClass: "border-emerald-500/30",
    bgClass: "bg-emerald-500/10",
  },
  gimnasio: {
    label: "Gimnasio",
    icon: Dumbbell,
    colorClass: "text-rose-400",
    borderClass: "border-rose-500/30",
    bgClass: "bg-rose-500/10",
  },
  cashea: {
    label: "Cashea / Finanzas",
    icon: Wallet,
    colorClass: "text-amber-400",
    borderClass: "border-amber-500/30",
    bgClass: "bg-amber-500/10",
  },
  personal: {
    label: "Personal & AI",
    icon: UserIcon,
    colorClass: "text-indigo-400",
    borderClass: "border-indigo-500/30",
    bgClass: "bg-indigo-500/10",
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
  const router = useRouter();
  const [tasks, setTasks] = useState<EntryItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<EntryItem | null>(null);

  // Estado de Autenticacion y Auth Gate
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Filtros de navegacion
  const [currentArea, setCurrentArea] = useState<AreaType | "all">("all");
  const [currentHorizon, setCurrentHorizon] = useState<HorizonType | "all">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<Filter>("all");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Formulario de creacion
  const [inputTitle, setInputTitle] = useState("");
  const [inputArea, setInputArea] = useState<AreaType>("personal");
  const [inputHorizon, setInputHorizon] = useState<HorizonType>("hoy");

  // Auth Gate: Verificar sesion activa y redirigir si no existe
  useEffect(() => {
    let isMounted = true;

    async function checkAuthSession() {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!isMounted) return;

      if (!session?.user) {
        setUser(null);
        setLoadingSession(false);
        router.push("/login");
      } else {
        setUser(session.user);
        setLoadingSession(false);

        // Cargar perfil
        const { data: profileData } = await supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileData && isMounted) {
          setProfile(profileData as UserProfile);
        }
      }
    }

    checkAuthSession();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (!session?.user) {
        setUser(null);
        setProfile(null);
        router.push("/login");
      } else {
        setUser(session.user);
        const { data: profileData } = await supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (profileData && isMounted) {
          setProfile(profileData as UserProfile);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // Cargar entradas desde Supabase para el usuario activo
  const fetchTasks = useCallback(async () => {
    if (!user) return;
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
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    async function loadEntries() {
      if (!user) return;

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

    if (user) {
      loadEntries();
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Cerrar Sesion
  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push("/login");
  };

  // Crear entrada en Supabase con vinculacion estricta de user_id
  const handleAddTask = async () => {
    if (!inputTitle.trim() || !user) return;

    setCreating(true);

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
        user_id: user.id,
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
      setTasks((prev) => prev.map((t) => (t.id === updatedData.id ? data : t)));
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
      if (currentHorizon !== "all" && task.horizon !== currentHorizon)
        return false;
      return true;
    });
  }, [tasks, statusFilter, currentArea, currentHorizon]);

  // Metricas de ejecucion del dia
  const todayTasks = useMemo(
    () => tasks.filter((t) => t.horizon === "hoy"),
    [tasks],
  );
  const todayCompleted = useMemo(
    () => todayTasks.filter((t) => t.is_completed).length,
    [todayTasks],
  );
  const todayProgressPercent =
    todayTasks.length > 0
      ? Math.round((todayCompleted / todayTasks.length) * 100)
      : 0;

  // Conteo de tareas pendientes por area
  const taskCounts = useMemo(() => {
    const counts: Record<AreaType | "all", number> = {
      all: tasks.filter((t) => !t.is_completed).length,
      trabajo: tasks.filter((t) => t.area === "trabajo" && !t.is_completed)
        .length,
      universidad: tasks.filter(
        (t) => t.area === "universidad" && !t.is_completed,
      ).length,
      gimnasio: tasks.filter((t) => t.area === "gimnasio" && !t.is_completed)
        .length,
      cashea: tasks.filter((t) => t.area === "cashea" && !t.is_completed)
        .length,
      personal: tasks.filter((t) => t.area === "personal" && !t.is_completed)
        .length,
    };
    return counts;
  }, [tasks]);

  const activeAreaMeta = AREA_META[currentArea];
  const ActiveAreaIcon = activeAreaMeta.icon;

  // Pantalla de carga / Auth Gate
  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
        </div>
        <p className="text-xs font-mono text-zinc-400 tracking-wider">
          Verificando sesion de usuario...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative flex h-screen bg-[#090d16] overflow-hidden text-zinc-100 font-sans">
      {/* Fondo de Pantalla Fijo Personalizado */}
      {profile?.banner_url && (
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage: `url(${profile.banner_url})`,
          }}
        >
          {/* Velo de contraste oscuro para legibilidad sin distorsionar la imagen */}
          <div className="absolute inset-0 bg-black/45 backdrop-brightness-75" />
        </div>
      )}

      {/* Sidebar lateral */}
      <Sidebar
        currentArea={currentArea}
        onSelectArea={setCurrentArea}
        currentHorizon={currentHorizon}
        onSelectHorizon={setCurrentHorizon}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        user={user}
        profile={profile}
        taskCounts={taskCounts}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileDrawerOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onLogout={handleLogout}
      />

      {/* Viewport Principal Desacoplado con Contencion Centrada */}
      <main className="relative z-10 flex-1 overflow-y-auto flex flex-col">
        {/* Mobile Top Header (Exclusivo para móviles < md) */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0d1117]/95 backdrop-blur-xl border-b border-white/10 z-20 sticky top-0 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              title="Abrir menú de navegación"
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <BrandLogo size={18} />
              <span className="text-xs font-bold text-white tracking-tight">
                Second Brain
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile?.avatar_url ? (
              <button
                type="button"
                onClick={() => setIsProfileDrawerOpen(true)}
                title="Configuración de perfil"
                className="w-8 h-8 rounded-xl overflow-hidden border border-white/15 cursor-pointer shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsProfileDrawerOpen(true)}
                title="Configuración de perfil"
                className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-400 font-mono cursor-pointer"
              >
                {(profile?.full_name || user.email || "U")
                  .substring(0, 2)
                  .toUpperCase()}
              </button>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 md:px-12 py-6 sm:py-8 min-h-screen flex flex-col justify-start space-y-5 sm:space-y-6">
          {/* Header Superior y Metricas */}
          <header className="p-5 rounded-2xl bg-[#0d1117]/90 backdrop-blur-xl border border-white/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                      {activeAreaMeta.label}
                    </h1>
                    {currentHorizon !== "all" && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-800 border border-white/10 text-zinc-400">
                        {HORIZON_LABELS[currentHorizon].label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Second Brain & Espacio de Ejecucion Diaria
                  </p>
                </div>
              </div>

              {/* Filtros de estado */}
              <div className="grid grid-cols-3 sm:flex gap-1 bg-[#161b22] p-1 rounded-xl border border-white/10 text-xs text-zinc-400 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`py-1.5 px-2 sm:px-3 text-center truncate rounded-lg transition cursor-pointer font-medium ${
                    statusFilter === "all"
                      ? "bg-zinc-800 text-white shadow-xs font-semibold"
                      : "hover:text-white"
                  }`}
                >
                  Todas ({tasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("pending")}
                  className={`py-1.5 px-2 sm:px-3 text-center truncate rounded-lg transition cursor-pointer font-medium ${
                    statusFilter === "pending"
                      ? "bg-zinc-800 text-white shadow-xs font-semibold"
                      : "hover:text-white"
                  }`}
                >
                  Pendientes ({tasks.filter((t) => !t.is_completed).length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("completed")}
                  className={`py-1.5 px-2 sm:px-3 text-center truncate rounded-lg transition cursor-pointer font-medium ${
                    statusFilter === "completed"
                      ? "bg-zinc-800 text-white shadow-xs font-semibold"
                      : "hover:text-white"
                  }`}
                >
                  Completadas ({tasks.filter((t) => t.is_completed).length})
                </button>
              </div>
            </div>

            {/* Barra de Progreso del Dia */}
            <div className="p-4 rounded-xl border border-white/10 bg-[#161b22]/60 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-white">
                    Progreso de Hoy
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    ({todayCompleted}/{todayTasks.length} completadas)
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-indigo-400">
                  {todayProgressPercent}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${todayProgressPercent}%` }}
                />
              </div>
            </div>
          </header>

          {/* Formulario de Captura Rapida */}
          <section className="w-full bg-[#0d1117]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl focus-within:border-indigo-500/60 transition-all">
            <AiTaskInput
              value={inputTitle}
              onChange={setInputTitle}
              category={currentArea === "all" ? inputArea : currentArea}
              aiContext={profile?.ai_context}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-3 pt-2 border-t border-white/5">
              <div className="flex flex-wrap items-center gap-2">
                {/* Selector de Area si esta en 'all' */}
                {currentArea === "all" && (
                  <select
                    value={inputArea}
                    onChange={(e) => setInputArea(e.target.value as AreaType)}
                    className="h-8 px-2.5 text-xs bg-zinc-800 text-zinc-300 border border-white/10 rounded-md focus:outline-none cursor-pointer capitalize"
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
                  className="h-8 px-2.5 text-xs bg-zinc-800 text-zinc-300 border border-white/10 rounded-md focus:outline-none cursor-pointer disabled:opacity-50"
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
                className="w-full sm:w-auto h-8 px-4 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 rounded-md shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{creating ? "Guardando..." : "Crear Entrada"}</span>
              </button>
            </div>
          </section>

          {/* Lista de Tareas (space-y-2.5) */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-1 mb-2">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
                Entradas ({filteredTasks.length})
              </h2>
            </div>

            {loadingTasks ? (
              // Skeleton Loaders
              <div className="space-y-2.5">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-14 rounded-xl bg-[#161b22] border border-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              // Empty State
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-white/10 bg-[#161b22]/30 space-y-2">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-sm text-zinc-200 font-medium">
                  No hay entradas en esta vista
                </p>
                <p className="text-xs text-zinc-500">
                  Crea una nueva entrada usando el formulario superior o
                  selecciona otra area en la barra lateral.
                </p>
              </div>
            ) : (
              // Task Rows
              <div className="space-y-2">
                {filteredTasks.map((task) => {
                  const areaInfo = AREA_META[task.area] || AREA_META.personal;
                  const horizonInfo =
                    HORIZON_LABELS[task.horizon] || HORIZON_LABELS.hoy;
                  const HorizonIcon = horizonInfo.icon;

                  const totalTodos = task.content
                    ? task.content.filter((b) => b.type === "todo").length
                    : 0;
                  const completedTodos = task.content
                    ? task.content.filter(
                        (b) => b.type === "todo" && b.metadata?.is_completed,
                      ).length
                    : 0;

                  const areaBorderAccent =
                    task.area === "trabajo"
                      ? "border-l-sky-400"
                      : task.area === "universidad"
                        ? "border-l-emerald-400"
                        : task.area === "gimnasio"
                          ? "border-l-rose-400"
                          : task.area === "cashea"
                            ? "border-l-amber-400"
                            : "border-l-indigo-400";

                  return (
                    <div
                      key={task.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-[#0d1117]/95 hover:bg-[#161b22] border border-white/10 hover:border-white/25 border-l-4 ${areaBorderAccent} transition-all hover:translate-x-0.5 group shadow-lg`}
                    >
                      <div
                        onClick={() => setSelectedEntry(task)}
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTask(task.id, task.is_completed);
                          }}
                          className="text-zinc-500 hover:text-indigo-400 transition shrink-0 cursor-pointer"
                        >
                          {task.is_completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
                          )}
                        </button>

                        <span
                          className={`text-xs sm:text-sm font-medium transition truncate ${
                            task.is_completed
                              ? "line-through text-zinc-500 opacity-60"
                              : "text-zinc-100"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      {/* Badges y Acciones Rapidas */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 sm:ml-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 sm:border-transparent">
                        {/* Tag de Area */}
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${areaInfo.bgClass} ${areaInfo.borderClass} ${areaInfo.colorClass}`}
                        >
                          {areaInfo.label}
                        </span>

                        {/* Tag de Horizonte */}
                        <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-800/80 border border-white/10 px-2 py-0.5 rounded-md font-mono">
                          <HorizonIcon className="w-3 h-3" />
                          <span>{horizonInfo.label}</span>
                        </span>

                        {/* Badge de Prioridad */}
                        {task.priority && task.priority !== "media" && (
                          <span
                            className={`flex items-center gap-1 text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-md border ${
                              task.priority === "urgente"
                                ? "text-rose-400 border-rose-500/40 bg-rose-500/15 font-bold"
                                : task.priority === "alta"
                                  ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                                  : "text-zinc-500 border-white/5 bg-zinc-800/40"
                            }`}
                          >
                            <Flag className="w-2.5 h-2.5" />
                            <span>{task.priority}</span>
                          </span>
                        )}

                        {/* Badge de Fecha Limite (due_date) */}
                        {task.due_date &&
                          (() => {
                            const due = new Date(task.due_date);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const dueOnly = new Date(due);
                            dueOnly.setHours(0, 0, 0, 0);
                            const diffDays = Math.ceil(
                              (dueOnly.getTime() - today.getTime()) /
                                (1000 * 60 * 60 * 24),
                            );

                            const isOverdue =
                              diffDays < 0 && !task.is_completed;
                            const isDueToday = diffDays === 0;

                            const label = isOverdue
                              ? "Vencida"
                              : isDueToday
                                ? "Vence Hoy"
                                : due.toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                  });

                            return (
                              <span
                                className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border font-mono ${
                                  isOverdue
                                    ? "text-rose-400 border-rose-500/40 bg-rose-500/15 font-semibold"
                                    : isDueToday
                                      ? "text-amber-400 border-amber-500/40 bg-amber-500/15 font-medium"
                                      : "text-zinc-400 border-white/10 bg-zinc-800/60"
                                }`}
                              >
                                <Calendar className="w-2.5 h-2.5" />
                                <span>{label}</span>
                              </span>
                            );
                          })()}

                        {/* Indicador de Subtareas */}
                        {totalTodos > 0 && (
                          <span
                            className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${
                              completedTodos === totalTodos
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                                : "bg-white/5 border-white/10 text-zinc-400"
                            }`}
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>
                              {completedTodos}/{totalTodos}
                            </span>
                          </span>
                        )}

                        {/* Indicador de Adjuntos de Archivos */}
                        {task.content &&
                          task.content.some((b) => b.type === "file") && (
                            <span className="flex items-center gap-1 text-[10px] text-zinc-300 bg-zinc-800/90 border border-white/10 px-1.5 py-0.5 rounded-md">
                              <Paperclip className="w-2.5 h-2.5 text-indigo-400" />
                              <span>
                                {
                                  task.content.filter((b) => b.type === "file")
                                    .length
                                }
                              </span>
                            </span>
                          )}

                        {/* Indicador de Bloques AI */}
                        {task.content && task.content.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-md">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{task.content.length}</span>
                          </span>
                        )}

                        {/* Botones de Accion */}
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity ml-auto sm:ml-0">
                          <button
                            type="button"
                            onClick={() => setSelectedEntry(task)}
                            title="Editar detalles"
                            className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition cursor-pointer"
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
                            className="text-zinc-400 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modal de Autenticacion */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          fetchTasks();
        }}
      />

      {/* Modal de Ajustes de Perfil & Contexto de IA */}
      <ProfileSettingsModal
        key={`profile-modal-${profile?.updated_at || profile?.id || "default"}`}
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        user={user}
        profile={profile}
        onProfileUpdated={(updatedProfile) => {
          setProfile(updatedProfile);
        }}
      />

      {/* Boton Flotante de Acceso a Copiloto AI */}
      <button
        type="button"
        onClick={() => setIsChatOpen(true)}
        title="Abrir Copiloto AI"
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#0d1117]/95 hover:bg-[#161b22] text-zinc-100 hover:text-white text-xs font-semibold shadow-2xl hover:shadow-indigo-500/25 border border-white/15 hover:border-indigo-500/50 backdrop-blur-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group"
      >
        <div className="relative flex items-center justify-center">
          <BrandLogo
            size={18}
            className="transition-transform group-hover:rotate-6"
          />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0d1117] animate-pulse" />
        </div>
        <span className="tracking-wide">Copiloto AI</span>
        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400 group-hover:text-indigo-300">
          Chat
        </span>
      </button>

      {/* Drawer de Chat con el Second Brain */}
      <SecondBrainChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        tasks={tasks}
        aiContext={profile?.ai_context}
        onAddTask={async (taskData) => {
          if (!user) return;
          const { data, error } = await supabaseClient
            .from("entries")
            .insert({
              title: taskData.title,
              area: taskData.area,
              horizon: taskData.horizon,
              priority: taskData.priority || "media",
              content: [],
              is_completed: false,
              user_id: user.id,
            })
            .select()
            .single();

          if (error) {
            console.error("Error al crear tarea desde chat:", error.message);
          } else if (data) {
            setTasks((prev) => [...prev, data]);
          }
        }}
      />

      {/* Modal centralizado de detalles */}
      <EntryDetailDrawer
        entry={selectedEntry}
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        aiContext={profile?.ai_context}
        onUpdate={handleUpdateEntry}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
