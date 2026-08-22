"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
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
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
        <BrandLogo size={15} className="opacity-70" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe una nota, tarea o idea para capturar..."
        className="w-full h-11 bg-zinc-900/80 border border-white/10 rounded-xl pl-10 pr-32 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 transition-all"
      />
      <button
        type="button"
        onClick={handleGenerateAI}
        disabled={loadingAI}
        title="Generar sugerencia inteligente con IA"
        className="h-8 absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 text-xs bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 hover:text-white border border-white/10 hover:border-indigo-500/40 rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 group"
      >
        {loadingAI ? (
          <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
        ) : (
          <div className="relative flex items-center justify-center">
            <BrandLogo size={14} className="transition-transform group-hover:scale-110" />
            <span className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
        <span className="font-medium">{loadingAI ? "Pensando..." : "Copiloto AI"}</span>
      </button>
    </div>
  );
}
