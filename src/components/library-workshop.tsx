"use client";

import { useState } from "react";
import type { Exercise, Unit } from "@/lib/types";
import { CodeEditor } from "@/components/code-editor";
import { ExerciseView, Hint } from "@/components/exercise-view";
import { checkExercise, type UserAnswer } from "@/lib/validators";
import { runPython } from "@/lib/python-runtime";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function WorkedExample({ exercise }: { exercise: Exercise }) {
  const initial = exercise.type === "predict_output" || exercise.type === "trace" ? exercise.starterCode ?? "" : exercise.solution;
  const [code, setCode] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ text: string; error?: string; images?: string[] } | null>(null);
  async function run() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await runPython({ code, files: exercise.files, packages: exercise.packages, capturePlots: true });
      setResult({ text: res.stdout || "El programa terminó sin imprimir. Añade print para observar un valor.", error: res.error ?? undefined, images: res.images });
    } catch { setResult({ text: "", error: "Python no pudo cargar. Revisa la conexión y vuelve a ejecutar." }); }
    finally { setBusy(false); }
  }
  return <div className="space-y-4">
    <div className="rounded-2xl border bg-muted/30 p-4"><p className="text-xs font-bold uppercase text-primary">Qué queremos resolver</p><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{exercise.prompt.replace(/`/g, "")}</p></div>
    <div><h3 className="font-bold">Por qué funciona</h3><p className="mt-2 text-sm leading-relaxed">{exercise.explanation}</p></div>
    {exercise.traceSteps && <ol className="list-decimal space-y-3 pl-5 text-sm">{exercise.traceSteps.map((step, i) => <li key={i}><span className="font-semibold">Línea {step.line}: </span>{step.explanation}<span className="mt-1 block font-mono text-primary">{step.choices.find((c) => c.id === step.correctChoiceId)?.text}</span></li>)}</ol>}
    {exercise.files && <details className="rounded-xl border p-3 text-sm"><summary className="cursor-pointer font-semibold">Datos de entrada</summary>{Object.entries(exercise.files).map(([name, data]) => <div key={name} className="mt-3"><p className="font-mono">{name}</p><pre className="mt-1 overflow-x-auto rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100">{data}</pre></div>)}</details>}
    <CodeEditor value={code} onChange={setCode} height={260} />
    <p className="text-xs text-muted-foreground">Experimenta: cambia un dato y predice qué ocurrirá antes de ejecutar.</p>
    <div className="flex flex-wrap gap-2"><Button type="button" onClick={run} disabled={busy} className="min-h-11 rounded-xl">{busy ? "Ejecutando…" : "Ejecutar ejemplo"}</Button><Button type="button" variant="outline" onClick={() => { setCode(initial); setResult(null); }} className="min-h-11 rounded-xl">Restaurar ejemplo</Button></div>
    {exercise.expectedStdout != null && <details className="text-sm"><summary className="min-h-10 cursor-pointer py-2 font-semibold">Ver salida de referencia</summary><pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono">{exercise.expectedStdout}</pre></details>}
    {result && <div role="status" className="space-y-2 rounded-xl border p-3"><pre className="overflow-x-auto whitespace-pre-wrap text-sm">{result.error ?? result.text}</pre>{result.images?.map((img, i) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img key={i} src={`data:image/png;base64,${img}`} alt="Gráfico del ejemplo" className="max-w-full rounded-xl" />
    ))}</div>}
  </div>;
}

function IndependentPractice({ exercise }: { exercise: Exercise }) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; feedback: string } | null>(null);
  async function check(answer: UserAnswer) {
    if (busy) return;
    setBusy(true);
    try { setFeedback(await checkExercise(exercise, answer)); }
    catch { setFeedback({ correct: false, feedback: "No pudimos comprobarlo. Reintenta." }); }
    finally { setBusy(false); }
  }
  return <div className="space-y-4">
    <p className="text-xs text-muted-foreground">Práctica libre: sin corazones, sin bloqueo por nivel. Puedes corregir y comprobar de nuevo.</p>
    <fieldset disabled={busy} className="min-w-0"><ExerciseView exercise={exercise} onSubmit={check} /></fieldset>
    <Hint text={exercise.hint} />
    {busy && <p role="status" className="text-sm">Comprobando…</p>}
    {feedback && <div role="status" className={cn("rounded-xl border p-4 text-sm", feedback.correct ? "border-emerald-400 bg-emerald-500/10" : "border-amber-400 bg-amber-500/10")}><p className="font-bold">{feedback.correct ? "¡Lo resolviste!" : "Revisa y vuelve a probar"}</p><p className="mt-2 whitespace-pre-wrap leading-relaxed">{feedback.feedback}</p></div>}
    <details className="rounded-xl border p-3 text-sm"><summary className="min-h-10 cursor-pointer py-2 font-semibold">Ver solución razonada</summary><p className="mt-2 leading-relaxed">{exercise.explanation}</p><pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-zinc-950 p-3 font-mono text-zinc-100">{exercise.solution}</pre></details>
  </div>;
}

export function LibraryWorkshop({ unit }: { unit: Unit }) {
  const exercises = unit.lessons.flatMap((lesson) => lesson.exercises);
  const examples = exercises.filter((e) => ["code", "data", "predict_output", "trace"].includes(e.type));
  const [mode, setMode] = useState<"examples" | "practice">("examples");
  const [exampleId, setExampleId] = useState(examples[0]?.id ?? "");
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? "");
  const selected = mode === "examples" ? examples.find((e) => e.id === exampleId) : exercises.find((e) => e.id === exerciseId);
  return <section className="mt-8 min-w-0 rounded-3xl border bg-card p-4 sm:p-6">
    <p className="text-xs font-bold uppercase tracking-widest text-primary">Aprende haciendo</p>
    <h2 className="mt-1 text-2xl font-extrabold">Tu taller de {unit.title}</h2>
    <p className="mt-2 text-sm text-muted-foreground">{examples.length} ejemplos ejecutables · {exercises.length} ejercicios de los cinco niveles.</p>
    <div className="my-5 flex flex-wrap gap-2" aria-label="Modo del taller">
      <button type="button" aria-pressed={mode === "examples"} onClick={() => setMode("examples")} className={cn("min-h-11 rounded-xl border px-4 text-sm font-bold", mode === "examples" && "border-primary bg-primary/10 text-primary")}>Ejemplos resueltos</button>
      <button type="button" aria-pressed={mode === "practice"} onClick={() => setMode("practice")} className={cn("min-h-11 rounded-xl border px-4 text-sm font-bold", mode === "practice" && "border-primary bg-primary/10 text-primary")}>Resolver ejercicios</button>
    </div>
    <label className="mb-5 block text-sm font-semibold">{mode === "examples" ? "Elige un ejemplo" : "Elige un reto"}
      <select aria-label={mode === "examples" ? "Elige un ejemplo" : "Elige un reto"} value={mode === "examples" ? exampleId : exerciseId} onChange={(e) => mode === "examples" ? setExampleId(e.target.value) : setExerciseId(e.target.value)} className="mt-2 min-h-12 w-full min-w-0 max-w-full rounded-xl border bg-background p-3 text-sm">
        {(mode === "examples" ? examples : exercises).map((e, i) => <option key={e.id} value={e.id}>{i + 1}. {e.prompt.replace(/`/g, "").slice(0, 100)}</option>)}
      </select>
    </label>
    {selected && (mode === "examples" ? <WorkedExample key={selected.id} exercise={selected} /> : <IndependentPractice key={selected.id} exercise={selected} />)}
  </section>;
}
