import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import type { AreaType, HorizonType, BlockItem } from "@/types/database.types";

interface GeneratePayload {
  mode?: "suggest" | "breakdown";
  input?: string;
  prompt?: string; // Compatibilidad hacia atrás
  area?: AreaType;
  horizon?: HorizonType;
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

    const ai = new GoogleGenAI({ apiKey });

    // MODO 1: Sugerencia de título conciso
    if (mode === "suggest") {
      const userPrompt = input.trim()
        ? `Genera un título corto, accionable e inspirador relacionado con "${input}" para el área de ${area} (horizonte temporal: ${horizon}). Máximo 8 palabras, sin comillas ni puntos.`
        : `Genera una única tarea diaria corta, concisa y orientada a la acción para la categoría ${area} (horizonte: ${horizon}). Máximo 8 palabras, sin comillas ni puntos.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
      });

      const title = response.text ? response.text.trim() : "";
      return NextResponse.json({ title, text: title });
    }

    // MODO 2: Desglose estructurado en bloques (BlockItem[])
    if (mode === "breakdown") {
      const systemInstruction = `Eres el asistente de organización personal de un Second Brain.
      Tu objetivo es desglosar la idea del usuario en bloques de contenido accionables y estructurados según el área:
      - 'trabajo': tareas ejecutables (todo), llamadas de atención (callout), detalles técnicos (code/paragraph).
      - 'universidad': conceptos clave (heading/paragraph), lecturas y entregas (todo).
      - 'gimnasio': ejercicios con series/repeticiones (bullet/todo), consejos de descanso (callout).
      - 'cashea': desglose de cuotas, montos y fechas de pago (bullet/todo/callout).
      - 'personal': reflexiones, hábitos y pasos (todo/paragraph).`;

      const userPrompt = `Desglosa la siguiente entrada: "${input}". Área: ${area}. Horizonte temporal: ${horizon}.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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
  } catch (error) {
    console.error("Error en /api/generate:", error);
    return NextResponse.json(
      {
        error: "Ocurrió un error al procesar la solicitud con Gemini AI.",
      },
      { status: 500 },
    );
  }
}
