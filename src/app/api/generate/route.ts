import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import type { AreaType, HorizonType, BlockItem, AiContextData } from "@/types/database.types";

interface GeneratePayload {
  mode?: "suggest" | "breakdown";
  input?: string;
  prompt?: string; // Compatibilidad hacia atrás
  area?: AreaType;
  horizon?: HorizonType;
  aiContext?: AiContextData;
}

const DOMAIN_INSTRUCTIONS: Record<AreaType, string> = {
  trabajo: `Actúa como un Staff Technical Project Manager y Arquitecto de Software.
- Desglosa la tarea en entregables técnicos concretos, dependencias críticas, estimación y criterios de aceptación claros.
- Prioriza bloques tipo 'todo' para acciones directas, 'callout' para riesgos o dependencias de arquitectura, y 'code' para comandos o snippets.`,

  universidad: `Actúa como un Asesor Académico y Metodológico de Alto Rendimiento.
- Desglosa el trabajo en etapas de investigación, lectura crítica, recolección de fuentes bibliográficas y redacción por entregas.
- Utiliza bloques 'heading' para secciones temáticas, 'todo' para entregas parciales y 'callout' para fuentes y citas clave.`,

  gimnasio: `Actúa como un Entrenador de Fuerza y Acondicionamiento Físico (CSCS).
- Estructura la sesión en: calentamiento articular, series de aproximación, series efectivas (indicando repeticiones y RPE/RIR) y recomendaciones de recuperación.
- Emplea bloques 'todo' para cada ejercicio y 'callout' para advertencias de postura, técnica e hidratación.`,

  cashea: `Actúa como un Asesor Financiero Personal y Gestor de Flujo de Caja.
- Estructura la compra/gasto en: cálculo de pago inicial, calendario de cuotas quincenales, fechas de corte y validación de liquidez.
- Utiliza bloques 'callout' para montos totales/alertas de saldo y 'todo' para fechas de pago programadas.`,

  personal: `Actúa como un Estratega de Productividad y Second Brain.
- Convierte ideas abstractas en micro-hábitos accionables, pasos de bajo rozamiento cognitivo y reflexiones de mejora continua.
- Emplea bloques 'todo' simples y 'callout' para ideas inspiradoras o recordatorios.`
};

const FALLBACK_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-2.0-flash-lite-preview-02-05",
];

// Helper para ejecutar generación con cascada de fallback ante picos de demanda o saturación
async function generateWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: string;
    config?: {
      systemInstruction?: string;
      responseMimeType?: string;
      responseSchema?: Record<string, unknown>;
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
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`Aviso en generate: Modelo ${model} devolvió error (${errorMsg}), intentando con siguiente modelo de respaldo...`);
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

    const body = (await request.json()) as GeneratePayload;
    const mode = body.mode || "suggest";
    const area = body.area || "personal";
    const horizon = body.horizon || "hoy";
    const input = body.input || body.prompt || "";
    const aiContext = body.aiContext;

    const domainInstruction = DOMAIN_INSTRUCTIONS[area] || DOMAIN_INSTRUCTIONS.personal;

    let userContextString = "";
    if (aiContext && (aiContext.profession || aiContext.goals || aiContext.custom_instructions)) {
      userContextString = `\n\nCONTEXTO Y PERFIL DEL USUARIO:
- Profesión/Rol: ${aiContext.profession || "No especificado"}
- Objetivos Actuales: ${aiContext.goals || "No especificado"}
- Directivas de Respuesta: ${aiContext.custom_instructions || "Ninguna"}`;
    }

    const ai = new GoogleGenAI({ apiKey });

    // MODO 1: Sugerencia de título conciso
    if (mode === "suggest") {
      const userPrompt = input.trim()
        ? `Rol y Especialidad: ${domainInstruction}${userContextString}\n\nGenera un título corto, accionable y de alto impacto relacionado con "${input}" para el área de ${area} (horizonte temporal: ${horizon}). Máximo 8 palabras, sin comillas ni puntos.`
        : `Rol y Especialidad: ${domainInstruction}${userContextString}\n\nGenera una única tarea diaria corta, concisa y orientada a la acción para la categoría ${area} (horizonte: ${horizon}). Máximo 8 palabras, sin comillas ni puntos.`;

      const response = await generateWithFallback(ai, {
        contents: userPrompt,
      });

      const title = response.text ? response.text.trim() : "";
      return NextResponse.json({ title, text: title });
    }

    // MODO 2: Desglose estructurado en bloques (BlockItem[])
    if (mode === "breakdown") {
      const systemInstruction = `Eres el asistente de organización inteligente de un Second Brain de alto rendimiento.
${domainInstruction}
${userContextString}

Tu objetivo es estructurar la entrada en una lista de bloques heterogéneos accionables ('heading', 'paragraph', 'todo', 'bullet', 'code', 'callout') que permitan una ejecución inmediata.`;

      const userPrompt = `Desglosa la siguiente entrada: "${input}". Área de enfoque: ${area}. Horizonte temporal: ${horizon}.`;

      const response = await generateWithFallback(ai, {
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Título conciso y optimizado de la entrada.",
              },
              blocks: {
                type: Type.ARRAY,
                description: "Lista de bloques de contenido estructurado.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: {
                      type: Type.STRING,
                      enum: [
                        "heading",
                        "paragraph",
                        "todo",
                        "bullet",
                        "code",
                        "callout",
                      ],
                    },
                    content: { type: Type.STRING },
                  },
                  required: ["id", "type", "content"],
                },
              },
            },
            required: ["title", "blocks"],
          },
        },
      });

      if (!response.text) {
        throw new Error("No se recibió respuesta estructurada del modelo.");
      }

      const structuredData = JSON.parse(response.text) as {
        title: string;
        blocks: BlockItem[];
      };

      return NextResponse.json(structuredData);
    }

    return NextResponse.json(
      { error: "Modo no reconocido. Use 'suggest' o 'breakdown'." },
      { status: 400 },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido al procesar con Gemini AI.";
    console.error("Error en /api/generate:", error);
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
