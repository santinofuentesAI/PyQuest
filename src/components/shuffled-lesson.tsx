"use client";

import { useMemo } from "react";
import { LessonPlayer } from "@/components/lesson-player";
import { shuffleLearnLesson } from "@/lib/practice";
import type { Lesson } from "@/lib/types";

export default function ShuffledLesson({ lesson }: { lesson: Lesson }) {
  const playable = useMemo(() => shuffleLearnLesson(lesson), [lesson]);
  return <LessonPlayer key={playable.id} lesson={playable} />;
}
