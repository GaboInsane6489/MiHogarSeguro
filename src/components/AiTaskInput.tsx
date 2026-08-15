"use client";

import { useState } from "react";
import { Sparkles, Loader2, Wand2 } from "lucide-react";

interface AiTaskInputProps {
  value: string;
  onChange: (value: string) => void;
  category: string;
}

export function AiTaskInput({ value, onChange, category }: AiTaskInputProps) {
  const [loadingAI, setLoadingAI] = useState(false);

  const handleGenerateAI = async () => {
    setLoadingAI(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "suggest",
          input: value.trim(),
          area: category,
        }),
      });

      const data = await response.json();

      if (data.title || data.text) {
        onChange((data.title || data.text).trim());
      }
    } catch (error) {
      console.error("Error obteniendo sugerencia de la IA:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="relative w-full group">
      <div className="relative flex items-center w-full rounded-xl bg-surface-subtle border border-border-subtle group-focus-within:border-ai/70 group-focus-within:ring-2 group-focus-within:ring-ai/20 transition-all duration-200 shadow-inner">
        <div className="pl-3.5 pr-1 text-text-muted/60">
          <Wand2 className="w-4 h-4 text-ai/60 group-focus-within:text-ai transition-colors" />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe una nota, tarea o idea para capturar..."
          className="w-full bg-transparent px-2.5 py-3 pr-24 text-xs sm:text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={loadingAI}
            title="Generar sugerencia con Gemini AI"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ai/15 hover:bg-ai/25 text-ai border border-ai/30 text-[11px] font-semibold transition cursor-pointer disabled:opacity-40"
          >
            {loadingAI ? (
              <Loader2 className="w-3 h-3 text-ai animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3 text-ai" />
            )}
            <span className="hidden sm:inline">
              {loadingAI ? "Pensando..." : "Gemini AI"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
