import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Alerta } from "@/types";
import {
  consolidarAlertasLocales,
  evaluarAbandonoTratamiento,
  evaluarDosisOmitidas,
  evaluarPresionRepetida,
  evaluarSintomasRepetidos,
} from "@/lib/alertEngine";
import { contarDosisOmitidasRecientes } from "@/services/medicamentos";
import { ultimasLecturasPresion } from "@/services/signos";
import { contarSintomasIguales } from "@/services/sintomas";

export async function listarAlertas(pacienteId: string) {
  if (!supabaseConfigured) return { data: [] as Alerta[], error: null };
  return supabase
    .from("alertas")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("created_at", { ascending: false })
    .limit(50);
}

export async function marcarAlertaLeida(id: string) {
  if (!supabaseConfigured) return { error: new Error("Supabase no configurado") };
  return supabase.from("alertas").update({ leida: true }).eq("id", id);
}

export async function generarYGuardarAlertasLocales(pacienteId: string, sintomaReciente?: string) {
  if (!supabaseConfigured) return;

  const { count: omitidas } = await contarDosisOmitidasRecientes(pacienteId, 7);
  const presion = await ultimasLecturasPresion(pacienteId, 5);
  let sintomaVeces = 0;
  if (sintomaReciente) {
    const r = await contarSintomasIguales(pacienteId, sintomaReciente, 14);
    sintomaVeces = r.count;
  }

  const generadas = consolidarAlertasLocales([
    evaluarAbandonoTratamiento(omitidas),
    evaluarDosisOmitidas(omitidas),
    evaluarPresionRepetida(presion.slice(0, 3)),
    sintomaReciente ? evaluarSintomasRepetidos(sintomaReciente, sintomaVeces) : null,
  ]);

  for (const g of generadas) {
    const { data: dup } = await supabase
      .from("alertas")
      .select("id")
      .eq("paciente_id", pacienteId)
      .eq("tipo", g.tipo)
      .gte("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString())
      .maybeSingle();
    if (dup) continue;

    await supabase.from("alertas").insert({
      paciente_id: pacienteId,
      tipo: g.tipo,
      titulo: g.titulo,
      mensaje: g.mensaje,
      severidad: g.severidad,
      generada_por: "local",
    });
  }
}

export async function alertasParaDoctor() {
  if (!supabaseConfigured) return { data: [] as Alerta[], error: null };
  const { data: u } = await supabase.auth.getUser();
  const doctorId = u.user?.id;
  if (!doctorId) return { data: [], error: null };

  const { data: vinculos } = await supabase
    .from("doctor_pacientes")
    .select("paciente_id")
    .eq("doctor_id", doctorId);

  const ids = (vinculos ?? []).map((v) => v.paciente_id as string);
  if (ids.length === 0) return { data: [], error: null };

  return supabase
    .from("alertas")
    .select("*")
    .in("paciente_id", ids)
    .order("created_at", { ascending: false })
    .limit(100);
}
