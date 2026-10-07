import type { ExerciseType, LessonResult } from "@/lib/types";

export const EXERCISE_GUIDES: Record<ExerciseType, { label: string; tip: string }> = {
  multiple_choice: { label: "Elige", tip: "Lee las opciones y elige la que explica mejor la idea." },
  find_error: { label: "Investiga", tip: "Encuentra la causa del error, no solo la línea que lo muestra." },
  fill_blank: { label: "Completa", tip: "Toca una pieza para llenar el hueco. También puedes escribir tú." },
  code: { label: "Programa", tip: "Escribe, ejecuta y observa. Los símbolos te ayudan a escribir Python." },
  data: { label: "Explora datos", tip: "Revisa los datos de entrada antes de escribir tu solución." },
  predict_output: { label: "Predice", tip: "Sigue el programa en orden. Conserva los saltos de línea de la salida." },
  matching: { label: "Conecta", tip: "Toca una idea a la izquierda y después su pareja a la derecha." },
  reorder: { label: "Ordena", tip: "Mueve las líneas hasta que el programa tenga sentido." },
  token_order: { label: "Construye", tip: "Toca las piezas y ordénalas. Puedes arrastrar o usar las flechas." },
  trace: { label: "Sigue la ejecución", tip: "Observa qué cambia en cada línea y resuelve los puntos de control." },
};

export function lessonsToday(results: Record<string, LessonResult>, now = new Date()): number {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  return Object.values(results).filter((r) => { const time = Date.parse(r.completedAt); return time >= start && time < end; }).length;
}
