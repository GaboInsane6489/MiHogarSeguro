"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

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
      const prompt = `Genera una única tarea diaria corta, concisa y orientada a la acción para la categoría ${category}. Responde únicamente con el título de la tarea (Máximo 8 palabras), sin comillas ni puntos`;
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.text) {
        onChange(data.text.trim());
      }
    } catch (error) {
      console.error("Error obteniendo sugerencia de la IA:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe una nota, tarea o idea..."
        className="w-full bg-surface-subtle border border-border rounded-xl px-4 py-3 pr-11 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-ai transition-colors"
      />
      <button
        type="button"
        onClick={handleGenerateAI}
        disabled={loadingAI}
        title="Sugerir idea con Gemini AI"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-ai hover:bg-ai/10 transition cursor-pointer flex items-center justify-center disabled:opacity-40"
      >
        {loadingAI ? (
          <Loader2 className="w-4 h-4 text-ai animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 text-ai" />
        )}
      </button>
    </div>
  );
}
