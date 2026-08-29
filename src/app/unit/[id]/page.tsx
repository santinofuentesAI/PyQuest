"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, Check, Lock, RotateCcw, Sparkles } from "lucide-react";
import { getUnit, getSectionForUnit, LEVEL_LABELS, lessonLevel } from "@/lib/curriculum";
import { isUnitUnlocked, useProgress } from "@/lib/progress-store";
import { decayStrength } from "@/lib/gamification";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UnitPage() {
  const params = useParams<{ id: string }>();
  const progress = useProgress();
  const unit = getUnit(params.id);
  const section = unit ? getSectionForUnit(unit.id) : undefined;

  if (!unit) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold">Unidad no encontrada</h1>
        <Button className="mt-4" render={<Link href="/learn" />}>
          Volver al mapa
        </Button>
      </div>
    );
  }

  const unlocked = isUnitUnlocked(unit.id, progress);
  const up = progress.units[unit.id];
  const complete = !!up && unit.lessons.every((l) => up.completedLessonIds.includes(l.id));
  const strength = decayStrength(up?.strength ?? (complete ? 0.7 : 0), up?.lastPracticedAt ?? null);
  const weak = complete && strength < 0.45;
  const nextLesson = unit.lessons.find((l) => !up?.completedLessonIds.includes(l.id));

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-24">
      <p className="text-xs font-bold tracking-widest uppercase" style={{ color: section?.color }}>
        {section?.title}
      </p>
      <h1 className="font-heading mt-1 text-3xl font-extrabold">{unit.title}</h1>
      <p className="mt-2 text-muted-foreground">{unit.description}</p>
      <p className="mt-3 rounded-2xl border bg-card/80 px-3 py-2 text-sm text-muted-foreground">
        Cada tema tiene 4 niveles: esencial, afianza, practica y demuestra. El mapa se abre al terminar el primero;
        los otros tres existen para que el concepto se quede.
      </p>
      {complete && (
        <p className="mt-2 text-sm font-semibold text-emerald-600">
          Dominada · fuerza {Math.round(strength * 100)}%
        </p>
      )}

      <ol className="mt-6 space-y-2">
        {unit.lessons.map((lesson, i) => {
          const done = up?.completedLessonIds.includes(lesson.id);
          const open = unlocked && (done || lesson.id === nextLesson?.id || i === 0);
          return (
            <li key={lesson.id}>
              {open ? (
                <Link
                  href={`/lesson/${lesson.id}`}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border bg-card p-4 hover:border-primary/40",
                    done && "border-emerald-300/60"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      done ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"
                    )}
                  >
                    {done ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span>
                    <span className="text-[11px] font-bold tracking-wider text-primary uppercase">
                      Nivel {lessonLevel(lesson)} · {LEVEL_LABELS[lessonLevel(lesson)]}
                    </span>
                    <span className="block font-bold">{lesson.title}</span>
                    <span className="text-sm text-muted-foreground">{lesson.description}</span>
                    <span className="mt-1 block text-xs font-semibold">
                      {lesson.exercises.length} ejercicios · {lesson.xp} XP
                    </span>
                  </span>
                </Link>
              ) : (
                <div className="flex items-start gap-3 rounded-2xl border bg-muted/40 p-4 opacity-70">
                  <span className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-muted">
                    <Lock className="size-4" />
                  </span>
                  <span>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
                      Nivel {lessonLevel(lesson)} · {LEVEL_LABELS[lessonLevel(lesson)]}
                    </span>
                    <span className="block font-bold">{lesson.title}</span>
                    <span className="text-sm text-muted-foreground">Completa la lección anterior</span>
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-2">
        {nextLesson && unlocked && (
          <Button className="h-12 rounded-2xl font-bold" render={<Link href={`/lesson/${nextLesson.id}`} />}>
            {up?.completedLessonIds.length ? "Continuar unidad" : "Empezar unidad"}
          </Button>
        )}
        <Button variant="outline" className="h-12 rounded-2xl font-bold" render={<Link href={`/library/${unit.id}`} />}>
          <BookOpen className="size-4" />
          Leer la guía de este tema
        </Button>
        {(complete || weak) && (
          <Button
            variant="outline"
            className="h-12 rounded-2xl font-bold"
            render={<Link href={`/review/${unit.id}`} />}
          >
            <RotateCcw className="size-4" />
            {weak ? "Repasar (recupera un corazón)" : "Repasar unidad"}
          </Button>
        )}
        {unit.isProject && (
          <p className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
            <Sparkles className="size-4" /> Proyecto de portafolio: documenta tus conclusiones.
          </p>
        )}
        <Button variant="ghost" className="h-11 rounded-2xl" render={<Link href="/learn" />}>
          Volver al mapa
        </Button>
      </div>
    </div>
  );
}
