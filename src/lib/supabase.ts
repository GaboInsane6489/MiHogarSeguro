import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
    console.warn("Advertencia: Las variables de entorno de Supabase no están configuradas.");
  }
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
export const supabase = supabaseClient;
