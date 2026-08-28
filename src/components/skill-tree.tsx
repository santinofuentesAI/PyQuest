"use client";

import Link from "next/link";
import { BookOpen, Check, Lock, Sparkles, Crown, RotateCcw, Play } from "lucide-react";
import { SECTIONS, UNITS } from "@/lib/curriculum";
import { continueLessonId, continueUnitId, isUnitUnlocked, useProgress } from "@/lib/progress-store";
import { decayStrength } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { PythonStatus } from "@/components/python-status";
import { buttonVariants } from "@/components/ui/button";

export function SkillTree({ highlight }: { highlight?: string }) {
  const progress = useProgress();
  const nextLesson = continueLessonId(progress);
  const nextUnit = continueUnitId(progress);
  const nextUnitTitle = nextUnit ? UNITS.find((u) => u.id === nextUnit)?.title : undefined;

  if (!progress.hydrated) {
    return <p className="px-6 py-16 text-sm text-muted-foreground">Cargando mapa…</p>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <div className="mb-6">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">Camino de habilidades</p>
        <h1 className="font-heading mt-1 text-3xl font-extrabold tracking-tight">Tu mapa hacia la IA</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Lecciones de 5–10 minutos. Python corre en este navegador: NumPy, Pandas y Matplotlib incluidos.
        </p>
        <PythonStatus className="mt-3" />
        {nextLesson && (
          <Link
            href={`/lesson/${nextLesson}`}
            className={cn(buttonVariants({ size: "lg" }), "mt-4 h-12 w-full rounded-2xl text-base font-bold")}
          >
            <Play className="size-4" />
            Continuar{nextUnitTitle ? `: ${nextUnitTitle}` : ""}
          </Link>
        )}
        <Link
          href="/library"
          className={cn(buttonVariants({ variant: "outline" }), "mt-2 h-11 w-full rounded-2xl font-bold")}
        >
          <BookOpen className="size-4" />
          Abrir la librería
        </Link>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.id} className="mb-10">
          <div
            className="sticky top-[3.75rem] z-20 -mx-4 mb-4 border-b px-4 py-3 shadow-[0_10px_18px_-12px_rgba(0,0,0,0.28)]"
            style={{ background: `color-mix(in oklab, ${section.color} 22%, var(--background))` }}
          >
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: section.color }}>
              Sección {section.index}
            </p>
            <h2 className="font-heading text-xl font-bold">{section.title}</h2>
            <p className="text-sm text-muted-foreground">{section.subtitle}</p>
          </div>
          <ol className="relative z-0 space-y-4 before:absolute before:top-4 before:bottom-4 before:left-7 before:z-0 before:w-1 before:rounded-full before:bg-border">
            {section.units.map((unit, idx) => {
              const unlocked = isUnitUnlocked(unit.id, progress);
              const up = progress.units[unit.id];
              const complete =
                !!up && unit.lessons.every((l) => up.completedLessonIds.includes(l.id));
              const strength = decayStrength(up?.strength ?? (complete ? 0.7 : 0), up?.lastPracticedAt ?? null);
              const weak = complete && strength < 0.45;
              const offset = idx % 2 === 0 ? "ml-0" : "ml-10 sm:ml-16";
              return (
                <li key={unit.id} className={cn("relative z-0 flex items-center gap-3", offset)}>
                  <div
                    className={cn(
                      "relative z-0 flex size-14 shrink-0 items-center justify-center rounded-full border-4 text-lg font-black shadow-md transition",
                      !unlocked && "border-muted bg-muted text-muted-foreground",
                      unlocked && !complete && "border-primary bg-primary text-primary-foreground",
                      complete && !weak && "border-emerald-500 bg-emerald-500 text-white",
                      weak && "border-amber-400 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
                      highlight === unit.id && "ring-4 ring-amber-300"
                    )}
                  >
                    {!unlocked ? (
                      <Lock className="size-5" />
                    ) : complete && weak ? (
                      <RotateCcw className="size-5" />
                    ) : complete ? (
                      unit.isProject ? <Crown className="size-5" /> : <Check className="size-5" />
                    ) : unit.isProject ? (
                      <Sparkles className="size-5" />
                    ) : (
                      unit.index
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {unlocked ? (
                      <Link href={`/unit/${unit.id}`} className="block rounded-2xl border bg-card p-3 shadow-sm hover:border-primary/40">
                        <UnitCopy
                          unit={unit}
                          complete={complete}
                          weak={weak}
                          doneCount={up?.completedLessonIds.length ?? 0}
                        />
                      </Link>
                    ) : (
                      <div className="rounded-2xl border bg-muted/40 p-3 opacity-70">
                        <UnitCopy unit={unit} complete={false} weak={false} doneCount={0} locked />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

function UnitCopy({
  unit,
  complete,
  weak,
  doneCount,
  locked,
}: {
  unit: { title: string; description: string; isProject?: boolean; lessons: { id: string }[] };
  complete: boolean;
  weak: boolean;
  doneCount: number;
  locked?: boolean;
}) {
  return (
    <>
      <p className="font-heading text-base font-bold leading-tight">{unit.title}</p>
      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{unit.description}</p>
      <p className="mt-1 text-xs font-semibold">
        {locked
          ? "Completa la unidad anterior"
          : weak
            ? "Se está debilitando · toca para repasarla"
            : complete
              ? "Dominada"
              : unit.isProject
                ? "Proyecto"
                : `${doneCount}/${unit.lessons.length} lecciones · 5–10 min`}
      </p>
    </>
  );
}
