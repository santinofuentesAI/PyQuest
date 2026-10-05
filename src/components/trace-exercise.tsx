"use client";

import { useState } from "react";
import type { Exercise } from "@/lib/types";
import type { UserAnswer } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TraceExercise({ exercise, onSubmit }: { exercise: Exercise; onSubmit: (a: UserAnswer) => void }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const steps = exercise.traceSteps ?? [];
  const step = steps[i];
  if (!step) return null;
  return <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit({ type: "match", pairs: answers }); }}>
    <p className="text-sm text-muted-foreground">Sigue la ejecución y predice qué cambia en cada punto. Puedes volver a cualquier paso.</p>
    <pre className="overflow-x-auto rounded-2xl bg-zinc-950 p-3 font-mono text-sm leading-7 text-zinc-100">
      {(exercise.starterCode ?? "").split("\n").map((line, index) => <span key={index} className={cn("block rounded px-2", index + 1 === step.line && "bg-cyan-900 text-cyan-100")}><span className="mr-3 text-zinc-400">{index + 1}</span>{line || " "}</span>)}
    </pre>
    <div className="flex flex-wrap gap-2" aria-label="Pasos de ejecución">{steps.map((_, index) => <button key={index} type="button" onClick={() => setI(index)} aria-current={i === index ? "step" : undefined} className={cn("min-h-10 min-w-10 rounded-xl border font-semibold", i === index && "border-primary bg-primary/10", answers[String(index)] && "ring-1 ring-primary/40")}>{index + 1}</button>)}</div>
    <p className="font-semibold">Paso {i + 1}: {step.question}</p>
    <div className="grid gap-2">{step.choices.map((choice) => <button key={choice.id} type="button" aria-pressed={answers[String(i)] === choice.id} onClick={() => setAnswers({ ...answers, [String(i)]: choice.id })} className={cn("min-h-12 rounded-xl border-2 p-3 text-left font-mono text-sm", answers[String(i)] === choice.id ? "border-primary bg-primary/10" : "border-border")}>{choice.text}</button>)}</div>
    <div className="flex gap-2"><Button type="button" variant="outline" disabled={i === 0} onClick={() => setI(i - 1)}>Paso anterior</Button><Button type="button" variant="outline" disabled={i === steps.length - 1 || !answers[String(i)]} onClick={() => setI(i + 1)}>Paso siguiente</Button></div>
    <Button type="submit" disabled={Object.keys(answers).length !== steps.length} className="h-12 w-full rounded-2xl font-bold">Comprobar el recorrido</Button>
  </form>;
}
