"use client";

import { useState } from "react";
import {
  X,
  Save,
  Loader2,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Info,
} from "lucide-react";
import type { EntryItem, AreaType, HorizonType, BlockItem, BlockType, AiContextData } from "@/types/database.types";

interface EntryDetailDrawerProps {
  entry: EntryItem | null;
  isOpen: boolean;
  onClose: () => void;
  aiContext?: AiContextData;
  onUpdate: (
    updatedEntry: Partial<EntryItem> & { id: string },
  ) => Promise<void>;
}

interface EntryDetailFormProps {
  entry: EntryItem;
  onClose: () => void;
  aiContext?: AiContextData;
  onUpdate: (
    updatedEntry: Partial<EntryItem> & { id: string },
  ) => Promise<void>;
}

function EntryDetailForm({ entry, onClose, aiContext, onUpdate }: EntryDetailFormProps) {
  const [title, setTitle] = useState(entry.title);
  const [area, setArea] = useState<AreaType>(entry.area);
  const [horizon, setHorizon] = useState<HorizonType>(entry.horizon);
  const [blocks, setBlocks] = useState<BlockItem[]>(entry.content || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

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
          const isCompleted = !(b.metadata?.is_completed === true);
          return {
            ...b,
            metadata: { ...b.metadata, is_completed: isCompleted },
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

  // Anadir un nuevo bloque manualmente
  const handleAddBlock = (type: BlockType = "todo") => {
    const newBlock: BlockItem = {
      id: `block-${Date.now()}`,
      type,
      content: "",
      metadata: type === "todo" ? { is_completed: false } : {},
    };
    setBlocks((prev) => [...prev, newBlock]);
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
        content: blocks,
      });
      onClose();
    } catch (err) {
      console.error("Error al guardar cambios:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <aside className="fixed inset-y-0 right-0 w-full max-w-lg bg-surface/95 backdrop-blur-xl border-l border-border-subtle z-50 p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
      <div className="space-y-6 overflow-y-auto pr-1">
        {/* Header con boton de cerrar */}
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">
              Detalle & Bloques
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Titulo editable */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted">
            Titulo
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titulo de la entrada..."
            className="w-full bg-surface-subtle border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm font-semibold text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-ai/60 transition"
          />
        </div>

        {/* Selectores de Area y Horizonte */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">
              Area
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value as AreaType)}
              className="w-full bg-surface-subtle border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-ai/60 cursor-pointer capitalize transition"
            >
              <option value="personal">Personal & AI</option>
              <option value="trabajo">Trabajo</option>
              <option value="universidad">Universidad</option>
              <option value="gimnasio">Gimnasio</option>
              <option value="cashea">Cashea</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">
              Horizonte
            </label>
            <select
              value={horizon}
              onChange={(e) => setHorizon(e.target.value as HorizonType)}
              className="w-full bg-surface-subtle border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-ai/60 cursor-pointer transition"
            >
              <option value="hoy">Hoy</option>
              <option value="corto">Corto Plazo</option>
              <option value="mediano">Mediano Plazo</option>
              <option value="largo">Largo Plazo</option>
            </select>
          </div>
        </div>

        {/* Seccion de Bloques de Contenido y Boton AI */}
        <div className="space-y-3 pt-2 border-t border-border-subtle/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">
              Bloques ({blocks.length})
            </label>

            {/* Boton Desglosar con AI */}
            <button
              type="button"
              onClick={handleBreakdownAI}
              disabled={isGeneratingAI || !title.trim()}
              className="bg-ai/15 hover:bg-ai/25 text-ai border border-ai/30 text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
            >
              {isGeneratingAI ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingAI ? "Desglosando..." : "Desglosar con AI"}</span>
            </button>
          </div>

          {/* Lista de Bloques */}
          {blocks.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border-subtle bg-surface-subtle/30 space-y-2">
              <p className="text-xs text-text-muted">
                No hay bloques de contenido todavia.
              </p>
              <button
                type="button"
                onClick={handleBreakdownAI}
                disabled={isGeneratingAI || !title.trim()}
                className="text-xs text-ai font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Usa la IA para generar subtareas y notas</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {blocks.map((block) => {
                const isCompleted = block.metadata?.is_completed === true;

                // Bloque tipo Callout
                if (block.type === "callout") {
                  return (
                    <div
                      key={block.id}
                      className="group flex items-start gap-2.5 bg-surface-subtle border border-ai/30 p-3 rounded-xl relative"
                    >
                      <Info className="w-4 h-4 text-ai shrink-0 mt-0.5" />
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) =>
                          handleUpdateBlockContent(block.id, e.target.value)
                        }
                        placeholder="Nota destacada..."
                        className="w-full bg-transparent text-xs text-text-primary focus:outline-none placeholder:text-text-muted/40"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(block.id)}
                        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-gym transition p-1 cursor-pointer"
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
                      className="group flex items-center gap-2.5 bg-surface-subtle/60 border border-border-subtle px-3 py-2 rounded-xl"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTodoBlock(block.id)}
                        className="text-text-muted hover:text-ai transition shrink-0 cursor-pointer"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-university" />
                        ) : (
                          <Circle className="w-4 h-4 text-text-muted" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) =>
                          handleUpdateBlockContent(block.id, e.target.value)
                        }
                        placeholder="Subtarea o item accionable..."
                        className={`w-full bg-transparent text-xs focus:outline-none transition ${
                          isCompleted
                            ? "line-through text-text-muted opacity-60"
                            : "text-text-primary"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(block.id)}
                        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-gym transition p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                // Bloque por defecto (Paragraph, Heading, Bullet, Code)
                return (
                  <div
                    key={block.id}
                    className="group flex items-start gap-2.5 bg-surface-subtle/40 border border-border-subtle px-3 py-2 rounded-xl"
                  >
                    <span className="text-text-muted text-xs select-none mt-0.5">-</span>
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) =>
                        handleUpdateBlockContent(block.id, e.target.value)
                      }
                      placeholder="Nota o detalle..."
                      className="w-full bg-transparent text-xs text-text-primary focus:outline-none placeholder:text-text-muted/40"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(block.id)}
                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-gym transition p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Boton rapido para anadir bloques manualmente */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleAddBlock("todo")}
              className="text-[11px] font-medium text-text-muted hover:text-text-primary bg-surface-subtle border border-border-subtle px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>+ Subtarea</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock("callout")}
              className="text-[11px] font-medium text-text-muted hover:text-text-primary bg-surface-subtle border border-border-subtle px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>+ Destacado</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer con boton de guardar */}
      <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-text-primary hover:bg-surface-subtle transition cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !title.trim()}
          className="flex items-center gap-2 bg-text-primary text-canvas font-semibold px-5 py-2.5 rounded-xl text-xs hover:opacity-90 active:scale-95 transition cursor-pointer disabled:opacity-40"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
        </button>
      </div>
    </aside>
  );
}

export function EntryDetailDrawer({
  entry,
  isOpen,
  onClose,
  aiContext,
  onUpdate,
}: EntryDetailDrawerProps) {
  if (!isOpen || !entry) return null;

  return (
    <>
      {/* Backdrop con desenfoque de cristal */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-40 transition-opacity"
      />

      {/* Formulario con key para reinicio de estado automatico */}
      <EntryDetailForm
        key={entry.id}
        entry={entry}
        onClose={onClose}
        aiContext={aiContext}
        onUpdate={onUpdate}
      />
    </>
  );
}
