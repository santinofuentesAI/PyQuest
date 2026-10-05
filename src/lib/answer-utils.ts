export function normalizeOutput(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

/** Keep whitespace inside literals: 'a  b' must not equal 'a b'. */
export function normalizeFragment(value: string) {
  const literals: string[] = [];
  const masked = value.trim().replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g, (literal) => {
    const inner = literal.slice(1, -1);
    literals.push(inner.includes("\\") ? literal : JSON.stringify(inner));
    return `\u0000${literals.length - 1}\u0000`;
  });
  return masked.replace(/\s+/g, " ").replace(/\u0000(\d+)\u0000/g, (_, i) => literals[Number(i)]);
}

export function outputMatches(actual: string, expected: string, mode: "exact" | "numeric" = "exact") {
  const got = normalizeOutput(actual);
  const want = normalizeOutput(expected);
  if (got === want) return true;
  if (mode === "exact") return false;
  const a = got.split("\n");
  const b = want.split("\n");
  const numeric = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
  return a.length === b.length && a.every((line, i) => {
    if (!numeric.test(line) || !numeric.test(b[i])) return false;
    const x = Number(line), y = Number(b[i]);
    return Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y));
  });
}
