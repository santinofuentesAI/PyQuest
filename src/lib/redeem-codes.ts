export type RedeemResult = { ok: boolean; message: string };

const CODES: Record<string, { hearts: number; label: string }> = {
  SAUL2017: { hearts: 99, label: "99 corazones" },
};

export function lookupCode(raw: string) {
  const code = raw.trim().toUpperCase();
  if (!code) return { code, def: null };
  return { code, def: CODES[code] ?? null };
}
