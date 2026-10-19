import assert from "node:assert/strict";
import { COURSE_CATALOG, unitAccess } from "../src/lib/courses";
import { unitsForCourse } from "../src/lib/curriculum";
import {
  buildSkipExam,
  canSkipToUnit,
  SKIP_EXAM_PASS,
  SKIP_EXAM_SIZE,
  skipExamPassed,
} from "../src/lib/skip-exam";
import type { CourseId, ExerciseType, UserProgress } from "../src/lib/types";

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

assert.equal(SKIP_EXAM_SIZE, 20);
assert.equal(SKIP_EXAM_PASS, 16);
assert.equal(skipExamPassed(15, 20), false);
assert.equal(skipExamPassed(16, 20), true);

const empty = progress();
assert.equal(canSkipToUnit("u1", empty), false);
assert.equal(canSkipToUnit("u2", empty), true);
assert.equal(canSkipToUnit("u3", empty), true);
assert.equal(canSkipToUnit("u4", empty), false);
assert.equal(canSkipToUnit("da2", empty), false);
assert.equal(canSkipToUnit("ag2", empty), false);

const ownedDatos = progress({ ownedCourseIds: ["python-datos"], activeCourseId: "python-datos" });
assert.equal(canSkipToUnit("da2", ownedDatos), true);
assert.equal(canSkipToUnit("da3", ownedDatos), true);

const ownedAgentes = progress({ ownedCourseIds: ["agentes-ia"], activeCourseId: "agentes-ia" });
assert.equal(canSkipToUnit("ag2", ownedAgentes), true);

const ownedIa = progress({ ownedCourseIds: ["python-ia"] });
assert.equal(canSkipToUnit("u10", ownedIa), true);

function assertExam(unitId: string) {
  const exam = buildSkipExam(unitId);
  assert.ok(exam, `exam for ${unitId}`);
  assert.equal(exam!.exercises.length, SKIP_EXAM_SIZE, `${unitId} has 20 items`);
  const diffs = exam!.exercises.map((exercise) => exercise.difficulty);
  for (let i = 1; i < diffs.length; i++) {
    assert.ok(diffs[i]! >= diffs[i - 1]!, `${unitId} ramps difficulty`);
  }
  const types = new Set(exam!.exercises.map((exercise) => exercise.type));
  const questions: ExerciseType[] = ["multiple_choice", "fill_blank", "predict_output", "find_error", "matching"];
  const coding: ExerciseType[] = ["code", "data", "reorder", "token_order", "trace"];
  assert.ok(questions.some((type) => types.has(type)), `${unitId} includes questions`);
  assert.ok(coding.some((type) => types.has(type)), `${unitId} includes code`);
  assert.equal(new Set(exam!.exercises.map((exercise) => exercise.id)).size, SKIP_EXAM_SIZE);
}

assertExam("u2");
assertExam("u3");
assertExam("da2");
assertExam("ag2");
assert.equal(buildSkipExam("u1"), null);

for (const course of COURSE_CATALOG) {
  const units = unitsForCourse(course.id as CourseId);
  for (const unit of units.slice(1, 3)) {
    const exam = buildSkipExam(unit.id);
    if (exam) assert.equal(exam.exercises.length, SKIP_EXAM_SIZE, `${unit.id} size`);
  }
}

async function storeChecks() {
  const memory = new Map<string, string>();
  if (typeof globalThis.localStorage === "undefined") {
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: (key: string) => memory.get(key) ?? null,
        setItem: (key: string, value: string) => memory.set(key, value),
        removeItem: (key: string) => memory.delete(key),
        clear: () => memory.clear(),
        key: (index: number) => [...memory.keys()][index] ?? null,
        get length() {
          return memory.size;
        },
      },
    });
  }

  const { useProgress } = await import("../src/lib/progress-store");
  useProgress.setState({
    ...progress({ ownedCourseIds: ["python-ia"], heartsUpdatedAt: Date.now() }),
    hydrated: true,
  } as Partial<ReturnType<typeof useProgress.getState>>);

  const failed = useProgress.getState().applySkipExam("u3", 12, 20);
  assert.equal(failed.passed, false);
  assert.equal(unitAccess("u3", useProgress.getState()), "progression");

  const passed = useProgress.getState().applySkipExam("u3", 16, 20);
  assert.equal(passed.passed, true);
  assert.equal(unitAccess("u3", useProgress.getState()), "open");
  assert.equal(unitAccess("u2", useProgress.getState()), "open");
  assert.notEqual(unitAccess("u4", useProgress.getState()), "open");
  assert.equal(useProgress.getState().startingUnitId, "u3");
}

storeChecks()
  .then(() => console.log("Skip-exam checks passed."))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
