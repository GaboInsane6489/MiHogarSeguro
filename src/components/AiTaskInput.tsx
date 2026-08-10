"use client";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface AiTaskInputProps {
  value: string;
  onChange: (value: string) => void;
  category: string;
}

export function AiTaskInput({ value, onChange, category }: AiTaskInputProps) {
  const [LoadingAI, setLoadingAI] = useState(false);

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
        setLoadingAI(false);
        return;
      }
    } catch (error) {
      console.error("Error obteniendo tarea de la IA", error);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ingresa tu nueva tarea aquí, master..."
        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-3 pr-10 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition"
      />
      <button
        type="button"
        onClick={handleGenerateAI}
        disabled={LoadingAI}
        title="Sugerir tarea con IA"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md bg-neutral-400 border border-neutral-700 text-neutral-400 flex items-center justify-center transition hover:bg-purple-950/40 hover:text-purple-400 disabled:opacity-40 cursor-pointer"
      >
        {LoadingAI ? (
          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 text-purple-400" />
        )}
      </button>
    </div>
  );
}
