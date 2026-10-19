export type RedeemResult = { ok: boolean; message: string; openMap?: boolean };

import type { CourseId } from "./types";

export type RedeemDef =
  | { kind: "hearts"; hearts: number; label: string }
  | { kind: "unlockAll"; label: string }
  | { kind: "course"; courseId: CourseId; label: string };

export const FULL_UNLOCK_CODE = "PERRY2077";

const CODES: Record<string, RedeemDef> = {
  SAUL2017: { kind: "hearts", hearts: 99, label: "99 corazones" },
  [FULL_UNLOCK_CODE]: { kind: "unlockAll", label: "todo el mapa y los encargos desbloqueados" },
  IA25: { kind: "course", courseId: "python-ia", label: "Python para IA desbloqueado" },
  DATOS25: { kind: "course", courseId: "python-datos", label: "Python para análisis de datos desbloqueado" },
  AGENTES25: { kind: "course", courseId: "agentes-ia", label: "Agentes de IA desbloqueado" },
};

export function lookupCode(raw: string) {
  const code = raw.trim().toUpperCase();
  if (!code) return { code, def: null };
  return { code, def: CODES[code] ?? null };
}

export function hasFullUnlock(progress: { unlockAll?: boolean; redeemedCodes?: string[] }) {
  if (progress.unlockAll) return true;
  return (progress.redeemedCodes ?? []).includes(FULL_UNLOCK_CODE);
}
