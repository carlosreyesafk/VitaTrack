import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Perfil, RolUsuario } from "@/types";

export async function actualizarRol(rol: RolUsuario) {
  if (!supabaseConfigured) return { error: new Error("Supabase no configurado") };
  const { data: u } = await supabase.auth.getUser();
  const id = u.user?.id;
  if (!id) return { error: new Error("Sin sesión") };
  const { error } = await supabase.from("perfiles").update({ rol }).eq("id", id);
  return { error };
}

export async function actualizarPerfilPaciente(payload: Partial<Perfil>) {
  if (!supabaseConfigured) return { error: new Error("Supabase no configurado") };
  const { data: u } = await supabase.auth.getUser();
  const id = u.user?.id;
  if (!id) return { error: new Error("Sin sesión") };
  const { error } = await supabase
    .from("perfiles")
    .update({
      nombre_completo: payload.nombre_completo,
      telefono: payload.telefono,
      condicion_medica: payload.condicion_medica,
      contacto_emergencia_nombre: payload.contacto_emergencia_nombre,
      contacto_emergencia_telefono: payload.contacto_emergencia_telefono,
    })
    .eq("id", id);
  return { error };
}

export async function actualizarPerfilDoctor(payload: { nombre_completo?: string; telefono?: string; especialidad?: string }) {
  if (!supabaseConfigured) return { error: new Error("Supabase no configurado") };
  const { data: u } = await supabase.auth.getUser();
  const id = u.user?.id;
  if (!id) return { error: new Error("Sin sesión") };
  const { error } = await supabase.from("perfiles").update(payload).eq("id", id);
  return { error };
}

export async function obtenerPerfilPorId(id: string) {
  if (!supabaseConfigured) return { data: null, error: new Error("Supabase no configurado") };
  return supabase.from("perfiles").select("*").eq("id", id).maybeSingle();
}
