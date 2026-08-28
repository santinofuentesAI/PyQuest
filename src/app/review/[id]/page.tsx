"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LessonPlayer } from "@/components/lesson-player";
import { getUnit } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress-store";
import { Button } from "@/components/ui/button";
import type { Lesson } from "@/lib/types";

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ReviewPage() {
  const params = useParams<{ id: string }>();
  const boost = useProgress((s) => s.boostUnit);
  const restore = useProgress((s) => s.restoreHeart);
  const unit = getUnit(params.id);

  const lesson = useMemo<Lesson | null>(() => {
    if (!unit) return null;
    const pool = unit.lessons.flatMap((l) => l.exercises);
    if (!pool.length) return null;
    const exercises = shuffle(pool).slice(0, Math.min(6, pool.length));
    return {
      id: `review-${unit.id}`,
      title: `Repaso: ${unit.title}`,
      description: "Sin corazones. Al terminar, la unidad recupera fuerza y ganas 1 vida.",
      xp: exercises.reduce((s, e) => s + e.xp, 0),
      exercises,
    };
  }, [unit]);

  if (!unit || !lesson) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold">Nada que repasar</h1>
        <Button className="mt-4" render={<Link href="/learn" />}>
          Mapa
        </Button>
      </div>
    );
  }

  return (
    <LessonPlayer
      key={lesson.id}
      lesson={lesson}
      practice
      review
      onFinish={() => {
        boost(unit.id);
        restore();
      }}
    />
  );
}
