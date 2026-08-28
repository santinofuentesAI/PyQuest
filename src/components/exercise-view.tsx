"use client";

import { useMemo, useState } from "react";
import type { Exercise } from "@/lib/types";
import type { UserAnswer } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeEditor } from "@/components/code-editor";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

export function ExerciseView({
  exercise,
  onSubmit,
}: {
  exercise: Exercise;
  onSubmit: (answer: UserAnswer) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="prose-prompt text-[17px] leading-relaxed font-medium whitespace-pre-wrap">
        {exercise.prompt}
      </div>
      {exercise.starterCode &&
        (exercise.type === "find_error" || exercise.type === "predict_output") && (
          <pre className="overflow-x-auto rounded-xl bg-zinc-950 p-3 text-sm text-zinc-100">
            <code>{exercise.starterCode}</code>
          </pre>
        )}
      {exercise.type === "multiple_choice" || exercise.type === "find_error" ? (
        <ChoiceForm exercise={exercise} onSubmit={onSubmit} />
      ) : exercise.type === "fill_blank" ? (
        <BlankForm exercise={exercise} onSubmit={onSubmit} />
      ) : exercise.type === "reorder" ? (
        <ReorderForm exercise={exercise} onSubmit={onSubmit} />
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
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (id) onSubmit({ type: "choice", id });
      }}
    >
      <div className="grid gap-2" role="radiogroup" aria-label="Opciones">
        {exercise.choices?.map((c) => (
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
                value={values[i] ?? ""}
                onChange={(e) => {
                  const next = [...values];
                  next[i] = e.target.value;
                  setValues(next);
                }}
                aria-label={`Hueco ${i + 1}`}
                className="mx-1 inline-block min-w-[5rem] rounded-md border border-cyan-400/60 bg-zinc-900 px-2 py-0.5 text-cyan-200 outline-none focus:ring-2 focus:ring-cyan-400"
              />
            )}
          </span>
        ))}
      </pre>
      <CheckButton disabled={values.some((v) => !v.trim())} />
    </form>
  );
}

function ReorderForm({ exercise, onSubmit }: { exercise: Exercise; onSubmit: (a: UserAnswer) => void }) {
  const [pool, setPool] = useState(() => [...(exercise.blocks ?? [])]);
  const [picked, setPicked] = useState<typeof pool>([]);
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ type: "order", ids: picked.map((b) => b.id) });
      }}
    >
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Toca para armar el orden
      </p>
      <div className="min-h-16 space-y-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-2">
        {picked.length === 0 && (
          <p className="px-2 py-3 text-center text-sm text-muted-foreground">Tu script irá aquí</p>
        )}
        {picked.map((b, i) => (
          <button
            key={b.id + i}
            type="button"
            onClick={() => {
              setPicked(picked.filter((_, j) => j !== i));
              setPool([...pool, b]);
            }}
            className="block w-full rounded-xl bg-zinc-950 px-3 py-2 text-left font-mono text-sm text-cyan-100"
          >
            {b.code}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {pool.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => {
              setPool(pool.filter((x) => x.id !== b.id));
              setPicked([...picked, b]);
            }}
            className="block w-full rounded-xl border bg-card px-3 py-2 text-left font-mono text-sm hover:border-primary/50"
          >
            {b.code}
          </button>
        ))}
      </div>
      <CheckButton disabled={picked.length !== (exercise.blocks?.length ?? 0)} />
    </form>
  );
}

function MatchForm({ exercise, onSubmit }: { exercise: Exercise; onSubmit: (a: UserAnswer) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, string>>({});
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
          {exercise.left?.map((item) => (
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
          {exercise.right?.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => pickRight(item.id)}
              disabled={usedRight.has(item.id) && !Object.values(pairs).includes(item.id)}
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
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 h-11 font-mono"
          placeholder="Escribe la salida exacta"
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
      <CodeEditor value={code} onChange={setCode} />
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
