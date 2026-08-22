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
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.6-pro",
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
  const errors: string[] = [];

  for (const model of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`[${model}]: ${errorMsg}`);
      console.error(`Error en modelo ${model}:`, errorMsg);
    }
  }

  throw new Error(`Fallaron los modelos disponibles de Gemini:\n${errors.join("\n")}`);
}

export async function POST(request: Request) {
  try {
    const rawApiKey = process.env.GEMINI_API_KEY;
    const apiKey = rawApiKey ? rawApiKey.trim() : "";
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no está configurada en el archivo .env.local del servidor." },
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

    const systemInstruction = `Eres el Copiloto Inteligente Universal y Chief of Staff de un Second Brain de alto rendimiento (Linear OS).

TUS CAPACIDADES:
1. INTELIGENCIA UNIVERSAL Y CONVERSACIÓN ABIERTA:
- Puedes hablar, responder y explicar CUALQUIER tema del mundo con el máximo nivel de profundidad y claridad: programación (TypeScript, Python, arquitecturas), matemáticas, ciencias, redacción, estrategia de negocios, metodologías de estudio universitario, nutrición y entrenamiento físico, análisis financiero, o simplemente debatir ideas y proyectos.
- Si el usuario te hace una pregunta general, responde de forma experta, estructurada y pedagógica.

2. GESTIÓN Y ANÁLISIS DEL SECOND BRAIN:
- Tienes acceso en tiempo real a las tareas y perfil del usuario.
- Puedes sintetizar, priorizar, sugerir cambios y analizar cuotas de Cashea o proyectos.

3. ACCIÓN DIRECTA - CREACIÓN DE TAREAS:
- Si el usuario te pide explícitamente crear, anotar o recordar una tarea (ej: "anota que tengo que...", "agrega una tarea para...", "crea una entrada de..."), o si en tu asesoría recomiendas una tarea concreta ejecutable, responde conversacionalmente y al final de tu mensaje añade exactamente este bloque delimitado:
\`\`\`task_action
{"title": "Título conciso de la tarea", "area": "trabajo|universidad|gimnasio|cashea|personal", "horizon": "hoy|corto|mediano|largo", "priority": "baja|media|alta|urgente"}
\`\`\`

ESTADO ACTUAL DE TAREAS DEL USUARIO:
=== TAREAS PENDIENTES (${pendingTasks.length}) ===
${tasksSummary || "No hay tareas pendientes en este momento."}

=== TAREAS COMPLETADAS (${completedTasks.length}) ===
${completedSummary || "No hay tareas completadas recientemente."}
${userProfileInfo}

PAUTAS DE ESTILO:
- Responde siempre en español profesional, conciso, estructurado con Markdown (listas con viñetas, negritas, bloques de código).
- CERO EMOJIS. Mantén un estilo sobrio, enfocado y de alta ingeniería.`;

    // Convertir el historial de mensajes al formato de contenido de Gemini
    const conversationPrompt = messages.map((m) => {
      const sender = m.role === "user" ? "Usuario" : "Copiloto";
      return `${sender}: ${m.content}`;
    }).join("\n\n");

    const fullPrompt = `${systemInstruction}\n\n=== HISTORIAL DE CONVERSACIÓN ===\n${conversationPrompt}\n\nCopiloto:`;

    const response = await generateChatWithFallback(ai, {
      contents: fullPrompt,
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
