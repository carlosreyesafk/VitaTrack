import type { TipoAlerta, SeveridadAlerta } from "@/types";

export type AlertaGenerada = {
  tipo: TipoAlerta;
  titulo: string;
  mensaje: string;
  severidad: SeveridadAlerta;
};

const UMBRAL_DOSIS_OMITIDAS = 3;
const UMBRAL_PAS = 140;
const UMBRAL_PAD = 90;
const UMBRAL_SINTOMAS_IGUALES = 3;

export function evaluarAbandonoTratamiento(dosisOmitidasConsecutivas: number): AlertaGenerada | null {
  if (dosisOmitidasConsecutivas < UMBRAL_DOSIS_OMITIDAS) return null;
  return {
    tipo: "abandono_tratamiento",
    titulo: "Posible abandono del tratamiento",
    mensaje:
      "Llevamos varias dosis sin registrar. Habla con tu médico o con tu familia si necesitas apoyo para seguir el plan.",
    severidad: "advertencia",
  };
}

export function evaluarDosisOmitidas(dosisOmitidasRecientes: number): AlertaGenerada | null {
  if (dosisOmitidasRecientes < UMBRAL_DOSIS_OMITIDAS) return null;
  return {
    tipo: "dosis_omitidas",
    titulo: "Dosis omitidas",
    mensaje:
      "Se detectaron varias dosis no tomadas según tu horario. Intenta ponerte al día y avisa a tu equipo de salud.",
    severidad: "advertencia",
  };
}

export function evaluarPresionRepetida(
  lecturas: { sistolica: number; diastolica: number }[]
): AlertaGenerada | null {
  const altas = lecturas.filter((l) => l.sistolica >= UMBRAL_PAS || l.diastolica >= UMBRAL_PAD);
  if (altas.length < 2) return null;
  return {
    tipo: "presion_elevada",
    titulo: "Presión elevada detectada",
    mensaje:
      "Varias lecturas seguidas están por encima de lo habitual. Reposa y vuelve a medir; si persiste, busca orientación médica.",
    severidad: "urgente",
  };
}

export function evaluarSintomasRepetidos(descripcionNormalizada: string, veces: number): AlertaGenerada | null {
  if (veces < UMBRAL_SINTOMAS_IGUALES || !descripcionNormalizada.trim()) return null;
  return {
    tipo: "sintomas_repetidos",
    titulo: "Síntomas repetidos",
    mensaje:
      "Has registrado varias veces un síntoma parecido. Conviene comentarlo con tu médico en la próxima consulta o antes si empeora.",
    severidad: "info",
  };
}

export function consolidarAlertasLocales(generadas: (AlertaGenerada | null)[]): AlertaGenerada[] {
  return generadas.filter(Boolean) as AlertaGenerada[];
}
