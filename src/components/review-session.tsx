"use client";

import { useMemo } from "react";
import { LessonPlayer } from "@/components/lesson-player";
import { getUnit } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress-store";
import { shuffle, shuffleExercise } from "@/lib/practice";
import type { Lesson } from "@/lib/types";

export default function ReviewSession({ unitId }: { unitId: string }) {
  const boost = useProgress((s) => s.boostUnit);
  const restore = useProgress((s) => s.restoreHeart);
  const unit = getUnit(unitId);

  const lesson = useMemo<Lesson | null>(() => {
    if (!unit) return null;
    const pool = unit.lessons.flatMap((l) => l.exercises);
    if (!pool.length) return null;
    const exercises = shuffle(pool).slice(0, Math.min(6, pool.length)).map(shuffleExercise);
    return {
      id: `review-${unit.id}`,
      title: `Repaso: ${unit.title}`,
      description: "Sin corazones. Al terminar, la unidad recupera fuerza y ganas 1 vida.",
      xp: exercises.reduce((s, e) => s + e.xp, 0),
      exercises,
    };
  }, [unit]);

  if (!unit || !lesson) return null;

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
