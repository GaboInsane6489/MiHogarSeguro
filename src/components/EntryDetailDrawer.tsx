"use client";

import { useState, useRef } from "react";
import { supabaseClient } from "@/lib/supabase";
import { BrandLogo } from "@/components/BrandLogo";
import {
  X,
  Save,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Info,
  Calendar,
  Paperclip,
  Link as LinkIcon,
  ExternalLink,
  FileText,
  Flag,
  Briefcase,
  GraduationCap,
  Dumbbell,
  Wallet,
  User as UserIcon,
} from "lucide-react";
import type {
  EntryItem,
  AreaType,
  HorizonType,
  BlockItem,
  BlockType,
  AiContextData,
  PriorityType,
} from "@/types/database.types";

interface EntryDetailDrawerProps {
  entry: EntryItem | null;
  isOpen: boolean;
  onClose: () => void;
  aiContext?: AiContextData;
  onUpdate: (
    updatedEntry: Partial<EntryItem> & { id: string },
  ) => Promise<void>;
  onDelete?: (entryId: string) => Promise<void>;
}

interface EntryDetailFormProps {
  entry: EntryItem;
  onClose: () => void;
  aiContext?: AiContextData;
  onUpdate: (
    updatedEntry: Partial<EntryItem> & { id: string },
  ) => Promise<void>;
  onDelete?: (entryId: string) => Promise<void>;
}

const AREA_DATA: Record<
  AreaType,
  { label: string; icon: typeof Briefcase; color: string; bg: string; border: string }
> = {
  trabajo: {
    label: "Trabajo",
    icon: Briefcase,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
  },
  universidad: {
    label: "Universidad",
    icon: GraduationCap,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  gimnasio: {
    label: "Gimnasio",
    icon: Dumbbell,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
  },
  cashea: {
    label: "Cashea / Finanzas",
    icon: Wallet,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  personal: {
    label: "Personal & AI",
    icon: UserIcon,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
  },
};

function EntryDetailForm({
  entry,
  onClose,
  aiContext,
  onUpdate,
  onDelete,
}: EntryDetailFormProps) {
  const [title, setTitle] = useState(entry.title);
  const [area, setArea] = useState<AreaType>(entry.area);
  const [horizon, setHorizon] = useState<HorizonType>(entry.horizon);
  const [isCompleted, setIsCompleted] = useState<boolean>(entry.is_completed || false);
  const [dueDate, setDueDate] = useState<string>(
    entry.due_date ? entry.due_date.split("T")[0] : "",
  );
  const [priority, setPriority] = useState<PriorityType>(
    entry.priority || "media",
  );
  const [blocks, setBlocks] = useState<BlockItem[]>(entry.content || []);
  const [userContextNotes, setUserContextNotes] = useState("");
  const [showContextInput, setShowContextInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Invocacion a Gemini para desglose estructurado
  const handleBreakdownAI = async () => {
    if (!title.trim()) return;
    setIsGeneratingAI(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "breakdown",
          input: title.trim(),
          area,
          horizon,
          aiContext,
          userNotes: userContextNotes.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (data.blocks && Array.isArray(data.blocks)) {
        setBlocks(data.blocks);
        if (data.title) {
          setTitle(data.title);
        }
      }
    } catch (error) {
      console.error("Error al desglosar con IA:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Alternar completado en bloques tipo 'todo'
  const handleToggleTodoBlock = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === blockId) {
          const completed = !(b.metadata?.is_completed === true);
          return {
            ...b,
            metadata: { ...b.metadata, is_completed: completed },
          };
        }
        return b;
      }),
    );
  };

  // Modificar contenido de un bloque
  const handleUpdateBlockContent = (blockId: string, newContent: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, content: newContent } : b)),
    );
  };

  // Eliminar un bloque
  const handleDeleteBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  // Añadir un nuevo bloque manualmente
  const handleAddBlock = (type: BlockType = "todo") => {
    const newBlock: BlockItem = {
      id: `block-${Date.now()}`,
      type,
      content: "",
      metadata: type === "todo" ? { is_completed: false } : {},
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  // Subir archivo a Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${entry.id}/${Date.now()}_${sanitizedName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("entry-attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabaseClient.storage
        .from("entry-attachments")
        .getPublicUrl(filePath);

      const isImage = file.type.startsWith("image/");
      const newBlock: BlockItem = {
        id: `block-${Date.now()}`,
        type: "file",
        content: publicUrl,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          isImage,
        },
      };
      setBlocks((prev) => [...prev, newBlock]);
    } catch (err) {
      console.error("Error al subir archivo a Supabase Storage:", err);
    } finally {
      setIsUploadingFile(false);
      if (e.target) e.target.value = "";
    }
  };

  // Eliminar entrada
  const handleDeleteEntry = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(entry.id);
      onClose();
    } catch (err) {
      console.error("Error al eliminar entrada:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Guardar todo en Supabase
  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await onUpdate({
        id: entry.id,
        title: title.trim(),
        area,
        horizon,
        is_completed: isCompleted,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
        content: blocks,
      });
      onClose();
    } catch (err) {
      console.error("Error al guardar cambios:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const currentAreaInfo = AREA_DATA[area];
  const AreaIcon = currentAreaInfo.icon;

  const totalTodos = blocks.filter((b) => b.type === "todo").length;
  const completedTodos = blocks.filter(
    (b) => b.type === "todo" && b.metadata?.is_completed,
  ).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="relative w-full max-w-3xl bg-[#0d1117]/98 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 text-zinc-100"
    >
      {/* Header Superior Ejecutivo */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#161b22]/70 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center border ${currentAreaInfo.bg} ${currentAreaInfo.border}`}
          >
            <AreaIcon className={`w-4 h-4 ${currentAreaInfo.color}`} />
          </div>
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
            Edicion de Tarea & Bloques
          </span>
          {totalTodos > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-400">
              {completedTodos}/{totalTodos} completadas
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          title="Cerrar modal"
          className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Contenido Central Scrollable */}
      <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
        {/* Fila de Titulo Principal con Checkbox */}
        <div className="flex items-start gap-3 bg-[#161b22]/50 border border-white/10 rounded-2xl p-3.5 focus-within:border-indigo-500/60 transition-all">
          <button
            type="button"
            onClick={() => setIsCompleted((prev) => !prev)}
            title={isCompleted ? "Marcar como pendiente" : "Marcar como completada"}
            className="mt-1 text-zinc-500 hover:text-indigo-400 transition shrink-0 cursor-pointer"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Circle className="w-5 h-5 text-zinc-500 hover:text-zinc-300" />
            )}
          </button>
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titulo de la tarea o proyecto..."
              className={`w-full bg-transparent text-base sm:text-lg font-bold placeholder:text-zinc-500 focus:outline-none transition ${
                isCompleted ? "line-through text-zinc-400 opacity-60" : "text-white"
              }`}
            />
          </div>
        </div>

        {/* Propiedades de la Tarea (Grid 4 columnas) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#161b22]/40 border border-white/10 rounded-2xl p-3.5">
          {/* Area */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-semibold text-zinc-400">Area</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value as AreaType)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/80 cursor-pointer capitalize"
            >
              <option value="personal">Personal & AI</option>
              <option value="trabajo">Trabajo</option>
              <option value="universidad">Universidad</option>
              <option value="gimnasio">Gimnasio</option>
              <option value="cashea">Cashea</option>
            </select>
          </div>

          {/* Horizonte */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-semibold text-zinc-400">Horizonte</label>
            <select
              value={horizon}
              onChange={(e) => setHorizon(e.target.value as HorizonType)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/80 cursor-pointer"
            >
              <option value="hoy">Hoy</option>
              <option value="corto">Corto Plazo</option>
              <option value="mediano">Mediano Plazo</option>
              <option value="largo">Largo Plazo</option>
            </select>
          </div>

          {/* Fecha Limite */}
          <div className="space-y-1.5 text-left">
            <label className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400">
              <Calendar className="w-3 h-3 text-zinc-400" />
              <span>Vencimiento</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/80 cursor-pointer [color-scheme:dark]"
            />
          </div>

          {/* Prioridad */}
          <div className="space-y-1.5 text-left">
            <label className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400">
              <Flag className="w-3 h-3 text-zinc-400" />
              <span>Prioridad</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityType)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/80 cursor-pointer capitalize"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>

        {/* Consola de Inteligencia Artificial (Desglose Estructurado) */}
        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <BrandLogo size={16} />
              <span className="text-xs font-bold text-white tracking-wide">
                Desglose Inteligente con IA
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowContextInput((prev) => !prev)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  showContextInput || userContextNotes.trim()
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold"
                    : "text-zinc-400 border-white/10 hover:text-white hover:bg-white/5"
                }`}
                title="Añadir directivas o instrucciones personalizadas para la IA"
              >
                {userContextNotes.trim() ? "Contexto Activo" : "+ Contexto IA"}
              </button>

              <button
                type="button"
                onClick={handleBreakdownAI}
                disabled={isGeneratingAI || !title.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40 shadow-sm"
              >
                {isGeneratingAI ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <BrandLogo size={13} />
                )}
                <span>{isGeneratingAI ? "Desglosando..." : "Desglosar con AI"}</span>
              </button>
            </div>
          </div>

          {/* Campo de Contexto de Usuario para IA */}
          {(showContextInput || userContextNotes.trim()) && (
            <div className="space-y-1 pt-1 animate-in fade-in duration-150">
              <span className="text-[10px] font-mono text-indigo-300 font-semibold uppercase tracking-wider block">
                Directivas específicas para la IA:
              </span>
              <textarea
                rows={2}
                value={userContextNotes}
                onChange={(e) => setUserContextNotes(e.target.value)}
                placeholder="Ej: El entregable es un reporte en PDF de 3 fases con fecha limite el viernes..."
                className="w-full bg-zinc-900 border border-indigo-500/30 rounded-xl p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none transition"
              />
            </div>
          )}
        </div>

        {/* Seccion de Bloques de Contenido */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
              Bloques & Subtareas ({blocks.length})
            </label>
          </div>

          {blocks.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] space-y-2">
              <p className="text-xs text-zinc-400">
                No hay subtareas ni bloques de contenido todavia.
              </p>
              <button
                type="button"
                onClick={handleBreakdownAI}
                disabled={isGeneratingAI || !title.trim()}
                className="text-xs text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <BrandLogo size={12} />
                <span>Usa la IA para generar el plan de subtareas</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {blocks.map((block) => {
                const isBlockCompleted = block.metadata?.is_completed === true;

                // Bloque tipo Callout
                if (block.type === "callout") {
                  return (
                    <div
                      key={block.id}
                      className="group flex items-start gap-2.5 bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-xl relative"
                    >
                      <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) =>
                          handleUpdateBlockContent(block.id, e.target.value)
                        }
                        placeholder="Nota destacada o directiva..."
                        className="w-full bg-transparent text-xs text-zinc-200 focus:outline-none placeholder:text-zinc-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(block.id)}
                        title="Eliminar bloque"
                        className="opacity-70 group-hover:opacity-100 text-zinc-400 hover:text-rose-400 transition p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                // Bloque tipo Todo / Tarea
                if (block.type === "todo") {
                  return (
                    <div
                      key={block.id}
                      className="group flex items-center gap-2.5 bg-[#161b22]/60 border border-white/10 px-3.5 py-2.5 rounded-xl hover:border-white/20 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTodoBlock(block.id)}
                        className="text-zinc-500 hover:text-indigo-400 transition shrink-0 cursor-pointer"
                      >
                        {isBlockCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) =>
                          handleUpdateBlockContent(block.id, e.target.value)
                        }
                        placeholder="Subtarea o accion..."
                        className={`w-full bg-transparent text-xs sm:text-sm focus:outline-none transition ${
                          isBlockCompleted
                            ? "line-through text-zinc-500 opacity-60"
                            : "text-zinc-100"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(block.id)}
                        title="Eliminar subtarea"
                        className="opacity-70 group-hover:opacity-100 text-zinc-400 hover:text-rose-400 transition p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                // Bloque tipo Archivo / Imagen
                if (block.type === "file") {
                  const isImg =
                    block.metadata?.isImage ||
                    block.content.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i);
                  const fileName =
                    (block.metadata?.fileName as string) || "Archivo adjunto";

                  return (
                    <div
                      key={block.id}
                      className="group flex flex-col gap-2 bg-[#161b22]/70 border border-white/10 p-3 rounded-xl relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {isImg ? (
                            <Paperclip className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          )}
                          <span className="text-xs font-medium text-zinc-200 truncate">
                            {fileName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <a
                            href={block.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-zinc-400 hover:text-white transition"
                            title="Abrir o descargar archivo"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlock(block.id)}
                            className="p-1 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                            title="Eliminar archivo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {isImg && (
                        <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/50 max-h-48 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={block.content}
                            alt={fileName}
                            className="max-h-48 w-auto object-contain rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  );
                }

                // Bloque tipo Enlace
                if (block.type === "link") {
                  return (
                    <div
                      key={block.id}
                      className="group flex items-center gap-2.5 bg-[#161b22]/60 border border-white/10 px-3.5 py-2 rounded-xl"
                    >
                      <LinkIcon className="w-4 h-4 text-sky-400 shrink-0" />
                      <input
                        type="url"
                        value={block.content}
                        onChange={(e) =>
                          handleUpdateBlockContent(block.id, e.target.value)
                        }
                        placeholder="https://enlace.com..."
                        className="w-full bg-transparent text-xs text-sky-300 focus:outline-none placeholder:text-zinc-500 truncate"
                      />
                      {block.content && (
                        <a
                          href={block.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-400 hover:text-white p-1 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(block.id)}
                        className="opacity-70 group-hover:opacity-100 text-zinc-400 hover:text-rose-400 transition p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                // Bloque por defecto (Paragraph)
                return (
                  <div
                    key={block.id}
                    className="group flex items-start gap-2.5 bg-[#161b22]/40 border border-white/10 px-3.5 py-2 rounded-xl"
                  >
                    <span className="text-zinc-500 text-xs select-none mt-0.5">
                      -
                    </span>
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) =>
                        handleUpdateBlockContent(block.id, e.target.value)
                      }
                      placeholder="Detalle o apunte..."
                      className="w-full bg-transparent text-xs text-zinc-200 focus:outline-none placeholder:text-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(block.id)}
                      className="opacity-70 group-hover:opacity-100 text-zinc-400 hover:text-rose-400 transition p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Botones para Añadir Bloques Manuales */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleAddBlock("todo")}
              className="text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Subtarea</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock("callout")}
              className="text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Destacado</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock("link")}
              className="text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>+ Enlace</span>
            </button>

            {/* Input Oculto de Archivos */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFile}
              className="text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isUploadingFile ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Paperclip className="w-3.5 h-3.5" />
              )}
              <span>{isUploadingFile ? "Subiendo..." : "+ Archivo"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer de Acciones */}
      <div className="p-4 sm:p-5 border-t border-white/10 bg-[#161b22]/70 backdrop-blur-xl flex items-center justify-between gap-3">
        {onDelete ? (
          <button
            type="button"
            onClick={handleDeleteEntry}
            disabled={isDeleting}
            title="Eliminar esta tarea"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Eliminar Tarea</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2 rounded-xl text-xs shadow-lg hover:shadow-indigo-500/25 active:scale-95 transition cursor-pointer disabled:opacity-40"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function EntryDetailDrawer({
  entry,
  isOpen,
  onClose,
  aiContext,
  onUpdate,
  onDelete,
}: EntryDetailDrawerProps) {
  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop con desenfoque de cristal */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Centrado */}
      <EntryDetailForm
        key={entry.id}
        entry={entry}
        onClose={onClose}
        aiContext={aiContext}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
}
