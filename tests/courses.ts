import assert from "node:assert/strict";
import { COURSE_CATALOG, unitAccess } from "../src/lib/courses";
import { unitsForCourse } from "../src/lib/curriculum";
import { canSkipToUnit } from "../src/lib/skip-exam";
import type { CourseId, UserProgress } from "../src/lib/types";

function progress(partial: Partial<UserProgress> = {}): UserProgress {
  return {
    displayName: "Test",
    onboarded: true,
    placementDone: true,
    placementScore: null,
    startingUnitId: "u1",
    xp: 0,
    gems: 0,
    hearts: 5,
    heartsUpdatedAt: Date.now(),
    streak: 0,
    lastPracticeDate: null,
    streakFreezes: 0,
    freezeUsedToday: false,
    weeklyXp: 0,
    weekId: "2026-01",
    league: "bronze",
    completedLessons: {},
    units: {},
    badges: [],
    legendaryHighScore: 0,
    theme: "system",
    palette: "violet",
    soundEnabled: false,
    redeemedCodes: [],
    unlockAll: false,
    jobUsd: 0,
    jobProjects: {},
    portfolio: [],
    activeCourseId: "python-ia",
    ownedCourseIds: [],
    ...partial,
  };
}

const empty = progress();
assert.equal(unitAccess("u1", empty), "open");
assert.equal(unitAccess("u2", empty), "progression");
assert.equal(unitAccess("u4", empty), "progression");
assert.equal(unitAccess("da1", empty), "open");
assert.equal(unitAccess("da2", empty), "progression");
assert.equal(unitAccess("ag1", empty), "open");
assert.equal(unitAccess("ag2", empty), "progression");

const afterDa1 = progress({
  units: {
    da1: {
      strength: 1,
      lastPracticedAt: null,
      completedLessonIds: unitsForCourse("python-datos")[0].lessons.filter((l) => (l.level ?? 1) === 1).map((l) => l.id),
    },
  },
});
assert.equal(unitAccess("da2", afterDa1), "paywall");

const afterU3 = progress({
  units: {
    u3: {
      strength: 1,
      lastPracticedAt: null,
      completedLessonIds: unitsForCourse("python-ia")
        .find((u) => u.id === "u3")!
        .lessons.filter((l) => (l.level ?? 1) === 1)
        .map((l) => l.id),
    },
  },
});
assert.equal(unitAccess("u4", afterU3), "paywall");

const ownedDatos = progress({ ownedCourseIds: ["python-datos"], activeCourseId: "python-datos" });
assert.equal(unitAccess("da2", ownedDatos), "progression");
assert.equal(unitAccess("da1", ownedDatos), "open");

const finishedDa1 = progress({
  ownedCourseIds: ["python-datos"],
  units: { da1: { strength: 1, lastPracticedAt: null, completedLessonIds: unitsForCourse("python-datos")[0].lessons.filter((l) => (l.level ?? 1) === 1).map((l) => l.id) } },
});
assert.equal(unitAccess("da2", finishedDa1), "open");

const all = progress({ unlockAll: true });
assert.equal(unitAccess("u40", all), "open");
assert.equal(unitAccess("ag3", all), "open");
assert.equal(canSkipToUnit("u2", empty), true);
assert.equal(canSkipToUnit("u4", empty), false);
assert.equal(canSkipToUnit("u40", all), false);

for (const course of COURSE_CATALOG) {
  const units = unitsForCourse(course.id as CourseId);
  assert.ok(units.length >= 3, `${course.id} needs the first three themes`);
  assert.ok(units.slice(0, 3).every((u) => u.lessons.length >= 3), `${course.id} lessons`);
}

console.log("Course access checks passed.");
