"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Loader2,
  Sparkles,
  RotateCcw,
  Bot,
  User as UserIcon,
  Plus,
  Check,
  Copy,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import type { EntryItem, AiContextData, AreaType, HorizonType, PriorityType } from "@/types/database.types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SecondBrainChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: EntryItem[];
  aiContext?: AiContextData;
  onAddTask?: (taskData: {
    title: string;
    area: AreaType;
    horizon: HorizonType;
    priority?: PriorityType;
  }) => Promise<void>;
}

const QUICK_PROMPTS = [
  "¿Qué tengo pendiente para hoy?",
  "Prioridades urgentes de la semana",
  "Resumen de pagos de Cashea",
  "Planifica mi bloque de trabajo de hoy",
  "Recomiéndame cómo organizar mis tareas",
];

export function SecondBrainChatDrawer({
  isOpen,
  onClose,
  tasks,
  aiContext,
  onAddTask,
}: SecondBrainChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-msg",
      role: "assistant",
      content:
        "Hola. Soy tu Copiloto Universal y Asistente del Second Brain. Puedes preguntarme sobre cualquier tema o pedirme que planifique y cree tareas en tu workspace. ¿En qué te ayudo hoy?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addedTasks, setAddedTasks] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll al final del chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Enfocar input al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isLoading) return;

    const msgId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `user-${messages.length + 1}`;
    const userMessage: Message = {
      id: msgId,
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    const newMessagesHistory = [...messages, userMessage];
    setMessages(newMessagesHistory);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessagesHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          tasks,
          aiContext,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `asst-${messages.length + 1}`;
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: data.content || "No se recibió respuesta del modelo.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Error de comunicación con el Copiloto.";
      const errId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `err-${messages.length + 1}`;
      const errorMessage: Message = {
        id: errId,
        role: "assistant",
        content: `Error al procesar: ${errMsg}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    const initId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "init-reset";
    setMessages([
      {
        id: initId,
        role: "assistant",
        content:
          "Historial reiniciado. ¿Qué deseas consultar o planificar ahora?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Backdrop con desenfoque */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-40 transition-opacity"
      />

      {/* Drawer Lateral */}
      <aside className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#0d1117] border-l border-white/10 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-[#161b22]/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <BrandLogo className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Second Brain Copilot
                </h3>
                <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                {tasks.filter((t) => !t.is_completed).length} tareas pendientes en contexto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleClearHistory}
              title="Reiniciar conversacion"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mensajes del Chat */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((message) => {
            const isUser = message.role === "user";

            // Parsear acciones de creacion de tareas si existen
            let cleanContent = message.content;
            let parsedAction: {
              title: string;
              area?: AreaType;
              horizon?: HorizonType;
              priority?: PriorityType;
            } | null = null;

            const actionMatch = message.content.match(
              /```task_action\s*([\s\S]*?)\s*```/
            );
            if (actionMatch) {
              try {
                parsedAction = JSON.parse(actionMatch[1]);
                cleanContent = message.content
                  .replace(/```task_action\s*[\s\S]*?\s*```/, "")
                  .trim();
              } catch {
                // Ignore parse error
              }
            }

            return (
              <div
                key={message.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 space-y-2.5 ${
                    isUser
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 rounded-tr-xs"
                      : "bg-[#161b22] border border-white/10 text-zinc-200 rounded-tl-xs"
                  }`}
                >
                  {/* Contenido con formateo multilínea */}
                  <div className="whitespace-pre-wrap font-sans text-xs select-text leading-relaxed">
                    {cleanContent}
                  </div>

                  {/* Tarjeta Interactiva de Creacion de Tarea */}
                  {parsedAction && onAddTask && (
                    <div className="mt-2.5 p-3 rounded-xl bg-zinc-900/90 border border-indigo-500/30 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                          Acción sugerida: Crear Tarea
                        </span>
                        <div className="flex items-center gap-1.5">
                          {parsedAction.area && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 capitalize font-mono border border-indigo-500/20">
                              {parsedAction.area}
                            </span>
                          )}
                          {parsedAction.priority && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 capitalize font-mono border border-amber-500/20">
                              {parsedAction.priority}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-zinc-100">
                        {parsedAction.title}
                      </p>

                      <button
                        type="button"
                        onClick={async () => {
                          if (parsedAction && !addedTasks[message.id]) {
                            await onAddTask({
                              title: parsedAction.title,
                              area: parsedAction.area || "personal",
                              horizon: parsedAction.horizon || "hoy",
                              priority: parsedAction.priority || "media",
                            });
                            setAddedTasks((prev) => ({
                              ...prev,
                              [message.id]: true,
                            }));
                          }
                        }}
                        disabled={addedTasks[message.id]}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          addedTasks[message.id]
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                        }`}
                      >
                        {addedTasks[message.id] ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Agregada al Workspace</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar a mi Workspace</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(cleanContent);
                          setCopiedId(message.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === message.id ? "Copiado" : "Copiar"}</span>
                      </button>
                    )}

                    <span
                      className={`block text-[9px] font-mono ml-auto ${
                        isUser ? "text-indigo-200/70" : "text-zinc-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5 text-zinc-300" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loader de generacion */}
          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-zinc-400">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="flex items-center gap-2 bg-[#161b22] border border-white/10 px-3.5 py-2.5 rounded-2xl rounded-tl-xs">
                <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span className="text-[11px] font-mono text-zinc-400">
                  Analizando tareas y formulando respuesta...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer: Sugerencias y Caja de Entrada */}
        <div className="p-4 border-t border-white/10 bg-[#161b22]/70 space-y-3">
          {/* Chips de Preguntas Rapidas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-1" />
            {QUICK_PROMPTS.map((promptText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(promptText)}
                disabled={isLoading}
                className="shrink-0 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/10 px-2.5 py-1 rounded-lg transition cursor-pointer disabled:opacity-40"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Input de Mensaje */}
          <div className="relative flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-xl p-1.5 focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregúntale a tu Second Brain... (Enter para enviar)"
              className="flex-1 bg-transparent px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none max-h-24 overflow-y-auto"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 transition cursor-pointer shrink-0 shadow-sm"
              title="Enviar mensaje"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
