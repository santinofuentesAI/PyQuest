"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Unit } from "@/lib/types";
import { checkExercise, type UserAnswer } from "@/lib/validators";
import { ExerciseView } from "@/components/exercise-view";
import { Button } from "@/components/ui/button";
import { PythonStatus } from "@/components/python-status";
import { Pybot } from "@/components/pybot";
import { useProgress } from "@/lib/progress-store";
import { buildSkipExam, SKIP_EXAM_PASS, SKIP_EXAM_SIZE, skipDifficultyLabel } from "@/lib/skip-exam";
import { preloadPython } from "@/lib/python-runtime";
import { cn } from "@/lib/utils";

export function SkipExamPlayer({ unit }: { unit: Unit }) {
  const exam = buildSkipExam(unit.id);
  const apply = useProgress((s) => s.applySkipExam);
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string; retryable?: boolean } | null>(null);
  const [outcome, setOutcome] = useState<{ passed: boolean; score: number; needed: number } | null>(null);
  const scoreRef = useRef(0);
  const exercise = exam?.exercises[i];

  async function submit(answer: UserAnswer) {
    if (!exercise || busy || feedback) return;
    if (exercise.type === "code" || exercise.type === "data") preloadPython();
    setBusy(true);
    const result = await checkExercise(exercise, answer);
    if (result.retryable) {
      setFeedback({ correct: false, text: result.feedback, retryable: true });
      setBusy(false);
      return;
    }
    setFeedback({ correct: result.correct, text: result.feedback });
    if (result.correct) scoreRef.current += 1;
    setBusy(false);
  }

  function advance() {
    if (feedback?.retryable) {
      setFeedback(null);
      return;
    }
    if (!exam) return;
    if (i + 1 >= exam.exercises.length) {
      const result = apply(unit.id, scoreRef.current, exam.exercises.length);
      setOutcome({ passed: result.passed, score: result.score, needed: result.needed });
      return;
    }
    setI(i + 1);
    setFeedback(null);
  }

  function retry() {
    scoreRef.current = 0;
    setI(0);
    setFeedback(null);
    setOutcome(null);
    setStarted(true);
  }

  if (!exam) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="font-heading text-2xl font-extrabold">Este salto no está listo</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sigue el camino del mapa o completa el tema anterior.</p>
        <Button className="mt-4 h-12 rounded-2xl font-bold" render={<Link href="/learn" />}>
          Volver al mapa
        </Button>
      </div>
    );
  }

  if (outcome) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center px-6 py-12 text-center">
        <Pybot mood={outcome.passed ? "celebrate" : "encourage"} size="lg" />
        <p className="mt-4 text-xs font-bold tracking-widest text-primary uppercase">Examen de salto</p>
        <h1 className="font-heading mt-2 text-3xl font-extrabold">
          {outcome.passed ? `Puedes entrar a ${unit.title}` : "Aún no saltas este tema"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {outcome.score}/{SKIP_EXAM_SIZE} aciertos. Para abrir el módulo hacen falta {outcome.needed}.
        </p>
        <div className="mt-6 flex w-full flex-col gap-2">
          {outcome.passed ? (
            <Button className="h-12 rounded-2xl font-bold" render={<Link href={`/unit/${unit.id}`} />}>
              Ir al módulo
            </Button>
          ) : (
            <Button className="h-12 rounded-2xl font-bold" onClick={retry}>
              Reintentar examen
            </Button>
          )}
          <Button variant="outline" className="h-12 rounded-2xl font-bold" render={<Link href="/learn" />}>
            Volver al mapa
          </Button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-6 py-12">
        <Link href="/learn" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <ArrowLeft className="size-4" /> Mapa
        </Link>
        <Pybot mood="wave" size="lg" className="mx-auto" />
        <p className="mt-4 text-xs font-bold tracking-widest text-primary uppercase">Saltar a un módulo</p>
        <h1 className="font-heading mt-2 text-3xl font-extrabold">{unit.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {SKIP_EXAM_SIZE} preguntas o código, de fácil a difícil, sobre lo que hay antes de este tema. Necesitas{" "}
          {SKIP_EXAM_PASS} aciertos. No gastas corazones: si no llegas, el módulo sigue cerrado.
        </p>
        <Button className="mt-6 h-12 rounded-2xl font-bold" onClick={() => { setStarted(true); preloadPython(); }}>
          Empezar examen
        </Button>
      </div>
    );
  }

  if (!exercise) return null;

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col">
      <header className="px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold tracking-wider text-primary uppercase">Examen de salto</p>
          <p className="text-xs font-bold text-muted-foreground">{skipDifficultyLabel(exercise.difficulty)}</p>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${(i / exam.exercises.length) * 100}%` }} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {i + 1}/{exam.exercises.length} · {SKIP_EXAM_PASS} para pasar · sin corazones
        </p>
      </header>
      <div className="flex-1 px-4 pb-28">
        {(exercise.type === "code" || exercise.type === "data") ? <PythonStatus className="mb-3" /> : null}
        <ExerciseView key={exercise.id} exercise={exercise} onSubmit={submit} />
      </div>
      {feedback && (
        <div className={cn("border-t px-4 py-4", feedback.correct ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-amber-50 dark:bg-amber-950/30")}>
          <p className="font-bold">{feedback.correct ? "Bien visto" : "Anotado"}</p>
          <p className="mt-1 text-sm">{feedback.text}</p>
          <Button className="mt-3 h-12 w-full rounded-2xl font-bold" onClick={advance} disabled={busy}>
            {feedback.retryable ? "Reintentar" : i + 1 >= exam.exercises.length ? "Ver resultado" : "Siguiente"}
          </Button>
        </div>
      )}
    </div>
  );
}
