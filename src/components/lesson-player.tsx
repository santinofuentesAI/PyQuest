"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Check, Star } from "lucide-react";
import type { Exercise, Lesson } from "@/lib/types";
import { checkExercise, type UserAnswer } from "@/lib/validators";
import { ExerciseView, Hint } from "@/components/exercise-view";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress-store";
import { PythonStatus } from "@/components/python-status";
import { playTone } from "@/lib/sound";
import { BADGES, getLessonContext, nextLessonId, UNITS } from "@/lib/curriculum";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function LessonPlayer({
  lesson,
  practice,
  legendary,
  review,
  onFinish,
  onClose,
}: {
  lesson: Lesson;
  practice?: boolean;
  legendary?: boolean;
  review?: boolean;
  onFinish?: () => void;
  onClose?: () => void;
}) {
  const router = useRouter();
  const progress = useProgress();
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    text: string;
    stdout?: string;
    images?: string[];
  } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const stepLock = useRef(false);
  const exercise: Exercise | undefined = lesson.exercises[i];
  const total = lesson.exercises.length;
  const ctx = getLessonContext(lesson.id);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter" || busy || heartsEmpty || !feedback) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "BUTTON" || tag === "A") return;
      e.preventDefault();
      advance();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // advance/finish close over the latest step; rebind when feedback or index change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, feedback, i, total, practice]);

  async function submit(answer: UserAnswer) {
    if (!exercise || busy || feedback || stepLock.current) return;
    setBusy(true);
    try {
      const result = await checkExercise(exercise, answer);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setFeedback({
        correct: result.correct,
        text: result.feedback,
        stdout: result.stdout,
        images: result.images,
      });
      if (progress.soundEnabled !== false) playTone(result.correct ? "ok" : "bad");
      if (result.correct) {
        correctRef.current += 1;
        setCorrectCount(correctRef.current);
      } else if (!practice) {
        progress.loseHeart();
        wrongRef.current += 1;
      } else {
        wrongRef.current += 1;
      }
    } finally {
      setBusy(false);
    }
  }

  function advance() {
    if (!exercise || !feedback || stepLock.current) return;
    stepLock.current = true;
    if (i + 1 >= total) {
      finish();
      return;
    }
    setI(i + 1);
    setFeedback(null);
    stepLock.current = false;
  }

  function finish() {
    const earnedXp = Math.max(
      5,
      Math.round((correctRef.current / Math.max(1, total)) * lesson.xp)
    );
    const finalXp = legendary ? Math.round(earnedXp * 1.5) : earnedXp;
    const perfect = wrongRef.current === 0 && correctRef.current === total;
    if (legendary) {
      progress.addLegendaryScore(finalXp);
      setNewBadges([]);
    } else if (review) {
      progress.addLegendaryScore(Math.round(finalXp * 0.5));
      onFinish?.();
      setNewBadges([]);
    } else {
      const badges = progress.completeLesson({
        lessonId: lesson.id,
        completedAt: new Date().toISOString(),
        correct: correctRef.current,
        total,
        xp: finalXp,
        perfect,
      });
      setNewBadges(badges);
    }
    setDone(true);
    if (progress.soundEnabled !== false) playTone("done");
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
  }

  const heartsEmpty = !practice && progress.hearts <= 0 && !done;

  if (done) {
    const next = nextLessonId(lesson.id);
    return (
      <div className="mx-auto flex min-h-[80dvh] max-w-lg flex-col items-center justify-center px-4 py-10 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-lg">
            <Star className="size-10 fill-current" />
          </div>
          <h1 className="font-heading text-3xl font-extrabold">
            {review ? "¡Unidad reforzada!" : legendary ? "¡Práctica legendaria!" : "¡Lección completada!"}
          </h1>
          <p className="text-muted-foreground">
            {correctCount}/{total} correctas
            {review ? " · +1 corazón · fuerza restaurada" : ""}
          </p>
          {newBadges.length > 0 && (
            <p className="rounded-2xl bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-900 dark:bg-violet-950 dark:text-violet-100">
              Nueva insignia: {newBadges.map((id) => BADGES.find((b) => b.id === id)?.title ?? id).join(", ")}
            </p>
          )}
          <div className="flex flex-col gap-2 pt-4">
            {next && !review && !legendary && (
              <Button className="h-12 rounded-2xl font-bold" render={<Link href={`/lesson/${next}`} />}>
                Siguiente lección
              </Button>
            )}
            {review && (
              <Button
                className="h-12 rounded-2xl font-bold"
                render={<Link href={`/unit/${lesson.id.replace(/^review-/, "")}`} />}
              >
                Volver a la unidad
              </Button>
            )}
            {legendary && onClose && (
              <Button className="h-12 rounded-2xl font-bold" onClick={() => onClose()}>
                Elegir otra práctica
              </Button>
            )}
            <Button
              variant="outline"
              className="h-12 rounded-2xl font-bold"
              render={<Link href="/learn" />}
            >
              Volver al mapa
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!exercise) return null;

  return (
    <div className="mx-auto flex h-[100dvh] max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-3 px-3 py-3">
        <button
          type="button"
          onClick={() => (onClose ? onClose() : router.push("/learn"))}
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
          aria-label="Cerrar"
        >
          <X className="size-5" />
        </button>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all"
            style={{ width: `${(i / total) * 100}%` }}
          />
        </div>
        {!practice && (
          <div className="flex items-center gap-0.5 font-bold text-rose-500">
            <Heart className="size-5 fill-current" />
            {progress.hearts}
          </div>
        )}
        {practice && !review && <span className="text-xs font-bold text-emerald-600">PRÁCTICA</span>}
        {review && <span className="text-xs font-bold text-amber-600">REPASO</span>}
      </header>

      {heartsEmpty && (
        <div className="mx-4 shrink-0 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center dark:border-rose-900 dark:bg-rose-950/50">
          <p className="font-bold">Te quedaste sin corazones</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Espera a que se recarguen, recarga con gemas o entra en modo práctica (sin vidas).
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <Button variant="outline" render={<Link href="/learn" />}>
              Mapa
            </Button>
            <Button variant="outline" render={<Link href="/shop" />}>
              Tienda
            </Button>
            <Button render={<Link href="/practice" />}>Práctica legendaria</Button>
          </div>
        </div>
      )}

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4",
          (heartsEmpty || feedback) && "pointer-events-none",
          heartsEmpty && "opacity-40"
        )}
      >
        <p className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          {ctx?.unit.title ?? lesson.title} · {i + 1}/{total} · {exercise.xp} XP
        </p>
        <PythonStatus className="mb-3" />
        <ExerciseView key={exercise.id} exercise={exercise} onSubmit={submit} />
        <div className="mt-3">
          <Hint key={`${exercise.id}-hint`} text={exercise.hint} />
        </div>
        {busy && <p className="mt-3 text-sm text-muted-foreground">Ejecutando en el navegador…</p>}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "shrink-0 border-t px-4 py-4",
              feedback.correct ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50" : "border-rose-200 bg-rose-50 dark:bg-rose-950/40"
            )}
          >
            <div className="mx-auto max-h-[40dvh] max-w-2xl overflow-y-auto">
              <p className={cn("flex items-center gap-2 font-extrabold", feedback.correct ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300")}>
                {feedback.correct ? <Check className="size-5" /> : <X className="size-5" />}
                {feedback.correct ? "¡Correcto!" : "Casi…"}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{feedback.text}</p>
              {feedback.stdout ? (
                <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-950 p-2 text-xs text-zinc-100">{feedback.stdout}</pre>
              ) : null}
              {feedback.images?.map((img, k) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={k} src={`data:image/png;base64,${img}`} alt="Gráfico generado" className="mt-2 max-h-56 rounded-lg border" />
              ))}
              {!feedback.correct && exercise.solution && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <p className="font-semibold">Solución de referencia</p>
                  {exercise.solution.includes("\n") ? (
                    <pre className="mt-1 overflow-x-auto rounded-lg bg-zinc-950 p-2 font-mono text-xs text-zinc-100">
                      <code>{exercise.solution}</code>
                    </pre>
                  ) : (
                    <code className="mt-1 inline-block rounded bg-background px-1 py-0.5">{exercise.solution}</code>
                  )}
                </div>
              )}
              <Button
                className="mt-3 h-12 w-full rounded-2xl font-bold"
                onClick={advance}
                disabled={heartsEmpty}
              >
                Continuar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PlacementPlayer({ lesson }: { lesson: Lesson }) {
  const apply = useProgress((s) => s.applyPlacement);
  const getUnitTitle = (id: string) => UNITS.find((u) => u.id === id)?.title ?? id;
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [placed, setPlaced] = useState<string | null>(null);
  const exercise = lesson.exercises[i];
  const scoreRef = useRef(0);

  async function submit(answer: UserAnswer) {
    if (!exercise || busy || feedback) return;
    setBusy(true);
    const result = await checkExercise(exercise, answer);
    setFeedback({ correct: result.correct, text: result.feedback });
    if (result.correct) {
      scoreRef.current += 1;
      setCorrect(scoreRef.current);
    }
    setBusy(false);
  }

  function advance() {
    if (i + 1 >= lesson.exercises.length) {
      const unitId = apply(scoreRef.current, lesson.exercises.length);
      setPlaced(unitId);
      return;
    }
    setI(i + 1);
    setFeedback(null);
  }

  if (placed) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-xs font-bold tracking-widest text-primary uppercase">Colocación lista</p>
        <h1 className="font-heading mt-2 text-3xl font-extrabold">Empiezas en {getUnitTitle(placed)}</h1>
        <p className="mt-3 text-muted-foreground">
          {correct}/{lesson.exercises.length} aciertos. Las unidades anteriores quedan abiertas por si quieres
          repasarlas.
        </p>
        <div className="mt-6 flex w-full flex-col gap-2">
          <Button className="h-12 rounded-2xl font-bold" render={<Link href={`/unit/${placed}`} />}>
            Ir a mi unidad
          </Button>
          <Button variant="outline" className="h-12 rounded-2xl font-bold" render={<Link href="/learn" />}>
            Ver el mapa completo
          </Button>
        </div>
      </div>
    );
  }

  if (!exercise) return null;

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col">
      <header className="px-4 py-4">
        <p className="text-xs font-bold tracking-wider text-primary uppercase">Test de nivel</p>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${(i / lesson.exercises.length) * 100}%` }} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {i + 1}/{lesson.exercises.length} · sin corazones, solo colocación
        </p>
      </header>
      <div className="flex-1 px-4">
        <ExerciseView key={exercise.id} exercise={exercise} onSubmit={submit} />
      </div>
      {feedback && (
        <div className={cn("border-t px-4 py-4", feedback.correct ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-amber-50 dark:bg-amber-950/30")}>
          <p className="font-bold">{feedback.correct ? "Bien visto" : "Anotado"}</p>
          <p className="mt-1 text-sm">{feedback.text}</p>
          <Button className="mt-3 h-12 w-full rounded-2xl font-bold" onClick={advance}>
            {i + 1 >= lesson.exercises.length ? "Ver mi unidad" : "Siguiente"}
          </Button>
        </div>
      )}
    </div>
  );
}
