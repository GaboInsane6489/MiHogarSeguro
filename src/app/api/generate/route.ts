import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "El prompt es requerido." },
        { status: 400 },
      );
    }

    {
      /* Entra en acción el ricolino Gemini */
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error("Error invocando al poderoso Gemini", error);
    return NextResponse.json(
      {
        error: "Ocurrió un error al procesar la solicitud con Gemini, brother",
      },
      { status: 500 },
    );
  }
}
