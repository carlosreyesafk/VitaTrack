import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { SignoVital } from "@/types";

export async function listarSignos(pacienteId: string, limite = 30) {
  if (!supabaseConfigured) return { data: [] as SignoVital[], error: null };
  return supabase
    .from("signos_vitales")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("registrado_en", { ascending: false })
    .limit(limite);
}

export async function registrarSigno(payload: {
  paciente_id: string;
  presion_sistolica?: number | null;
  presion_diastolica?: number | null;
  glucosa?: number | null;
  temperatura?: number | null;
  pulso?: number | null;
  notas?: string | null;
}) {
  if (!supabaseConfigured) return { error: new Error("Supabase no configurado") };
  return supabase.from("signos_vitales").insert(payload);
}

export async function ultimasLecturasPresion(pacienteId: string, n: number) {
  if (!supabaseConfigured) return [] as { sistolica: number; diastolica: number }[];
  const { data } = await supabase
    .from("signos_vitales")
    .select("presion_sistolica,presion_diastolica,registrado_en")
    .eq("paciente_id", pacienteId)
    .order("registrado_en", { ascending: false })
    .limit(n * 2);

  return (data ?? [])
    .filter((r) => r.presion_sistolica != null && r.presion_diastolica != null)
    .slice(0, n)
    .map((r) => ({
      sistolica: Number(r.presion_sistolica),
      diastolica: Number(r.presion_diastolica),
    }))
    .filter((r) => !Number.isNaN(r.sistolica) && !Number.isNaN(r.diastolica));
}
