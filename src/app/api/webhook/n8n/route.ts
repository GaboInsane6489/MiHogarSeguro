import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";
import type { AreaType, HorizonType, BlockItem } from "@/types/database.types";

interface N8nEntryPayload {
  title: string;
  area?: AreaType;
  horizon?: HorizonType;
  content?: BlockItem[];
  metadata?: Record<string, unknown>;
}

// Función auxiliar para autenticación con cabecera segura
function isAuthorized(request: Request): boolean {
  const apiKeyHeader = request.headers.get("x-n8n-api-key");
  const expectedApiKey = process.env.N8N_API_KEY;

  if (!expectedApiKey || !apiKeyHeader) {
    return false;
  }

  return apiKeyHeader === expectedApiKey;
}

// POST: Crear entrada automatizada desde n8n
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as N8nEntryPayload;

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { error: "El campo 'title' es obligatorio y debe ser un texto válido." },
        { status: 400 },
      );
    }

    const newEntry = {
      title: body.title.trim(),
      area: body.area || "personal",
      horizon: body.horizon || "hoy",
      content: Array.isArray(body.content) ? body.content : [],
      metadata: body.metadata || {},
      is_completed: false,
    };

    const { data, error } = await supabaseClient
      .from("entries")
      .insert(newEntry)
      .select()
      .single();

    if (error) {
      console.error("Error al insertar entrada desde n8n:", error.message);
      return NextResponse.json(
        { error: "Error al guardar en Supabase: " + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error procesando webhook de n8n:", message);
    return NextResponse.json(
      { error: "Payload inválido o error interno." },
      { status: 500 },
    );
  }
}

// GET: Consultar tareas pendientes para briefs y resúmenes diarios en n8n
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get("area") as AreaType | null;
    const horizon = searchParams.get("horizon") as HorizonType | null;

    let query = supabaseClient
      .from("entries")
      .select("*")
      .eq("is_completed", false)
      .order("created_at", { ascending: true });

    if (area) {
      query = query.eq("area", area);
    }

    if (horizon) {
      query = query.eq("horizon", horizon);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error al consultar entradas para n8n:", error.message);
      return NextResponse.json(
        { error: "Error al consultar Supabase: " + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      total: data?.length || 0,
      entries: data || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error en GET /api/webhook/n8n:", message);
    return NextResponse.json(
      { error: "Error interno al consultar pendientes." },
      { status: 500 },
    );
  }
}
