"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Dumbbell, RotateCcw, Sparkles } from "lucide-react";
import { LessonPlayer } from "@/components/lesson-player";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress-store";
import {
  buildPracticeLesson,
  poolForUnits,
  practiceUnitOptions,
  type PracticeKind,
} from "@/lib/practice";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/lib/types";

const COUNTS = [8, 12, 20] as const;
const KINDS: { id: PracticeKind; label: string; hint: string }[] = [
  { id: "all", label: "De todo", hint: "Quiz y código mezclados" },
  { id: "quiz", label: "Quiz", hint: "Opciones, huecos, emparejar" },
  { id: "code", label: "Código", hint: "Escribir y ejecutar Python" },
];

export default function PracticePage() {
  const progress = useProgress();
  const units = useMemo(() => practiceUnitOptions(progress), [progress]);
  const [selected, setSelected] = useState<string[] | null>(null);
  const [kind, setKind] = useState<PracticeKind>("all");
  const [count, setCount] = useState<(typeof COUNTS)[number]>(12);
  const [session, setSession] = useState<Lesson | null>(null);
  const [run, setRun] = useState(0);

  const chosen = selected ?? units.map((u) => u.id);

  const pool = useMemo(() => poolForUnits(chosen, progress, kind), [chosen, progress, kind]);
  const weakIds = units.filter((u) => u.weak).map((u) => u.id);
  const sections = useMemo(() => {
    const map = new Map<string, { id: string; title: string; color: string; unitIds: string[] }>();
    for (const u of units) {
      const row = map.get(u.sectionId) ?? { id: u.sectionId, title: u.sectionTitle, color: u.sectionColor, unitIds: [] };
      row.unitIds.push(u.id);
      map.set(u.sectionId, row);
    }
    return [...map.values()];
  }, [units]);

  function toggleUnit(id: string) {
    setSelected((prev) => {
      const base = prev ?? units.map((u) => u.id);
      return base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
    });
  }

  function toggleSection(unitIds: string[]) {
    setSelected((prev) => {
      const base = prev ?? units.map((u) => u.id);
      const allOn = unitIds.every((id) => base.includes(id));
      if (allOn) return base.filter((id) => !unitIds.includes(id));
      return [...new Set([...base, ...unitIds])];
    });
  }

  function start(nextSelected = chosen, nextKind = kind, nextCount = count) {
    const exercises = poolForUnits(nextSelected, progress, nextKind);
    const title =
      nextSelected.length === units.length
        ? "Mix de lo que ya dominas"
        : nextSelected.length === 1
          ? units.find((u) => u.id === nextSelected[0])?.title ?? "Práctica"
          : `${nextSelected.length} unidades`;
    const lesson = buildPracticeLesson(exercises, nextCount, title, run + 1);
    if (!lesson) return;
    setRun((n) => n + 1);
    setSession(lesson);
  }

  if (!progress.hydrated) {
    return <p className="px-6 py-16 text-sm text-muted-foreground">Cargando tu práctica…</p>;
  }

  if (session) {
    return (
      <div className="fixed inset-0 z-50 overflow-auto bg-background">
        <LessonPlayer
          key={session.id}
          lesson={session}
          practice
          legendary
          onClose={() => setSession(null)}
        />
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 pb-24">
        <h1 className="font-heading text-3xl font-extrabold">Práctica</h1>
        <p className="mt-3 text-muted-foreground">
          Completa una lección (o el test de nivel) para desbloquear repasos a la carta: sin corazones, eligiendo
          unidades y tipo de ejercicio.
        </p>
        <Button className="mt-6 h-12 rounded-2xl font-bold" render={<Link href="/learn" />}>
          Ir a aprender
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-28">
      <p className="text-xs font-bold tracking-widest text-primary uppercase">Sin corazones</p>
      <h1 className="font-heading mt-1 text-3xl font-extrabold">¿Qué quieres practicar?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Solo aparece lo que ya completaste o lo que el test de nivel dio por visto. Mezcla unidades, elige quiz o
        código, y lanza tantas rondas como quieras.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button
          className="h-12 rounded-2xl font-bold"
          onClick={() => {
            const ids = units.map((u) => u.id);
            setSelected(ids);
            setKind("all");
            setCount(12);
            start(ids, "all", 12);
          }}
        >
          <Sparkles className="size-4" />
          Mix rápido
        </Button>
        <Button
          variant="outline"
          className="h-12 rounded-2xl font-bold"
          disabled={weakIds.length === 0}
          onClick={() => {
            setSelected(weakIds);
            start(weakIds, kind, count);
          }}
        >
          <RotateCcw className="size-4" />
          Unidades débiles
        </Button>
      </div>
      {weakIds.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">Las unidades débiles aparecen cuando una dominada pierde fuerza.</p>
      )}

      <section className="mt-8">
        <h2 className="font-bold">Tipo</h2>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              className={cn(
                "rounded-2xl border px-2 py-3 text-center",
                kind === k.id ? "border-primary bg-primary/10" : "border-border bg-card"
              )}
            >
              <span className="block text-sm font-bold">{k.label}</span>
              <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">{k.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-bold">Cuántos ejercicios</h2>
        <div className="mt-2 flex gap-2">
          {COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              className={cn(
                "h-11 flex-1 rounded-2xl border text-sm font-bold",
                count === n ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold">Secciones y unidades</h2>
          <button
            type="button"
            className="text-xs font-semibold text-primary"
            onClick={() =>
              setSelected((prev) => {
                const base = prev ?? units.map((u) => u.id);
                return base.length === units.length ? [] : units.map((u) => u.id);
              })
            }
          >
            {chosen.length === units.length ? "Quitar todas" : "Elegir todas"}
          </button>
        </div>
        <ul className="mt-3 space-y-4">
          {sections.map((section) => {
            const on = section.unitIds.every((id) => chosen.includes(id));
            const some = section.unitIds.some((id) => chosen.includes(id));
            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => toggleSection(section.unitIds)}
                  className="mb-2 flex w-full items-center justify-between rounded-xl px-1 py-1 text-left"
                >
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: section.color }}>
                    {section.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{on ? "todas" : some ? "parcial" : "ninguna"}</span>
                </button>
                <ul className="space-y-1.5">
                  {units
                    .filter((u) => u.sectionId === section.id)
                    .map((u) => {
                      const checked = chosen.includes(u.id);
                      return (
                        <li key={u.id}>
                          <button
                            type="button"
                            onClick={() => toggleUnit(u.id)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left",
                              checked ? "border-primary/50 bg-primary/5" : "border-border bg-card"
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-5 shrink-0 items-center justify-center rounded-md border",
                                checked ? "border-primary bg-primary text-primary-foreground" : "border-input"
                              )}
                              aria-hidden
                            >
                              {checked ? "✓" : ""}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-semibold leading-tight">{u.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {u.exerciseCount} ejercicios
                                {u.weak ? " · se está debilitando" : ""}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="fixed right-0 bottom-16 left-0 z-30 border-t bg-background/95 px-4 py-3 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-lg">
          <Button
            className="h-12 w-full rounded-2xl text-base font-bold"
            disabled={pool.length === 0}
            onClick={() => start()}
          >
            <Dumbbell className="size-4" />
            Empezar · {Math.min(count, pool.length)} ejercicios
          </Button>
          {pool.length === 0 && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Elige al menos una unidad con ejercicios de ese tipo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
