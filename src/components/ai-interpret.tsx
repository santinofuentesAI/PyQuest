"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Exercise } from "@/lib/types";
import type { UserAnswer } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { shuffle } from "@/lib/practice";
import { cn } from "@/lib/utils";

type Phase = "write" | "read" | "ask";

export function AiInterpret({
  exercise,
  onSubmit,
}: {
  exercise: Exercise;
  onSubmit: (answer: UserAnswer) => void;
}) {
  const reduce = useReducedMotion();
  const code = (exercise.starterCode ?? "").replace(/\n+$/, "");
  const questions = exercise.aiQuestions ?? [];
  const [count, setCount] = useState(reduce ? code.length : 0);
  const [phase, setPhase] = useState<Phase>(reduce ? "read" : "write");
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<string[]>(() => questions.map(() => ""));
  const scroller = useRef<HTMLPreElement>(null);
  const writing = phase === "write" && count < code.length;
  const lines = useMemo(() => code.split("\n"), [code]);

  useEffect(() => {
    if (reduce || phase !== "write") return;
    let shown = 0;
    const timer = window.setInterval(() => {
      shown = Math.min(code.length, shown + Math.max(1, Math.ceil(code.length / 90)));
      setCount(shown);
      if (shown >= code.length) {
        window.clearInterval(timer);
        setPhase("read");
      }
    }, 24);
    return () => window.clearInterval(timer);
  }, [code.length, phase, reduce]);

  useEffect(() => {
    if (phase !== "write") return;
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [count, phase]);

  const question = questions[step];
  const choices = useMemo(
    () => (question ? shuffle(question.choices) : []),
    [question]
  );

  function lineOpacity(index: number) {
    if (!writing) return 1;
    const start = lines.slice(0, index).join("\n").length + (index > 0 ? 1 : 0);
    if (count <= start) return 0;
    const age = count - start;
    return Math.max(0.28, Math.min(1, age / 36));
  }

  function scrollDown() {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }

  if (!question && phase === "ask") return null;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">{exercise.prompt}</p>
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
          <p className="text-[11px] font-bold tracking-wide text-zinc-300 uppercase">{exercise.aiLabel ?? "Código hecho por IA"}</p>
          <p className="text-[11px] text-zinc-400" aria-live="polite">
            {writing ? "Escribiendo…" : "Listo para leer"}
          </p>
        </div>
        <div className="relative">
          <pre
            ref={scroller}
            className="max-h-64 overflow-auto px-3 py-3 font-mono text-[13px] leading-6"
            aria-label={exercise.aiLabel ? "Texto generado" : "Código generado"}
          >
            {lines.map((line, index) => {
              const opacity = lineOpacity(index);
              if (opacity === 0) return null;
              const focus = question?.focusLines;
              const framed = phase === "ask" && focus && index + 1 >= focus[0] && index + 1 <= focus[1];
              const dim = phase === "ask" && focus && !framed;
              return (
                <div key={index} className={cn("flex gap-3", dim && "opacity-35", framed && "bg-amber-300/15")} style={{ opacity: phase === "ask" ? undefined : opacity }}>
                  {phase !== "write" ? <span className="w-5 shrink-0 text-right text-zinc-500">{index + 1}</span> : null}
                  <span className={cn(framed && "text-amber-100")}>{line || " "}</span>
                </div>
              );
            })}
            {writing ? <span className="ai-caret ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 bg-emerald-300" /> : null}
          </pre>
          {writing ? <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-zinc-950 to-transparent" /> : null}
          {phase === "read" ? (
            <button
              type="button"
              aria-label={exercise.aiLabel ? "Bajar el texto" : "Bajar el código"}
              onClick={scrollDown}
              className="absolute right-2 bottom-2 flex size-6 items-center justify-center rounded-full border border-white/15 bg-zinc-900/80 text-zinc-300"
            >
              <ChevronDown className="size-3" />
            </button>
          ) : null}
        </div>
      </div>

      {phase === "read" ? (
        <Button className="h-12 w-full rounded-2xl font-bold" onClick={() => setPhase("ask")}>
          Siguiente
        </Button>
      ) : null}

      {phase === "ask" && question ? (
        <div className="space-y-3">
          {question.focusLines ? (
            <p className="text-[11px] font-bold tracking-wide text-amber-700 uppercase dark:text-amber-300">
              Pantallazo · líneas {question.focusLines[0]}–{question.focusLines[1]}
            </p>
          ) : null}
          <p className="text-sm font-semibold leading-relaxed">
            {step + 1}/{questions.length}. {question.prompt}
          </p>
          <div className="grid gap-2" role="radiogroup" aria-label="Opciones">
            {choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                role="radio"
                aria-checked={picks[step] === choice.id}
                onClick={() => setPicks((prev) => prev.map((pick, index) => (index === step ? choice.id : pick)))}
                className={cn(
                  "rounded-2xl border-2 px-4 py-3 text-left text-[15px] font-medium",
                  picks[step] === choice.id ? "border-primary bg-primary/10" : "border-border bg-card"
                )}
              >
                {choice.text}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 ? (
              <Button variant="outline" className="h-12 rounded-2xl" onClick={() => setStep((n) => n - 1)}>
                Anterior
              </Button>
            ) : null}
            {step < questions.length - 1 ? (
              <Button className="h-12 flex-1 rounded-2xl font-bold" disabled={!picks[step]} onClick={() => setStep((n) => n + 1)}>
                Siguiente
              </Button>
            ) : (
              <Button
                className="h-12 flex-1 rounded-2xl font-bold"
                disabled={picks.some((pick) => !pick)}
                onClick={() => onSubmit({ type: "ai_interpret", ids: picks })}
              >
                Comprobar
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
