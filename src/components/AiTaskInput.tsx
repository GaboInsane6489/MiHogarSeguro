"use client";

import { useState } from "react";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import type { AiContextData } from "@/types/database.types";

interface AiTaskInputProps {
  value: string;
  onChange: (value: string) => void;
  category: string;
  aiContext?: AiContextData;
}

export function AiTaskInput({ value, onChange, category, aiContext }: AiTaskInputProps) {
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
          aiContext,
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
    <div className="relative flex items-center w-full">
      <Wand2 className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 text-zinc-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe una nota, tarea o idea para capturar..."
        className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-28 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
      />
      <button
        type="button"
        onClick={handleGenerateAI}
        disabled={loadingAI}
        title="Generar sugerencia con Gemini AI"
        className="h-8 absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 text-xs bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40"
      >
        {loadingAI ? (
          <Loader2 className="w-3.5 h-3.5 text-indigo-300 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
        )}
        <span>{loadingAI ? "Pensando..." : "Gemini AI"}</span>
      </button>
    </div>
  );
}
