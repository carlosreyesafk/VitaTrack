import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Perfil } from "@/types";
import { adherenciaUltimosDias } from "@/services/medicamentos";

export async function listarPacientesVinculados() {
  if (!supabaseConfigured) return { data: [] as Perfil[], error: null };
  const { data: u } = await supabase.auth.getUser();
  const doctorId = u.user?.id;
  if (!doctorId) return { data: [], error: null };

  const { data: links, error } = await supabase
    .from("doctor_pacientes")
    .select("paciente_id")
    .eq("doctor_id", doctorId);

  if (error) return { data: [], error };
  const ids = (links ?? []).map((l) => l.paciente_id as string);
  if (ids.length === 0) return { data: [], error: null };

  const { data: perfiles, error: e2 } = await supabase.from("perfiles").select("*").in("id", ids);
  return { data: (perfiles ?? []) as Perfil[], error: e2 };
}

export async function vincularPaciente(pacienteEmail: string) {
  if (!supabaseConfigured) return { error: new Error("Supabase no configurado") };
  const { data: u } = await supabase.auth.getUser();
  const doctorId = u.user?.id;
  if (!doctorId) return { error: new Error("Sin sesión") };

  const { data: usuario } = await supabase.from("usuarios").select("id").eq("email", pacienteEmail.trim()).maybeSingle();
  if (!usuario) return { error: new Error("No encontramos un usuario con ese correo") };

  const pacienteId = usuario.id as string;
  const { error } = await supabase.from("doctor_pacientes").insert({
    doctor_id: doctorId,
    paciente_id: pacienteId,
  });
  return { error };
}

export async function prioridadPaciente(pacienteId: string): Promise<"baja" | "media" | "alta"> {
  if (!supabaseConfigured) return "baja";
  const { pct } = await adherenciaUltimosDias(pacienteId, 14);
  const { data: alertas } = await supabase
    .from("alertas")
    .select("severidad,leida")
    .eq("paciente_id", pacienteId)
    .eq("leida", false)
    .limit(20);

  const urgentes = (alertas ?? []).filter((a) => a.severidad === "urgente").length;
  if (urgentes >= 1 || pct < 50) return "alta";
  if (pct < 75 || (alertas ?? []).length >= 2) return "media";
  return "baja";
}
