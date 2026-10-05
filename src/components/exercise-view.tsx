"use client";

import { useMemo, useRef, useState } from "react";
import type { Exercise } from "@/lib/types";
import type { UserAnswer } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { BlockBuilder } from "@/components/block-builder";
import { TraceExercise } from "@/components/trace-exercise";
import { CodeEditor } from "@/components/code-editor";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";
import { PromptText, promptAlreadyShowsCode } from "@/lib/prompt-text";
import { shuffle } from "@/lib/practice";

export function ExerciseView({
  exercise,
  onSubmit,
}: {
  exercise: Exercise;
  onSubmit: (answer: UserAnswer) => void;
}) {
  const showStarter =
    Boolean(exercise.starterCode) &&
    (exercise.type === "find_error" || exercise.type === "predict_output") &&
    !promptAlreadyShowsCode(exercise.prompt, exercise.starterCode);

  return (
    <div className="space-y-4">
      <PromptText exercise={exercise} />
      {showStarter && (
        <pre className="overflow-x-auto rounded-2xl bg-zinc-950 p-3 text-sm leading-6 text-zinc-100">
          <code>{exercise.starterCode}</code>
        </pre>
      )}
      {exercise.type === "multiple_choice" || exercise.type === "find_error" ? (
        <ChoiceForm exercise={exercise} onSubmit={onSubmit} />
      ) : exercise.type === "fill_blank" ? (
        <BlankForm exercise={exercise} onSubmit={onSubmit} />
      ) : exercise.type === "reorder" || exercise.type === "token_order" ? (
        <BlockBuilder exercise={exercise} onSubmit={onSubmit} />
      ) : exercise.type === "trace" ? (
        <TraceExercise exercise={exercise} onSubmit={onSubmit} />
      ) : exercise.type === "matching" ? (
        <MatchForm exercise={exercise} onSubmit={onSubmit} />
      ) : exercise.type === "predict_output" ? (
        <TextForm exercise={exercise} onSubmit={onSubmit} label="¿Qué imprime?" />
      ) : (
        <CodeForm exercise={exercise} onSubmit={onSubmit} />
      )}
    </div>
  );
}

function ChoiceForm({ exercise, onSubmit }: { exercise: Exercise; onSubmit: (a: UserAnswer) => void }) {
  const [id, setId] = useState<string | null>(null);
  const [choices] = useState(() => shuffle(exercise.choices ?? []));
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (id) onSubmit({ type: "choice", id });
      }}
    >
      <div className="grid gap-2" role="radiogroup" aria-label="Opciones">
        {choices.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={id === c.id}
            onClick={() => setId(c.id)}
            className={cn(
              "rounded-2xl border-2 px-4 py-3 text-left text-[15px] font-medium transition",
              id === c.id
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
            )}
          >
            {c.text}
          </button>
        ))}
      </div>
      <CheckButton disabled={!id} />
    </form>
  );
}

function BlankForm({ exercise, onSubmit }: { exercise: Exercise; onSubmit: (a: UserAnswer) => void }) {
  const parts = useMemo(() => (exercise.template ?? "").split("___"), [exercise.template]);
  const n = Math.max(0, parts.length - 1);
  const [values, setValues] = useState<string[]>(() => Array.from({ length: n }, () => ""));
  const [typing, setTyping] = useState(false);
  const [active, setActive] = useState(0);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const [bank] = useState(() => shuffle([...new Set([...(exercise.blanks ?? []).map((b) => b.accepted[0]), ...(exercise.wordBank ?? [])])]));
  function setBlank(value: string) {
    setValues((old) => old.map((v, i) => i === active ? value : v));
    const next = values.findIndex((v, i) => i > active && !v);
    if (next >= 0) setActive(next);
  }
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ type: "blanks", values });
      }}
    >
      <pre className="overflow-x-auto rounded-xl bg-zinc-950 p-3 font-mono text-sm leading-7 text-zinc-100">
        {parts.map((p, i) => (
          <span key={i}>
            {p}
            {i < n && (
              <input
                ref={(el) => { inputs.current[i] = el; }}
                readOnly={!typing}
                onFocus={() => setActive(i)}
                value={values[i] ?? ""}
                onChange={(e) => {
                  const next = [...values];
                  next[i] = e.target.value;
                  setValues(next);
                }}
                aria-label={`Hueco ${i + 1}`}
                style={{ width: `${Math.max(7, Math.min(22, (values[i]?.length ?? 0) + 2))}ch` }}
                className={cn("mx-1 inline-block min-h-11 rounded-md border bg-zinc-900 px-2 py-0.5 text-base text-cyan-200 outline-none focus:ring-2 focus:ring-cyan-400", active === i ? "border-cyan-300 ring-1 ring-cyan-300" : "border-cyan-400/40")}
              />
            )}
          </span>
        ))}
      </pre>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Completar hueco {active + 1}</span>
        <button type="button" onClick={() => setTyping(!typing)} className="min-h-10 rounded-lg border px-3 font-semibold">{typing ? "Usar piezas" : "Escribir yo"}</button>
        <button type="button" onClick={() => setValues((old) => old.map((v, i) => i === active ? "" : v))} className="min-h-10 px-3 font-semibold text-primary">Borrar hueco</button>
      </div>
      {!typing && <div className="flex flex-wrap gap-2" aria-label="Banco de palabras">{bank.map((word) => <button key={word} type="button" onClick={() => setBlank(word)} className="min-h-12 rounded-xl border bg-card px-4 py-2 font-mono text-sm hover:border-primary">{word}</button>)}</div>}
      {typing && <div className="flex flex-wrap gap-1" aria-label="Símbolos para el hueco">{[":", '"', "'", "(", ")", "[", "]", "=", ">", "<", "_", "."].map((symbol) => <button key={symbol} type="button" onPointerDown={(e) => e.preventDefault()} onClick={() => {
        const input = inputs.current[active];
        const start = input?.selectionStart ?? values[active].length, end = input?.selectionEnd ?? start;
        const value = values[active].slice(0, start) + symbol + values[active].slice(end);
        setValues((old) => old.map((v, i) => i === active ? value : v));
        requestAnimationFrame(() => { input?.focus(); input?.setSelectionRange(start + symbol.length, start + symbol.length); });
      }} className="min-h-10 min-w-10 rounded-lg border px-2 font-mono">{symbol}</button>)}</div>}
      <CheckButton disabled={values.some((v) => !v.trim())} />
    </form>
  );
}

function MatchForm({ exercise, onSubmit }: { exercise: Exercise; onSubmit: (a: UserAnswer) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const [left] = useState(() => shuffle(exercise.left ?? []));
  const [right] = useState(() => shuffle(exercise.right ?? []));
  const usedRight = new Set(Object.values(pairs));
  const complete = (exercise.left?.length ?? 0) === Object.keys(pairs).length;

  function pickLeft(id: string) {
    setSel(id);
  }
  function pickRight(id: string) {
    if (!sel) return;
    const next = { ...pairs };
    for (const [k, v] of Object.entries(next)) {
      if (v === id || k === sel) delete next[k];
    }
    next[sel] = id;
    setPairs(next);
    setSel(null);
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ type: "match", pairs });
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {left.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => pickLeft(item.id)}
              className={cn(
                "w-full rounded-xl border-2 px-3 py-2 text-left text-sm font-medium",
                sel === item.id
                  ? "border-primary bg-primary/10"
                  : pairs[item.id]
                    ? "border-emerald-400/60 bg-emerald-50 dark:bg-emerald-950/40"
                    : "border-border"
              )}
            >
              {item.text}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {right.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => pickRight(item.id)}
              aria-pressed={usedRight.has(item.id)}
              className={cn(
                "w-full rounded-xl border-2 px-3 py-2 text-left text-sm",
                usedRight.has(item.id)
                  ? "border-emerald-400/60 bg-emerald-50 dark:bg-emerald-950/40"
                  : "border-border hover:border-primary/40"
              )}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
      <CheckButton disabled={!complete} />
    </form>
  );
}

function TextForm({
  exercise,
  onSubmit,
  label,
}: {
  exercise: Exercise;
  onSubmit: (a: UserAnswer) => void;
  label: string;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ type: "text", value });
      }}
    >
      <label className="block text-sm font-medium">
        {label}
        <textarea
          aria-label="Salida del programa"
          rows={Math.max(2, (exercise.acceptedOutputs?.[0] ?? exercise.expectedStdout ?? "").split("\n").length)}
          spellCheck={false}
          autoCapitalize="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-2 block min-h-24 w-full rounded-xl border bg-background p-3 font-mono text-base leading-7"
          placeholder="Escribe la salida. Usa Enter para separar líneas."
        />
      </label>
      <CheckButton disabled={!value.trim()} />
    </form>
  );
}

function CodeForm({ exercise, onSubmit }: { exercise: Exercise; onSubmit: (a: UserAnswer) => void }) {
  const [code, setCode] = useState(exercise.starterCode ?? "");
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ type: "code", code });
      }}
    >
      {exercise.files && <details className="rounded-xl border bg-muted/30 p-3 text-sm"><summary className="cursor-pointer font-semibold">Ver los datos del ejercicio</summary>{Object.entries(exercise.files).map(([name, content]) => <div key={name} className="mt-3"><p className="font-mono font-bold">{name}</p><pre className="mt-1 overflow-x-auto rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100">{content}</pre></div>)}</details>}
      <CodeEditor value={code} onChange={setCode} words={exercise.prompt.match(/\b[A-Za-z_][A-Za-z_0-9]*\b/g) ?? []} />
      <CheckButton label="Ejecutar y comprobar" disabled={!code.trim()} />
    </form>
  );
}

function CheckButton({ disabled, label = "Comprobar" }: { disabled?: boolean; label?: string }) {
  return (
    <Button
      type="submit"
      disabled={disabled}
      className="h-12 w-full rounded-2xl text-base font-bold tracking-wide"
      size="lg"
    >
      {label}
    </Button>
  );
}

export function Hint({ text }: { text?: string }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 dark:text-amber-300"
      >
        <Lightbulb className="size-4" />
        {open ? "Ocultar pista" : "Pista"}
      </button>
      {open && <p className="mt-1 rounded-xl bg-amber-50 p-3 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">{text}</p>}
    </div>
  );
}
