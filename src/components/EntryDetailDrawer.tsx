"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import type { EntryItem, AreaType, HorizonType } from "@/types/database.types";

interface EntryDetailDrawerProps {
  entry: EntryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (
    updatedEntry: Partial<EntryItem> & { id: string },
  ) => Promise<void>;
}

interface EntryDetailFormProps {
  entry: EntryItem;
  onClose: () => void;
  onUpdate: (
    updatedEntry: Partial<EntryItem> & { id: string },
  ) => Promise<void>;
}

function EntryDetailForm({ entry, onClose, onUpdate }: EntryDetailFormProps) {
  const paragraphBlock = entry.content?.find((b) => b.type === "paragraph");

  const [title, setTitle] = useState(entry.title);
  const [area, setArea] = useState<AreaType>(entry.area);
  const [horizon, setHorizon] = useState<HorizonType>(entry.horizon);
  const [notes, setNotes] = useState(
    paragraphBlock ? paragraphBlock.content : "",
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      const updatedContent = [
        ...(entry.content?.filter((b) => b.type !== "paragraph") || []),
        ...(notes.trim()
          ? [
              {
                id: "note-1",
                type: "paragraph" as const,
                content: notes.trim(),
              },
            ]
          : []),
      ];

      await onUpdate({
        id: entry.id,
        title: title.trim(),
        area,
        horizon,
        content: updatedContent,
      });
      onClose();
    } catch (err) {
      console.error("Error al guardar cambios:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <aside className="fixed inset-y-0 right-0 w-full max-w-md bg-surface border-l border-border z-50 p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
      <div className="space-y-6 overflow-y-auto pr-1">
        {/* Header con botón de cerrar */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Detalle de la Entrada
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Título editable */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted">
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la entrada..."
            className="w-full bg-surface-subtle border border-border rounded-xl px-3.5 py-2.5 text-base font-semibold text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-ai/60 transition"
          />
        </div>

        {/* Selectores de Área y Horizonte */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">
              Área
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value as AreaType)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-ai/60 cursor-pointer capitalize transition"
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
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-ai/60 cursor-pointer transition"
            >
              <option value="hoy">Hoy</option>
              <option value="corto">Corto Plazo</option>
              <option value="mediano">Mediano Plazo</option>
              <option value="largo">Largo Plazo</option>
            </select>
          </div>
        </div>

        {/* Contenido / Notas detalladas */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted">
            Notas y Contenido (Markdown / Bloques)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escribe notas, subtareas, contexto o detalles de esta entrada..."
            className="w-full bg-surface-subtle border border-border rounded-xl p-3.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-ai/60 resize-none h-48 transition font-sans"
          />
        </div>
      </div>

      {/* Footer con botón de guardar */}
      <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
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
  onUpdate,
}: EntryDetailDrawerProps) {
  if (!isOpen || !entry) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs transition-opacity"
      />

      {/* Formulario con key para reinicio de estado automático sin useEffect */}
      <EntryDetailForm
        key={entry.id}
        entry={entry}
        onClose={onClose}
        onUpdate={onUpdate}
      />
    </>
  );
}
