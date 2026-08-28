import type { Exercise } from "@/lib/types";

type PromptPart =
  | { kind: "text"; text: string }
  | { kind: "inline"; text: string }
  | { kind: "fence"; lang: string; code: string };

const FENCE_RE = /```([a-zA-Z0-9_+-]*)[ \t]*\r?\n?([\s\S]*?)```/g;

function parseInline(text: string): PromptPart[] {
  const parts: PromptPart[] = [];
  const re = /`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ kind: "text", text: text.slice(last, m.index) });
    parts.push({ kind: "inline", text: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ kind: "text", text: text.slice(last) });
  return parts;
}

export function parsePrompt(raw: string): PromptPart[] {
  const parts: PromptPart[] = [];
  const re = new RegExp(FENCE_RE.source, "g");
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    if (m.index > last) parts.push(...parseInline(raw.slice(last, m.index)));
    parts.push({
      kind: "fence",
      lang: m[1] || "python",
      code: m[2].replace(/^\r?\n/, "").replace(/\r?\n$/, ""),
    });
    last = m.index + m[0].length;
  }
  if (last < raw.length) parts.push(...parseInline(raw.slice(last)));
  return parts;
}

function compact(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

export function promptAlreadyShowsCode(prompt: string, code?: string) {
  if (/```/.test(prompt)) return true;
  if (!code?.trim()) return false;
  return compact(prompt).includes(compact(code));
}

function fallbackQuestion(exercise: Exercise, parts: PromptPart[]) {
  const visible = parts.filter((p) => p.kind !== "text" || p.text.trim());
  const onlyCode = visible.length > 0 && visible.every((p) => p.kind === "fence");
  if (!onlyCode) return null;
  if (exercise.type === "find_error") return "¿Qué está mal en este código?";
  if (exercise.type === "predict_output") return "¿Qué imprime este código?";
  return "Mira este código:";
}

export function PromptText({ exercise }: { exercise: Exercise }) {
  const parts = parsePrompt(exercise.prompt);
  const heading = fallbackQuestion(exercise, parts);

  return (
    <div className="space-y-3">
      {heading ? <p className="text-[17px] leading-relaxed font-medium">{heading}</p> : null}
      <div className="text-[17px] leading-relaxed font-medium">
        {parts.map((part, i) => {
          if (part.kind === "text") {
            return (
              <span key={i} className="whitespace-pre-wrap">
                {part.text}
              </span>
            );
          }
          if (part.kind === "inline") {
            return (
              <code
                key={i}
                className="mx-0.5 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[15px] font-semibold"
              >
                {part.text}
              </code>
            );
          }
          return (
            <pre
              key={i}
              className="my-3 overflow-x-auto rounded-2xl bg-zinc-950 p-3 font-mono text-sm leading-6 font-normal text-zinc-100"
            >
              <code>{part.code}</code>
            </pre>
          );
        })}
      </div>
    </div>
  );
}
