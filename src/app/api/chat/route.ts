import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import type { EntryItem, AiContextData } from "@/types/database.types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatPayload {
  messages: ChatMessage[];
  tasks?: EntryItem[];
  aiContext?: AiContextData;
}

const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-pro",
];

async function generateChatWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: string;
    config?: {
      systemInstruction?: string;
    };
  },
) {
  let lastError: unknown;

  for (const model of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`Aviso: Modelo ${model} no disponible en chat, probando siguiente modelo de respaldo...`);
    }
  }

  throw lastError;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no está configurada en el servidor." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as ChatPayload;
    const { messages = [], tasks = [], aiContext } = body;

    if (!messages.length) {
      return NextResponse.json(
        { error: "Se requiere al menos un mensaje en el historial." },
        { status: 400 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Preparar el resumen estructurado de las tareas activas para el contexto
    const pendingTasks = tasks.filter((t) => !t.is_completed);
    const completedTasks = tasks.filter((t) => t.is_completed);

    const tasksSummary = pendingTasks.map((t, idx) => {
      let extra = `Área: ${t.area}, Horizonte: ${t.horizon}`;
      if (t.priority) extra += `, Prioridad: ${t.priority}`;
      if (t.due_date) extra += `, Vence: ${new Date(t.due_date).toLocaleDateString("es-ES")}`;
      if (t.content && t.content.length > 0) {
        const subtasks = t.content
          .filter((b) => b.type === "todo")
          .map((b) => `    - [${b.metadata?.is_completed ? "X" : " "}] ${b.content}`)
          .join("\n");
        if (subtasks) extra += `\n${subtasks}`;
      }
      return `${idx + 1}. [ ] ${t.title} (${extra})`;
    }).join("\n");

    const completedSummary = completedTasks.map((t, idx) => {
      return `${idx + 1}. [X] ${t.title} (Área: ${t.area})`;
    }).join("\n");

    // Inyectar el perfil del usuario si existe
    let userProfileInfo = "";
    if (aiContext && (aiContext.profession || aiContext.goals || aiContext.custom_instructions)) {
      userProfileInfo = `\n\nPERFIL DEL USUARIO:
- Profesión / Rol: ${aiContext.profession || "No especificado"}
- Objetivos Actuales: ${aiContext.goals || "No especificado"}
- Directivas de Estilo: ${aiContext.custom_instructions || "Ninguna"}`;
    }

    const systemInstruction = `Eres el Copiloto Inteligente y Chief of Staff de un Second Brain de alto rendimiento (Linear OS).
Tu misión es ayudar al usuario a navegar, sintetizar, planificar, priorizar y ejecutar su vida diaria en sus 5 áreas clave:
1. Trabajo (desarrollo técnico, proyectos, entregables)
2. Universidad (estudio, investigación, entregas)
3. Gimnasio (entrenamiento, progresión de fuerza, rutinas)
4. Cashea / Finanzas (cuotas, fechas de corte, compras, liquidez)
5. Personal & AI (hábitos, organización, ideas)

ESTADO ACTUAL DE TAREAS DEL USUARIO:
=== TAREAS PENDIENTES (${pendingTasks.length}) ===
${tasksSummary || "No hay tareas pendientes en este momento."}

=== TAREAS COMPLETADAS (${completedTasks.length}) ===
${completedSummary || "No hay tareas completadas recientemente."}
${userProfileInfo}

PAUTAS DE RESPUESTA:
- Responde siempre en español, de forma concisa, directa, profesional y estructurada (usa listas con guiones, negritas y títulos limpios de Markdown).
- Sé proactivo: si el usuario te pide planificar o priorizar, indícale claramente qué hacer primero según sus prioridades ('urgente' / 'alta') y fechas de vencimiento.
- Si te preguntan por Cashea o finanzas, calcula los montos o fechas pendientes de las tareas.
- Mantén un tono motivador, enfocado en la acción y de alta productividad. CERO EMOJIS.`;

    // Convertir el historial de mensajes al formato de contenido de Gemini
    const conversationPrompt = messages.map((m) => {
      const sender = m.role === "user" ? "Usuario" : "Copiloto";
      return `${sender}: ${m.content}`;
    }).join("\n\n");

    const fullPrompt = `${conversationPrompt}\n\nCopiloto:`;

    const response = await generateChatWithFallback(ai, {
      contents: fullPrompt,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text?.trim() || "No pude generar una respuesta en este momento.";

    return NextResponse.json({
      role: "assistant",
      content: reply,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido al procesar el chat con Gemini.";
    console.error("Error en /api/chat:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
