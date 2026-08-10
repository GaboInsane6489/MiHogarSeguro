"use client";
import { useState, useEffect, useMemo } from "react";
import { supabaseClient } from "@/lib/supabase";
import { AiTaskInput } from "@/components/AiTaskInput";

export interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  created_at?: string;
}

type Filter = "all" | "pending" | "completed";

export default function Home() {
  const [inputTitle, setInputTitle] = useState("");
  const [selectCategory, setSelectCategory] = useState("General");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  // Cargar tareas desde Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabaseClient
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error al obtener las tareas:", error.message);
      } else if (data) {
        setTasks(data as Task[]);
      }
    };

    fetchTasks();
  }, []);

  // Crear tarea en Supabase
  const handleAddTask = async () => {
    if (!inputTitle.trim()) return;

    setLoading(true);

    const { data, error } = await supabaseClient
      .from("tasks")
      .insert([
        {
          title: inputTitle,
          category: selectCategory,
          completed: false,
        },
      ])
      .select();

    if (error) {
      console.error("Error al agregar la nueva tarea:", error.message);
    } else if (data) {
      setTasks((prev) => [...prev, data[0] as Task]);
      setInputTitle("");
      setSelectCategory("General");
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
        task.id === idToToggle ? { ...task, completed: newStatus } : task,
      ),
    );

    const { data, error } = await supabaseClient
      .from("tasks")
      .update({ completed: newStatus })
      .eq("id", idToToggle)
      .select();

    if (error) {
      console.error("Error al actualizar el estado:", error.message);
      // Revertir estado si falla
      setTasks((prev) =>
        prev.map((task) =>
          task.id === idToToggle
            ? { ...task, completed: currentCompletedStatus }
            : task,
        ),
      );
    } else if (data) {
      setTasks((prev) =>
        prev.map((task) => (task.id === idToToggle ? (data[0] as Task) : task)),
      );
    }
  };

  // Eliminar tarea en Supabase
  const handleDeleteTask = async (idToDelete: string) => {
    // Actualización optimista
    setTasks((prev) => prev.filter((task) => task.id !== idToDelete));

    const { error } = await supabaseClient
      .from("tasks")
      .delete()
      .eq("id", idToDelete);

    if (error) {
      console.error(
        " Oye bro, hubo un pequeño error al eliminar la tarea:",
        error.message,
      );
    }
  };

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case "all":
        return tasks;
      case "pending":
        return tasks.filter((task) => !task.completed);
      case "completed":
        return tasks.filter((task) => task.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  return (
    <div className="bg-neutral-950 text-neutral-100 min-h-screen flex justify-center items-start pt-6 p-4 font-sans">
      <main className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl w-full max-w-lg space-y-6 shadow-2xl">
        <header className="border-b border-neutral-800 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">
            Mi Espacio Seguro De Trabajo
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Mi Gestor Personal Diario
          </p>
        </header>

        {/* Formulario de Entrada */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <AiTaskInput
            value={inputTitle}
            onChange={setInputTitle}
            category={selectCategory}
          />
          <select
            value={selectCategory}
            onChange={(e) => setSelectCategory(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-neutral-600 cursor-pointer shrink-0"
          >
            <option value="General">General</option>
            <option value="Trabajo">Trabajo</option>
            <option value="Personal">Personal</option>
            <option value="Estudios">Estudios</option>
          </select>
          <button
            onClick={handleAddTask}
            disabled={loading}
            className="bg-neutral-100 text-neutral-900 font-medium px-4 py-2 rounded-lg text-sm hover:bg-neutral-300 active:scale-95 transition cursor-pointer disabled:opacity-50 shrink-0"
          >
            {loading ? "Guardando..." : "Agregar"}
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs text-neutral-400 my-4">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`flex-1 py-1.5 px-3 rounded-md transition cursor-pointer font-medium ${
              filter === "all"
                ? "bg-neutral-800 text-neutral-100"
                : "hover:text-neutral-200"
            }`}
          >
            Todas ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={`flex-1 py-1.5 px-3 rounded-md transition cursor-pointer font-medium ${
              filter === "pending"
                ? "bg-neutral-800 text-neutral-100"
                : "hover:text-neutral-200"
            }`}
          >
            Pendientes ({tasks.filter((t) => !t.completed).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={`flex-1 py-1.5 px-3 rounded-md transition cursor-pointer font-medium ${
              filter === "completed"
                ? "bg-neutral-800 text-neutral-100"
                : "hover:text-neutral-200"
            }`}
          >
            Completadas ({tasks.filter((t) => t.completed).length})
          </button>
        </div>

        {/* Lista de Tareas */}
        <ul className="space-y-2">
          {filteredTasks.length === 0 ? (
            <li className="text-xs text-neutral-500 text-center py-6 italic border border-dashed border-neutral-800 rounded-lg">
              No hay tareas registradas en esta sección.
            </li>
          ) : (
            filteredTasks.map((task) => (
              <li
                key={task.id}
                className="flex justify-between items-center bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/80 hover:border-neutral-700 transition"
              >
                <div
                  onClick={() => handleToggleTask(task.id, task.completed)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    readOnly
                    className="rounded border-neutral-700 bg-neutral-900 accent-neutral-200 w-4 h-4 cursor-pointer"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={`text-sm font-medium transition ${
                        task.completed
                          ? "line-through text-neutral-500"
                          : "text-neutral-200"
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      {task.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-xs text-red-400 hover:text-red-300 transition px-2 py-1 rounded bg-red-950/30 border border-red-900/40 cursor-pointer ml-2"
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
