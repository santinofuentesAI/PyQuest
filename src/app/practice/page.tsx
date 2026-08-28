"use client";

import { useMemo, useState } from "react";
import { LessonPlayer } from "@/components/lesson-player";
import { reviewPool } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress-store";
import type { Lesson, Exercise } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PracticePage() {
  const completed = useProgress((s) => s.completedLessons);
  const [run, setRun] = useState(0);
  const lesson = useMemo<Lesson | null>(() => {
    const pool = reviewPool(Object.keys(completed));
    if (pool.length < 4) return null;
    const exercises = shuffle(pool)
      .slice(0, 8)
      .map((e, i) => ({
        ...e,
        id: `${e.id}-leg-${run}-${i}`,
        xp: Math.round(e.xp * 1.4),
        difficulty: (Math.min(5, e.difficulty + 1) as Exercise["difficulty"]),
      }));
    return {
      id: `legendary-${run}`,
      title: "Práctica legendaria",
      description: "Mezcla de unidades que ya dominas. Sin corazones. Más XP.",
      xp: exercises.reduce((s, e) => s + e.xp, 0),
      exercises,
    };
  }, [completed, run]);

  if (!lesson) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-heading text-3xl font-extrabold">Práctica legendaria</h1>
        <p className="mt-3 text-muted-foreground">
          Completa al menos una lección para desbloquear el modo infinito: no gasta corazones y mezcla unidades antiguas
          (repaso espaciado).
        </p>
        <Button className="mt-6 h-12 rounded-2xl font-bold" render={<Link href="/learn" />}>
          Ir a aprender
        </Button>
      </div>
    );
  }

  return (
    <div>
      <LessonPlayer key={lesson.id} lesson={lesson} practice legendary />
      <div className="pb-8 text-center">
        <button type="button" className="text-sm font-semibold text-primary" onClick={() => setRun((n) => n + 1)}>
          Otra ronda
        </button>
      </div>
    </div>
  );
}
