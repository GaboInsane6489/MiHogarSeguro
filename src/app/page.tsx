"use client";
import { useState, useEffect, useMemo } from "react";
import { supabaseClient } from "@/lib/supabase";
import { AiTaskInput } from "@/components/AiTaskInput";
import type { EntryItem, AreaType } from "@/types/database.types";

type Filter = "all" | "pending" | "completed";

export default function Home() {
  const [inputTitle, setInputTitle] = useState("");
  const [selectArea, setSelectArea] = useState<AreaType>("personal");
  const [tasks, setTasks] = useState<EntryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

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

    const { data, error } = await supabaseClient
      .from("entries")
      .insert({
        title: inputTitle.trim(),
        area: selectArea,
        horizon: "hoy",
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
      setSelectArea("personal");
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

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case "all":
        return tasks;
      case "pending":
        return tasks.filter((task) => !task.is_completed);
      case "completed":
        return tasks.filter((task) => task.is_completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  return (
    <div className="bg-canvas text-text-primary min-h-screen flex justify-center items-start pt-6 p-4 font-sans">
      <main className="bg-surface border border-border p-6 rounded-xl w-full max-w-lg space-y-6 shadow-2xl">
        <header className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Mi Espacio Seguro De Trabajo
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Second Brain & Gestor Diario
          </p>
        </header>

        {/* Formulario de Entrada */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <AiTaskInput
            value={inputTitle}
            onChange={setInputTitle}
            category={selectArea}
          />
          <select
            value={selectArea}
            onChange={(e) => setSelectArea(e.target.value as AreaType)}
            className="bg-surface-subtle border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-ai cursor-pointer shrink-0 capitalize"
          >
            <option value="personal">Personal</option>
            <option value="trabajo">Trabajo</option>
            <option value="universidad">Universidad</option>
            <option value="gimnasio">Gimnasio</option>
            <option value="cashea">Cashea</option>
          </select>
          <button
            onClick={handleAddTask}
            disabled={loading}
            className="bg-text-primary text-canvas font-medium px-4 py-2 rounded-lg text-sm hover:opacity-90 active:scale-95 transition cursor-pointer disabled:opacity-50 shrink-0"
          >
            {loading ? "Guardando..." : "Agregar"}
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-1 bg-surface-subtle p-1 rounded-lg border border-border text-xs text-text-muted my-4">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`flex-1 py-1.5 px-3 rounded-md transition cursor-pointer font-medium ${
              filter === "all"
                ? "bg-surface text-text-primary"
                : "hover:text-text-primary"
            }`}
          >
            Todas ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={`flex-1 py-1.5 px-3 rounded-md transition cursor-pointer font-medium ${
              filter === "pending"
                ? "bg-surface text-text-primary"
                : "hover:text-text-primary"
            }`}
          >
            Pendientes ({tasks.filter((t) => !t.is_completed).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={`flex-1 py-1.5 px-3 rounded-md transition cursor-pointer font-medium ${
              filter === "completed"
                ? "bg-surface text-text-primary"
                : "hover:text-text-primary"
            }`}
          >
            Completadas ({tasks.filter((t) => t.is_completed).length})
          </button>
        </div>

        {/* Lista de Tareas */}
        <ul className="space-y-2">
          {filteredTasks.length === 0 ? (
            <li className="text-xs text-text-muted text-center py-6 italic border border-dashed border-border rounded-lg">
              No hay tareas registradas en esta sección.
            </li>
          ) : (
            filteredTasks.map((task) => (
              <li
                key={task.id}
                className="flex justify-between items-center bg-surface-subtle p-3 rounded-lg border border-border hover:border-text-muted/30 transition"
              >
                <div
                  onClick={() => handleToggleTask(task.id, task.is_completed)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <input
                    type="checkbox"
                    checked={task.is_completed}
                    readOnly
                    className="rounded border-border bg-surface accent-ai w-4 h-4 cursor-pointer"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={`text-sm font-medium transition ${
                        task.is_completed
                          ? "line-through text-text-muted opacity-60"
                          : "text-text-primary"
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">
                      {task.area}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-xs text-gym hover:opacity-80 transition px-2 py-1 rounded bg-gym/10 border border-gym/20 cursor-pointer ml-2"
                >
                  Eliminar
                </button>
              </li>
            ))
          )}
        </ul>
      </main>
    </div>
  );
}
