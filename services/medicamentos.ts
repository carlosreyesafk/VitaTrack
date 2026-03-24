import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Medicamento } from "@/types";

function mapMed(row: Record<string, unknown>): Medicamento {
  const horariosRaw = row.horarios;
  const horarios = Array.isArray(horariosRaw)
    ? (horariosRaw as string[])
    : JSON.parse(String(horariosRaw ?? "[]"));
  return { ...(row as unknown as Medicamento), horarios };
}

export async function listarMedicamentos(pacienteId: string) {
  if (!supabaseConfigured) return { data: [] as Medicamento[], error: null };
  const { data, error } = await supabase
    .from("medicamentos")
    .select("*")
    .eq("paciente_id", pacienteId)
    .eq("activo", true)
    .order("nombre");
  return { data: (data ?? []).map(mapMed), error };
}

export async function crearMedicamento(payload: {
  paciente_id: string;
  nombre: string;
  dosis: string;
  frecuencia: string;
  horarios: string[];
}) {
  if (!supabaseConfigured) return { error: new Error("Supabase no configurado") };
  const { error } = await supabase.from("medicamentos").insert({
    paciente_id: payload.paciente_id,
    nombre: payload.nombre,
    dosis: payload.dosis,
    frecuencia: payload.frecuencia,
    horarios: payload.horarios,
  });
  return { error };
}

export async function actualizarMedicamento(
  id: string,
  payload: Partial<Pick<Medicamento, "nombre" | "dosis" | "frecuencia" | "horarios" | "activo">>
) {
  if (!supabaseConfigured) return { error: new Error("Supabase no configurado") };
  const { error } = await supabase.from("medicamentos").update(payload).eq("id", id);
  return { error };
}

export async function eliminarMedicamento(id: string) {
  return actualizarMedicamento(id, { activo: false });
}

export async function registrarToma(medicamentoId: string, fecha: string, horaProgramada: string | null) {
  if (!supabaseConfigured) return { error: new Error("Supabase no configurado") };
  const { error } = await supabase.from("registro_medicamentos").insert({
    medicamento_id: medicamentoId,
    fecha,
    hora_programada: horaProgramada,
    tomado: true,
    tomado_at: new Date().toISOString(),
  });
  return { error };
}

/**
 * Cuenta filas en `registro_medicamentos` con `tomado = false`.
 * Hoy solo se crean filas al marcar «Lo tomé» (tomado true); para que esta métrica refleje omisiones reales,
 * en una siguiente iteración se pueden insertar registros esperados o inferir brechas vs horarios.
 */
export async function contarDosisOmitidasRecientes(pacienteId: string, dias: number) {
  if (!supabaseConfigured) return { count: 0, error: null };
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  const { data: meds } = await supabase.from("medicamentos").select("id").eq("paciente_id", pacienteId).eq("activo", true);
  const ids = (meds ?? []).map((m) => m.id as string);
  if (ids.length === 0) return { count: 0, error: null };

  const { data: regs } = await supabase
    .from("registro_medicamentos")
    .select("id,tomado,fecha")
    .in("medicamento_id", ids)
    .gte("fecha", desde.toISOString().slice(0, 10));

  const omitidas = (regs ?? []).filter((r) => !r.tomado).length;
  return { count: omitidas, error: null };
}

export async function adherenciaUltimosDias(pacienteId: string, dias: number) {
  if (!supabaseConfigured) return { pct: 0, tomadas: 0, esperadas: 0 };
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  const { data: meds } = await supabase
    .from("medicamentos")
    .select("id,horarios")
    .eq("paciente_id", pacienteId)
    .eq("activo", true);
  if (!meds?.length) return { pct: 100, tomadas: 0, esperadas: 0 };

  let esperadas = 0;
  for (const m of meds) {
    const hrs = Array.isArray(m.horarios) ? m.horarios : JSON.parse(String(m.horarios ?? "[]"));
    esperadas += Math.max(1, (hrs as string[]).length) * dias;
  }

  const ids = meds.map((m) => m.id as string);
  const { data: regs } = await supabase
    .from("registro_medicamentos")
    .select("tomado")
    .in("medicamento_id", ids)
    .gte("fecha", desde.toISOString().slice(0, 10));

  const tomadas = (regs ?? []).filter((r) => r.tomado).length;
  const pct = esperadas === 0 ? 100 : Math.min(100, Math.round((tomadas / esperadas) * 100));
  return { pct, tomadas, esperadas };
}
