"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock, Flame, Gem, Heart, X, Check, Star, Target } from "lucide-react";
import type { Exercise, Lesson } from "@/lib/types";
import { checkExercise, type UserAnswer } from "@/lib/validators";
import { ExerciseView, Hint } from "@/components/exercise-view";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress-store";
import { PythonStatus } from "@/components/python-status";
import { Pybot, PybotCoach } from "@/components/pybot";
import { EXERCISE_GUIDES } from "@/lib/learning-experience";
import { playTone } from "@/lib/sound";
import { preloadPython } from "@/lib/python-runtime";
import { BADGES, getLesson, getLessonContext, LEVEL_LABELS, lessonLevel, nextLessonId, UNITS } from "@/lib/curriculum";
import { cn } from "@/lib/utils";
import Link from "next/link";

const subscribeMounted = () => () => {};
const clientMounted = () => true;
const serverMounted = () => false;

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
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(subscribeMounted, clientMounted, serverMounted);
  const progress = useProgress();
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    text: string;
    stdout?: string;
    images?: string[];
    retryable?: boolean;
  } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(Boolean(practice || review));
  const [combo, setCombo] = useState(0);
  const [rewards, setRewards] = useState({ xp: 0, gems: 0 });
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const stepLock = useRef(false);
  const submitting = useRef(false);
  const attempted = useRef(new Set<string>());
  const scrollArea = useRef<HTMLDivElement>(null);
  const challenge = useRef<HTMLFieldSetElement>(null);
  const exercise: Exercise | undefined = lesson.exercises[i];
  const total = lesson.exercises.length;
  const ctx = getLessonContext(lesson.id);
  useEffect(() => {
    if (!started || done) return;
    const frame = requestAnimationFrame(() => {
      if (scrollArea.current) scrollArea.current.scrollTop = 0;
      challenge.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [exercise?.id, started, done]);
  useEffect(() => {
    if (exercise?.type === "code" || exercise?.type === "data") preloadPython();
  }, [exercise?.type]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter" || busy || heartsEmpty || !feedback) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "BUTTON" || tag === "A" || tag === "TEXTAREA" || tag === "INPUT") return;
      e.preventDefault();
      if (feedback.correct) advance();
      else setFeedback(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // advance/finish close over the latest step; rebind when feedback or index change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, feedback, i, total, practice]);

  async function submit(answer: UserAnswer) {
    if (!exercise || submitting.current || feedback || stepLock.current) return;
    submitting.current = true;
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
        retryable: result.retryable,
      });
      if (progress.soundEnabled !== false) playTone(result.correct ? "ok" : "bad");
      if (result.correct && !attempted.current.has(exercise.id)) {
        setCombo((n) => n + 1);
        correctRef.current += 1;
        setCorrectCount(correctRef.current);
      } else if (!result.correct && !result.retryable && !attempted.current.has(exercise.id) && !practice) {
        setCombo(0);
        progress.loseHeart();
        wrongRef.current += 1;
      } else if (!result.correct && !result.retryable && !attempted.current.has(exercise.id)) {
        setCombo(0);
        wrongRef.current += 1;
      }
      if (!result.retryable) attempted.current.add(exercise.id);
    } catch {
      setFeedback({ correct: false, retryable: true, text: "No pudimos comprobar la respuesta. Reintenta; este fallo no consume corazones." });
    } finally {
      setBusy(false);
      submitting.current = false;
    }
  }

  function advance() {
    if (!exercise || !feedback?.correct || stepLock.current) return;
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
    const before = useProgress.getState();
    const beforeXp = before.xp;
    const beforeGems = before.gems;
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
    const after = useProgress.getState();
    setRewards({ xp: after.xp - beforeXp, gems: after.gems - beforeGems });
    if (progress.soundEnabled !== false) playTone("done");
    if (!reduceMotion) confetti({ particleCount: 70, spread: 65, origin: { y: 0.7 }, disableForReducedMotion: true });
  }

  const heartsEmpty = !practice && progress.hearts <= 0 && !done && !attempted.current.has(exercise?.id ?? "");

  // Randomized answer banks render only after hydration, so SSR and client
  // cannot disagree about which option occupies a button.
  if (!mounted) return <div role="status" className="mx-auto max-w-2xl p-8 text-center text-sm text-muted-foreground">Preparando tu lección…</div>;

  if (!started) return <div className="quest-enter mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5 py-8 sm:py-12">
    <div className="flex items-center justify-between"><Link href="/learn" className="rounded-full border bg-card p-2.5" aria-label="Volver al mapa"><X className="size-5" /></Link><span className="quest-kicker">Nivel {lessonLevel(lesson)} · {LEVEL_LABELS[lessonLevel(lesson)]}</span></div>
    <div className="quest-hero mt-6 rounded-[2rem] border p-6 text-center"><Pybot mood="wave" size="lg" className="mx-auto" /><p className="quest-kicker mt-2">Una misión con Pybot</p><h1 className="mt-3 text-3xl font-extrabold tracking-tight">{lesson.title}</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{lesson.description}</p>
      <div className="mt-5 flex justify-center gap-4 text-xs font-bold text-muted-foreground"><span className="flex items-center gap-1"><Target className="size-4 text-primary" />{total} retos</span><span className="flex items-center gap-1"><Clock className="size-4 text-primary" />5–10 min</span><span className="flex items-center gap-1"><Star className="size-4 text-amber-500" />Hasta {lesson.xp} XP</span></div>
    </div>
    <div className="mt-5 grid grid-cols-3 gap-2 text-center">{["Observa la idea", "Pruébala tú", "Entiende el resultado"].map((text, n) => <div key={text} className="rounded-2xl border bg-card px-2 py-3"><span className="mx-auto mb-2 flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{n + 1}</span><p className="text-xs font-semibold">{text}</p></div>)}</div>
    <PybotCoach className="mt-4">No tienes que acertar a la primera. Prueba, revisa la explicación y vuelve a intentarlo.</PybotCoach>
    <Button className="mt-5 h-14 w-full rounded-2xl text-base font-extrabold" onClick={() => setStarted(true)}>Empezar clase<ArrowRight className="size-4" /></Button>
  </div>;

  if (done) {
    const next = nextLessonId(lesson.id);
    const nextLesson = next ? getLesson(next) : undefined;
    return (
      <div className="mx-auto flex min-h-[80dvh] max-w-lg flex-col items-center justify-center px-4 py-10 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <Pybot mood="celebrate" size="xl" className="mx-auto" />
          <p className="quest-kicker">Un paso más hacia tus proyectos</p>
          <h1 className="font-heading text-3xl font-extrabold">
            {review ? "¡Unidad reforzada!" : legendary ? "¡Práctica legendaria!" : "¡Lección completada!"}
          </h1>
          <p className="text-muted-foreground">
            {correctCount}/{total} correctas al primer intento
            {review ? " · +1 corazón · fuerza restaurada" : ""}
          </p>
          <div className="quest-reward grid grid-cols-3 gap-2"><div className="rounded-2xl border bg-card p-4"><Star className="mx-auto mb-2 size-5 text-amber-500" /><p className="text-lg font-extrabold">+{rewards.xp}</p><p className="text-[10px] font-bold text-muted-foreground">XP GANADOS</p></div><div className="rounded-2xl border bg-card p-4"><Gem className="mx-auto mb-2 size-5 text-cyan-600" /><p className="text-lg font-extrabold">+{rewards.gems}</p><p className="text-[10px] font-bold text-muted-foreground">GEMAS</p></div><div className="rounded-2xl border bg-card p-4"><Check className="mx-auto mb-2 size-5 text-emerald-600" /><p className="text-lg font-extrabold">{total}/{total}</p><p className="text-[10px] font-bold text-muted-foreground">RETOS RESUELTOS</p></div></div>
          <PybotCoach title="Lo que acabas de practicar" mood="happy" className="text-left">{lesson.description || "Comprobar una idea, corregirla y resolverla por tu cuenta."}</PybotCoach>
          {newBadges.length > 0 && (
            <p className="rounded-2xl bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-900 dark:bg-violet-950 dark:text-violet-100">
              Nueva insignia: {newBadges.map((id) => BADGES.find((b) => b.id === id)?.title ?? id).join(", ")}
            </p>
          )}
          <div className="flex flex-col gap-2 pt-4">
            {nextLesson && !review && !legendary ? <div className="mb-2 rounded-2xl border bg-card p-4 text-left"><p className="quest-kicker">Tu siguiente misión</p><p className="mt-2 font-bold">{nextLesson.title}</p><p className="mt-1 text-xs text-muted-foreground">{nextLesson.description}</p></div> : null}
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
            {onClose && (
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
    <div className="mx-auto flex h-[100dvh] max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center gap-3 px-3 py-3">
        <button
          type="button"
          onClick={() => (onClose ? onClose() : router.push("/learn"))}
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
          aria-label="Cerrar"
        >
          <X className="size-5" />
        </button>
        <div role="progressbar" aria-label="Progreso de la clase" aria-valuemin={0} aria-valuemax={total} aria-valuenow={i + (feedback?.correct ? 1 : 0)} className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="quest-progress-fill h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400"
            style={{ width: `${((i + (feedback?.correct ? 1 : 0)) / total) * 100}%` }}
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
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 pb-3"><p className="text-xs font-bold text-muted-foreground">{ctx?.unit.title ?? lesson.title}</p><span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-extrabold text-primary">{combo >= 2 ? <><Flame className="size-3 text-orange-500" />{combo} seguidos</> : `Reto ${i + 1} de ${total}`}</span></div>

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
        ref={scrollArea}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-4",
          (heartsEmpty || feedback) && "pointer-events-none",
          heartsEmpty && "opacity-40"
        )}
      >
        <div key={exercise.id + "-guide"} className="quest-enter mb-4 flex items-center gap-3"><Pybot size="sm" mood={busy ? "thinking" : "encourage"} /><div><p className="quest-kicker">{EXERCISE_GUIDES[exercise.type].label}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{i > 0 && i === Math.floor(total / 2) ? "¡Ya vas por la mitad! " : ""}{EXERCISE_GUIDES[exercise.type].tip}</p></div></div>
        {(exercise.type === "code" || exercise.type === "data") ? <PythonStatus className="mb-3" /> : null}
        <fieldset ref={challenge} tabIndex={-1} aria-label={`Reto ${i + 1}`} disabled={busy || Boolean(feedback) || heartsEmpty} className="quest-exercise min-w-0 rounded-3xl border bg-card p-4 outline-none sm:p-5">
          <ExerciseView key={exercise.id} exercise={exercise} onSubmit={submit} />
        </fieldset>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Hint key={`${exercise.id}-hint`} text={exercise.hint} />
          {ctx && <Link href={`/library/${ctx.unit.id}`} target="_blank" rel="noopener noreferrer" className="min-h-10 py-2 text-sm font-semibold text-primary">Entender este tema ↗</Link>}
        </div>
        {busy && <p className="mt-3 text-sm text-muted-foreground">Ejecutando en el navegador…</p>}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "shrink-0 border-t px-4 py-4",
              feedback.correct ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50" : "border-rose-200 bg-rose-50 dark:bg-rose-950/40"
            )}
          >
            <div className="mx-auto max-h-[40dvh] max-w-2xl overflow-y-auto">
              <div className="flex items-center gap-3"><Pybot key={feedback.correct ? "yes" : "retry"} size="sm" mood={feedback.correct ? "celebrate" : "encourage"} /><div><p className={cn("font-extrabold", feedback.correct ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300")}>{feedback.correct ? "¡Correcto!" : feedback.retryable ? "Probemos de nuevo" : "Casi…"}</p><p className="mt-1 text-xs text-muted-foreground">{feedback.correct ? combo >= 2 ? `${combo} aciertos seguidos. ¡Estás conectando las ideas!` : "Una idea más que ya sabes usar." : "Vamos paso a paso. Puedes corregirlo."}</p></div></div>
              <p role="status" className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{feedback.text}</p>
              {feedback.stdout ? (
                <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-950 p-2 text-xs text-zinc-100">{feedback.stdout}</pre>
              ) : null}
              {feedback.images?.map((img, k) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={k} src={`data:image/png;base64,${img}`} alt="Gráfico generado" className="mt-2 max-h-56 rounded-lg border" />
              ))}
              {!feedback.correct && !feedback.retryable && exercise.solution && (
                <details className="mt-2 text-xs text-muted-foreground">
                  <summary className="min-h-10 cursor-pointer py-2 font-semibold">Ver solución explicada</summary>
                  <p className="mb-2 leading-relaxed">{exercise.explanation}</p>
                  {exercise.solution.includes("\n") ? (
                    <pre className="mt-1 overflow-x-auto rounded-lg bg-zinc-950 p-2 font-mono text-xs text-zinc-100">
                      <code>{exercise.solution}</code>
                    </pre>
                  ) : (
                    <code className="mt-1 inline-block rounded bg-background px-1 py-0.5">{exercise.solution}</code>
                  )}
                </details>
              )}
              <Button
                className="mt-3 h-12 w-full rounded-2xl font-bold"
                onClick={() => { if (feedback.correct) advance(); else setFeedback(null); }}
                disabled={heartsEmpty}
              >
                {feedback.correct ? "Continuar" : "Corregir y reintentar"}
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
