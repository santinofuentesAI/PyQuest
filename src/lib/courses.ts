import { COURSE_CATALOG, COURSE_PRICE_USD, getCourseEntry, type CourseCatalogEntry } from "@/content/course-catalog";
import { DEFAULT_COURSE_ID, getCourseIdForUnit, unitsForCourse } from "./curriculum";
import { hasFullUnlock } from "./redeem-codes";
import type { CourseId, UserProgress } from "./types";

export { COURSE_CATALOG, COURSE_PRICE_USD, getCourseEntry };
export type { CourseCatalogEntry };

export function normalizeCourseId(id: string | undefined | null): CourseId {
  if (id === "python-datos" || id === "agentes-ia" || id === "python-ia") return id;
  return DEFAULT_COURSE_ID;
}

export function ownedCourseIds(progress: Pick<UserProgress, "ownedCourseIds" | "unlockAll" | "redeemedCodes">): CourseId[] {
  if (hasFullUnlock(progress)) return COURSE_CATALOG.map((c) => c.id);
  return Array.from(new Set((progress.ownedCourseIds ?? []).map(normalizeCourseId)));
}

export function ownsCourse(
  progress: Pick<UserProgress, "ownedCourseIds" | "unlockAll" | "redeemedCodes">,
  courseId: CourseId
) {
  return ownedCourseIds(progress).includes(courseId);
}

export type UnitAccess = "open" | "progression" | "paywall";

function coreComplete(unit: { id: string; lessons: { id: string; level?: number }[] }, progress: UserProgress) {
  const core = unit.lessons.filter((l) => (l.level ?? 1) === 1);
  const done = progress.units[unit.id]?.completedLessonIds ?? [];
  return core.every((l) => done.includes(l.id));
}

export function unitAccess(unitId: string, progress: UserProgress): UnitAccess {
  const courseId = getCourseIdForUnit(unitId) ?? DEFAULT_COURSE_ID;
  const units = unitsForCourse(courseId);
  const index = units.findIndex((u) => u.id === unitId);
  if (index < 0) return "progression";
  if (hasFullUnlock(progress)) return "open";

  let reached = false;
  if (courseId === "python-ia") {
    const start = units.find((u) => u.id === progress.startingUnitId)?.index ?? units[0]?.index ?? 1;
    const unit = units[index];
    reached =
      unit.index <= start ||
      Boolean(units.find((u) => u.index === unit.index - 1) && coreComplete(units.find((u) => u.index === unit.index - 1)!, progress));
  } else {
    reached = index === 0 || coreComplete(units[index - 1], progress);
  }

  if (!reached) return "progression";
  if (!unitIsIncluded(courseId, index, progress)) return "paywall";
  return "open";
}

/** True if this theme is in the free slice or the learner already unlocked the course. */
export function unitIsIncluded(courseId: CourseId, index: number, progress: UserProgress) {
  if (hasFullUnlock(progress)) return true;
  return index < getCourseEntry(courseId).freeUnitCount || ownsCourse(progress, courseId);
}

export function formatCoursePrice(usd = COURSE_PRICE_USD) {
  return `US$${usd}`;
}
