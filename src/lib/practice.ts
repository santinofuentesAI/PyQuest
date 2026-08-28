import type { Exercise, ExerciseType, Lesson, UserProgress } from "./types";
import { SECTIONS, UNITS } from "./curriculum";
import { decayStrength } from "./gamification";

const QUIZ_TYPES = new Set<ExerciseType>([
  "multiple_choice",
  "find_error",
  "fill_blank",
  "matching",
  "predict_output",
]);

const CODE_TYPES = new Set<ExerciseType>(["code", "data", "reorder"]);

export type PracticeKind = "all" | "quiz" | "code";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle option order without mutating the curriculum objects. */
export function shuffleExercise(ex: Exercise): Exercise {
  return {
    ...ex,
    choices: ex.choices ? shuffle(ex.choices) : undefined,
    blocks: ex.blocks ? shuffle(ex.blocks) : undefined,
    left: ex.left ? shuffle(ex.left) : undefined,
    right: ex.right ? shuffle(ex.right) : undefined,
  };
}

/** Learn-path only: new exercise order + shuffled choices so you cannot memorize the map. */
export function shuffleLearnLesson(lesson: Lesson): Lesson {
  return {
    ...lesson,
    exercises: shuffle(lesson.exercises.map(shuffleExercise)),
  };
}

/** Lessons the learner has actually finished or that placement marked as known. */
export function practicedLessonIds(progress: UserProgress): string[] {
  const ids = new Set(Object.keys(progress.completedLessons));
  for (const up of Object.values(progress.units)) {
    for (const id of up.completedLessonIds) ids.add(id);
  }
  return [...ids];
}

export function isUnitComplete(unitId: string, progress: UserProgress): boolean {
  const unit = UNITS.find((u) => u.id === unitId);
  if (!unit || unit.lessons.length === 0) return false;
  const done = new Set(progress.units[unitId]?.completedLessonIds ?? []);
  return unit.lessons.every((l) => done.has(l.id) || progress.completedLessons[l.id]);
}

export type PracticeUnitOption = {
  id: string;
  title: string;
  sectionId: string;
  sectionTitle: string;
  sectionColor: string;
  exerciseCount: number;
  weak: boolean;
};

export function practiceUnitOptions(progress: UserProgress): PracticeUnitOption[] {
  const lessonIds = new Set(practicedLessonIds(progress));
  const rows: PracticeUnitOption[] = [];
  for (const section of SECTIONS) {
    for (const unit of section.units) {
      const lessons = unit.lessons.filter((l) => lessonIds.has(l.id));
      if (!lessons.length) continue;
      const up = progress.units[unit.id];
      const complete = isUnitComplete(unit.id, progress);
      const strength = decayStrength(up?.strength ?? (complete ? 0.7 : 0.4), up?.lastPracticedAt ?? null);
      rows.push({
        id: unit.id,
        title: unit.title,
        sectionId: section.id,
        sectionTitle: section.title,
        sectionColor: section.color,
        exerciseCount: lessons.reduce((n, l) => n + l.exercises.length, 0),
        weak: complete && strength < 0.45,
      });
    }
  }
  return rows;
}

export function filterExercises(exercises: Exercise[], kind: PracticeKind): Exercise[] {
  if (kind === "quiz") return exercises.filter((e) => QUIZ_TYPES.has(e.type));
  if (kind === "code") return exercises.filter((e) => CODE_TYPES.has(e.type));
  return exercises;
}

export function poolForUnits(unitIds: string[], progress: UserProgress, kind: PracticeKind): Exercise[] {
  const allowedLessons = new Set(practicedLessonIds(progress));
  const selected = new Set(unitIds);
  const exercises = UNITS.filter((u) => selected.has(u.id)).flatMap((u) =>
    u.lessons.filter((l) => allowedLessons.has(l.id)).flatMap((l) => l.exercises)
  );
  return filterExercises(exercises, kind);
}

export function buildPracticeLesson(
  exercises: Exercise[],
  count: number,
  title: string,
  run: number
): Lesson | null {
  if (exercises.length === 0) return null;
  const picked = shuffle(exercises).slice(0, Math.min(count, exercises.length));
  const scaled = picked.map((e, i) => ({
    ...shuffleExercise(e),
    id: `${e.id}-prac-${run}-${i}`,
    xp: Math.max(8, Math.round(e.xp * 1.25)),
  }));
  return {
    id: `practice-${run}`,
    title,
    description: "Sin corazones. Elige otra ronda cuando termines.",
    xp: scaled.reduce((s, e) => s + e.xp, 0),
    exercises: scaled,
  };
}
