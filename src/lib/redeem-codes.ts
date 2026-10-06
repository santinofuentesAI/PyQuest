export type RedeemResult = { ok: boolean; message: string; openMap?: boolean };

export type RedeemDef =
  | { kind: "hearts"; hearts: number; label: string }
  | { kind: "unlockAll"; label: string };

export const FULL_UNLOCK_CODE = "PERRY2077";

const CODES: Record<string, RedeemDef> = {
  SAUL2017: { kind: "hearts", hearts: 99, label: "99 corazones" },
  [FULL_UNLOCK_CODE]: { kind: "unlockAll", label: "todo el mapa y los encargos desbloqueados" },
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
