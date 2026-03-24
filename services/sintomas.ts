import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Sintoma } from "@/types";

export async function listarSintomas(pacienteId: string, limite = 20) {
  if (!supabaseConfigured) return { data: [] as Sintoma[], error: null };
  return supabase
    .from("sintomas")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("registrado_en", { ascending: false })
    .limit(limite);
}

export async function registrarSintoma(payload: { paciente_id: string; descripcion: string; intensidad: number }) {
  if (!supabaseConfigured) return { error: new Error("Supabase no configurado") };
  return supabase.from("sintomas").insert({
    paciente_id: payload.paciente_id,
    descripcion: payload.descripcion,
    intensidad: payload.intensidad,
  });
}

export async function contarSintomasIguales(pacienteId: string, descripcion: string, dias: number) {
  if (!supabaseConfigured) return { count: 0 };
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  const norm = descripcion.trim().toLowerCase();
  const { data } = await supabase
    .from("sintomas")
    .select("descripcion")
    .eq("paciente_id", pacienteId)
    .gte("registrado_en", desde.toISOString());

  const count =
    (data ?? []).filter((s) => (s.descripcion as string).trim().toLowerCase() === norm).length;
  return { count };
}
