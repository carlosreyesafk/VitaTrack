/**
 * Punto de integración futura con Gemini API.
 * No envía datos aún; centraliza el contrato para la demo.
 */

export type GeminiInsightInput = {
  contextoPaciente: string;
  sintomasRecientes: string[];
  signosResumen: string;
};

export type GeminiInsightResult = {
  sugerencia: string;
  disclaimer: string;
};

const DISCLAIMER =
  "Esta sugerencia es informativa y no sustituye la opinión de un profesional de salud.";

export async function solicitarInsightGemini(
  _input: GeminiInsightInput
): Promise<GeminiInsightResult> {
  return {
    sugerencia:
      "La integración con Gemini estará disponible próximamente. Por ahora, consulta con tu médico ante cualquier duda.",
    disclaimer: DISCLAIMER,
  };
}
