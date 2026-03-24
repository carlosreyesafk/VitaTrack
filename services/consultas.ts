import { supabase, supabaseConfigured } from "@/lib/supabase";

export async function enviarConsultaRapida(payload: {
  paciente_id: string;
  asunto: string;
  mensaje: string;
  doctor_id?: string | null;
}) {
  if (!supabaseConfigured) return { error: new Error("Supabase no configurado") };
  return supabase.from("consultas_rapidas").insert({
    paciente_id: payload.paciente_id,
    asunto: payload.asunto,
    mensaje: payload.mensaje,
    doctor_id: payload.doctor_id ?? null,
  });
}
