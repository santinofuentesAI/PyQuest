"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Scene = "prompt" | "tokens" | "engineering";

export function agentScene(lessonId: string): Scene | null {
  if (lessonId === "ag1-prompt") return "prompt";
  if (lessonId === "ag1-tokens") return "tokens";
  if (lessonId === "ag1-engineering") return "engineering";
  return null;
}

const PIECES = [
  { id: "rol", label: "Rol", line: "Eres analista de datos." },
  { id: "tarea", label: "Tarea", line: "Resume el error en 2 frases." },
  { id: "evidencia", label: "Evidencia", line: "El traceback dice KeyError: n." },
  { id: "formato", label: "Formato", line: "Responde con causa y arreglo." },
  { id: "parada", label: "Parada", line: "Para al llegar a 40 tokens." },
] as const;

function useTyped(text: string, reduce: boolean) {
  const [state, setState] = useState({ text, count: 0 });
  useEffect(() => {
    if (reduce) return;
    let shown = 0;
    const timer = window.setInterval(() => {
      shown = Math.min(text.length, shown + 1);
      setState({ text, count: shown });
      if (shown >= text.length) window.clearInterval(timer);
    }, 16);
    return () => window.clearInterval(timer);
  }, [reduce, text]);
  if (reduce) return { shown: text, done: true };
  const count = state.text === text ? state.count : 0;
  return { shown: text.slice(0, count), done: count >= text.length };
}

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <p className="text-[11px] font-bold tracking-wide text-zinc-300 uppercase">{title}</p>
        <p className="text-[11px] text-zinc-500">terminal</p>
      </div>
      <div className="space-y-3 px-3 py-3">{children}</div>
    </div>
  );
}

function Bubble({ who, text, live }: { who: "tú" | "modelo"; text: string; live?: boolean }) {
  return (
    <div className={cn("rounded-xl px-3 py-2 text-sm leading-relaxed", who === "tú" ? "bg-white/10" : "bg-emerald-400/10")}>
      <p className="mb-1 text-[10px] font-bold tracking-wide text-zinc-400 uppercase">{who}</p>
      <p>
        {text}
        {live ? <span className="ai-caret ml-0.5 inline-block h-3.5 w-1 translate-y-0.5 bg-emerald-300" /> : null}
      </p>
    </div>
  );
}

function PromptScene({ reduce }: { reduce: boolean }) {
  const [precise, setPrecise] = useState(false);
  const user = precise
    ? "Eres analista. Resume en 2 frases. Incluye n y la unidad (kg)."
    : "Hazlo bonito e inteligente.";
  const reply = precise ? "n = 12 kg. El lote subió respecto al mes pasado." : "Claro. Aquí va un texto.";
  const typedUser = useTyped(user, reduce);
  const typedReply = useTyped(typedUser.done ? reply : "", reduce);
  return (
    <div className="space-y-3">
      <Shell title="Qué es un prompt">
        <Bubble who="tú" text={typedUser.shown} live={!typedUser.done} />
        {typedUser.done ? <Bubble who="modelo" text={typedReply.shown} live={!typedReply.done} /> : null}
      </Shell>
      <button
        type="button"
        className="text-sm font-bold text-primary"
        onClick={() => setPrecise((value) => !value)}
      >
        {precise ? "Volver al prompt vago" : "Ver un prompt con rol, tarea y formato"}
      </button>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {precise
          ? "El modelo ya sabe el oficio, el largo y el dato que no puede inventar."
          : "Sin rol ni formato, el modelo solo completa una frase amable."}
      </p>
    </div>
  );
}

function TokensScene({ reduce }: { reduce: boolean }) {
  const [splitWord, setSplitWord] = useState(false);
  const typed = useTyped("Resume y cita n", reduce);
  const words = splitWord ? ["Resume", "y", "cita", "anal", "ista"] : ["Resume", "y", "cita", "n"];
  const budget = splitWord ? 5 : 4;
  return (
    <div className="space-y-3">
      <Shell title="Cómo se parten los tokens">
        <Bubble who="tú" text={typed.shown} live={!typed.done} />
        {typed.done ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5" aria-label="Tokens">
              {words.map((word, index) => (
                <span key={`${word}-${index}`} className="rounded-lg bg-emerald-400/15 px-2 py-1 font-mono text-xs text-emerald-100">
                  {word}
                </span>
              ))}
            </div>
            <div>
              <p className="mb-1 text-[11px] font-bold tracking-wide text-zinc-400 uppercase">Presupuesto {budget}/8</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-emerald-300" style={{ width: `${(budget / 8) * 100}%` }} />
              </div>
            </div>
          </div>
        ) : null}
      </Shell>
      <button type="button" className="text-sm font-bold text-primary" onClick={() => setSplitWord((value) => !value)}>
        {splitWord ? "Contar por palabras" : "Partir una palabra en dos tokens"}
      </button>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Un token a veces es una palabra y a veces un trozo. El modelo paga por piezas, no por renglones.
      </p>
    </div>
  );
}

function EngineeringScene() {
  const [on, setOn] = useState<string[]>(["tarea"]);
  const selected = PIECES.filter((piece) => on.includes(piece.id));
  const missingEvidence = !on.includes("evidencia");
  const ready = PIECES.every((piece) => on.includes(piece.id));
  const reply = missingEvidence
    ? "No veo el error. Invento un arreglo."
    : [
        "Causa: falta la clave n.",
        on.includes("formato") ? "Arreglo: define n antes de usarla." : "Hay un fallo, pero no dijiste el formato.",
        on.includes("parada") ? "Paro aquí." : "",
      ]
        .filter(Boolean)
        .join(" ");
  const note = missingEvidence
    ? "Falta la evidencia. El modelo no ve tu pantalla y completa con una suposición."
    : ready
      ? "Con rol, formato y una parada, la respuesta se puede revisar."
      : "Ya hay evidencia. Suma el rol, el formato y la parada.";
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Piezas del prompt">
        {PIECES.map((piece) => {
          const active = on.includes(piece.id);
          return (
            <button
              key={piece.id}
              type="button"
              aria-pressed={active}
              onClick={() =>
                setOn((current) => (current.includes(piece.id) ? current.filter((id) => id !== piece.id) : [...current, piece.id]))
              }
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-bold",
                active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
              )}
            >
              {piece.label}
            </button>
          );
        })}
      </div>
      <Shell title="Prompt engineering">
        <Bubble who="tú" text={selected.map((piece) => piece.line).join(" ") || "…"} />
        <Bubble who="modelo" text={reply} />
      </Shell>
      <p className="text-sm leading-relaxed text-muted-foreground">{note}</p>
    </div>
  );
}

export function AgentTerminal({ lessonId }: { lessonId: string }) {
  const reduce = useReducedMotion() ?? false;
  const scene = agentScene(lessonId);
  if (!scene) return null;
  switch (scene) {
    case "prompt":
      return <PromptScene reduce={reduce} />;
    case "tokens":
      return <TokensScene reduce={reduce} />;
    case "engineering":
      return <EngineeringScene />;
    default: {
      const unsupported: never = scene;
      return unsupported;
    }
  }
}
