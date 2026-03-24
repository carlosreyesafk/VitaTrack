export function formatoFechaHora(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-DO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function horaProximaDesdeHorarios(horarios: string[]): string | null {
  if (!horarios?.length) return null;
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const sorted = [...horarios].sort();
  for (const h of sorted) {
    const [hh, mm] = h.split(":").map(Number);
    const t = new Date(`${today}T${String(hh).padStart(2, "0")}:${String(mm ?? 0).padStart(2, "0")}:00`);
    if (t > now) return t.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" });
  }
  return sorted[0]
    ? `Mañana ${sorted[0]}`
    : null;
}
