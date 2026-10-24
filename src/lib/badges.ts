import type { BadgeDef } from "./types";

export function howToEarn(badge: BadgeDef, unitTitle?: string): string {
  switch (badge.check) {
    case "placement":
      return "Entra y da el primer paso: completa el test de nivel o una clase.";
    case "unit":
      return `Completa todas las lecciones del tema ${unitTitle ?? "de esta ruta"}.`;
    case "streak":
      return `Practica ${badge.value} días seguidos, sin saltarte uno.`;
    case "xp":
      return `Junta ${badge.value} XP terminando clases.`;
    case "perfect":
      return "Termina una lección sin fallar ninguna pregunta al primer intento.";
    case "section":
      return "Completa la sección que pide esta insignia.";
    default: {
      const unsupported: never = badge.check;
      return unsupported;
    }
  }
}
