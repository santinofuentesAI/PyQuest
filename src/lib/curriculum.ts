import type { CourseId, Curriculum, Exercise, Lesson, Section, Unit } from "./types";
import pythonIa from "@/content/curriculum.json";
import datos from "@/content/datos-curriculum.json";
import agentes from "@/content/agentes-curriculum.json";
import aiReads from "@/content/ai-reads.json";

type CurriculumFile = Curriculum & { placementUnit: Unit };
type TrackFile = { courseId: CourseId; sections: Section[] };

export const curriculum = pythonIa as unknown as CurriculumFile;
const AI_READS = aiReads as unknown as Record<string, Exercise>;

function withAiReads(sections: Section[]): Section[] {
  return sections.map((section) => ({
    ...section,
    units: section.units.map((unit) => {
      const read = AI_READS[unit.id];
      if (!read) return unit;
      return {
        ...unit,
        lessons: unit.lessons.map((lesson, index) =>
          index === 0 && !lesson.exercises.some((exercise) => exercise.type === "ai_interpret")
            ? { ...lesson, exercises: [...lesson.exercises, read] }
            : lesson
        ),
      };
    }),
  }));
}

export const SECTIONS: Section[] = withAiReads(curriculum.sections);
export const PYTHON_IA_UNITS: Unit[] = SECTIONS.flatMap((s) => s.units);
export const BADGES = curriculum.badges;
export const PLACEMENT_UNIT: Unit = curriculum.placementUnit;
export const DEFAULT_COURSE_ID: CourseId = "python-ia";

const DATOS = datos as unknown as TrackFile;
const AGENTES = agentes as unknown as TrackFile;

export const COURSE_SECTIONS: Record<CourseId, Section[]> = {
  "python-ia": SECTIONS,
  "python-datos": withAiReads(DATOS.sections),
  "agentes-ia": withAiReads(AGENTES.sections),
};

export const ALL_SECTIONS: Section[] = (Object.values(COURSE_SECTIONS) as Section[][]).flat();
/** Every unit in every course. Lookups (getLesson, getUnit) use this list. */
export const UNITS: Unit[] = ALL_SECTIONS.flatMap((s) => s.units);

const courseByUnit = new Map<string, CourseId>();
for (const [courseId, sections] of Object.entries(COURSE_SECTIONS) as [CourseId, Section[]][]) {
  for (const section of sections) {
    for (const unit of section.units) courseByUnit.set(unit.id, courseId);
  }
}

const lessonMap = new Map<string, { lesson: Lesson; unit: Unit; section: Section | null; courseId: CourseId }>();
for (const [courseId, sections] of Object.entries(COURSE_SECTIONS) as [CourseId, Section[]][]) {
  for (const section of sections) {
    for (const unit of section.units) {
      for (const lesson of unit.lessons) {
        lessonMap.set(lesson.id, { lesson, unit, section, courseId });
      }
    }
  }
}
for (const lesson of PLACEMENT_UNIT.lessons) {
  lessonMap.set(lesson.id, { lesson, unit: PLACEMENT_UNIT, section: null, courseId: "python-ia" });
}

export function getCourseIdForUnit(unitId: string): CourseId | undefined {
  return courseByUnit.get(unitId);
}

export function sectionsForCourse(courseId: CourseId): Section[] {
  return COURSE_SECTIONS[courseId] ?? [];
}

export function unitsForCourse(courseId: CourseId): Unit[] {
  return sectionsForCourse(courseId).flatMap((s) => s.units);
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
  return ALL_SECTIONS.find((s) => s.units.some((u) => u.id === unitId));
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
  const courseUnits = unitsForCourse(ctx.courseId);
  const unitIdx = courseUnits.findIndex((u) => u.id === ctx.unit.id);
  const nextUnit = courseUnits[unitIdx + 1];
  return nextUnit?.lessons[0]?.id ?? null;
}
