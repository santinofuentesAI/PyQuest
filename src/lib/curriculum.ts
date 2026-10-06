import type { Curriculum, Exercise, Lesson, Section, Unit } from "./types";
import data from "@/content/curriculum.json";

type CurriculumFile = Curriculum & { placementUnit: Unit };

export const curriculum = data as unknown as CurriculumFile;
export const SECTIONS: Section[] = curriculum.sections;
export const UNITS: Unit[] = SECTIONS.flatMap((s) => s.units);
export const BADGES = curriculum.badges;
export const PLACEMENT_UNIT: Unit = curriculum.placementUnit;

const lessonMap = new Map<string, { lesson: Lesson; unit: Unit; section: Section | null }>();
for (const section of SECTIONS) {
  for (const unit of section.units) {
    for (const lesson of unit.lessons) {
      lessonMap.set(lesson.id, { lesson, unit, section });
    }
  }
}
for (const lesson of PLACEMENT_UNIT.lessons) {
  lessonMap.set(lesson.id, { lesson, unit: PLACEMENT_UNIT, section: null });
}

export function getLesson(id: string): Lesson | undefined {
  return lessonMap.get(id)?.lesson;
}

export function getUnit(id: string): Unit | undefined {
  return UNITS.find((u) => u.id === id);
}

export function getUnitByLessonId(id: string): Unit | undefined {
  return lessonMap.get(id)?.unit;
}

export function getSectionForUnit(unitId: string): Section | undefined {
  return SECTIONS.find((s) => s.units.some((u) => u.id === unitId));
}

export function getLessonContext(id: string) {
  return lessonMap.get(id);
}

export function allExercises(): Exercise[] {
  return UNITS.flatMap((u) => u.lessons.flatMap((l) => l.exercises));
}

export function reviewPool(completedLessonIds: string[]): Exercise[] {
  const set = new Set(completedLessonIds);
  return UNITS.flatMap((u) =>
    u.lessons.filter((l) => set.has(l.id)).flatMap((l) => l.exercises)
  );
}

export function lessonLevel(lesson: Lesson): 1 | 2 | 3 | 4 | 5 {
  return lesson.level ?? 1;
}

export function coreLessons(unit: Unit): Lesson[] {
  return unit.lessons.filter((l) => lessonLevel(l) === 1);
}

export const LEVEL_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Lo esencial",
  2: "Afianza",
  3: "Practica",
  4: "Demuestra",
  5: "Profundiza",
};

export function nextLessonId(currentLessonId: string): string | null {
  const ctx = lessonMap.get(currentLessonId);
  if (!ctx) return null;
  const idx = ctx.unit.lessons.findIndex((l) => l.id === currentLessonId);
  if (idx >= 0 && idx < ctx.unit.lessons.length - 1) return ctx.unit.lessons[idx + 1].id;
  const unitIdx = UNITS.findIndex((u) => u.id === ctx.unit.id);
  const nextUnit = UNITS[unitIdx + 1];
  return nextUnit?.lessons[0]?.id ?? null;
}
