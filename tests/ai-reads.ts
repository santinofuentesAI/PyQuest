import assert from "node:assert/strict";
import { getCourseIdForUnit, UNITS } from "../src/lib/curriculum";
import { checkExercise } from "../src/lib/validators";
import { filterExercises, poolForUnits } from "../src/lib/practice";
import type { UserProgress } from "../src/lib/types";

for (const unit of UNITS.filter((item) => getCourseIdForUnit(item.id) === "agentes-ia")) {
  const found = unit.lessons.flatMap((lesson) => lesson.exercises).filter((exercise) => exercise.type === "ai_interpret");
  assert.equal(found.length, 0, `${unit.id} stays off Python readings`);
}

const reads = UNITS.filter((unit) => getCourseIdForUnit(unit.id) !== "agentes-ia").map((unit) => {
  const lesson = unit.lessons[0];
  const found = lesson?.exercises.filter((exercise) => exercise.type === "ai_interpret") ?? [];
  assert.equal(found.length, 1, `${unit.id} needs one AI reading on its first lesson`);
  return found[0]!;
});

async function main() {
  for (const exercise of reads) {
    assert.equal(exercise.aiQuestions?.length, 3, exercise.id);
    assert.ok(exercise.starterCode && exercise.starterCode.includes("\n"), exercise.id);
    const lines = exercise.starterCode!.replace(/\n$/, "").split("\n").length;
    for (const question of exercise.aiQuestions ?? []) {
      assert.equal(question.choices.length, 4, exercise.id);
      assert.ok(question.choices.some((choice) => choice.id === question.correctChoiceId));
      const [start, end] = question.focusLines ?? [0, 0];
      assert.ok(start >= 1 && end >= start && end <= lines, `${exercise.id} focus ${start}-${end} of ${lines}`);
    }
    const correct = await checkExercise(exercise, {
      type: "ai_interpret",
      ids: exercise.aiQuestions!.map((question) => question.correctChoiceId),
    });
    assert.equal(correct.correct, true, exercise.id);
    const wrong = await checkExercise(exercise, {
      type: "ai_interpret",
      ids: exercise.aiQuestions!.map(() => "no"),
    });
    assert.equal(wrong.correct, false, exercise.id);
  }

  assert.equal(filterExercises(reads, "interpret").length, reads.length);
  assert.equal(filterExercises(reads, "all").length, 0);

  const progress = {
    activeCourseId: "python-ia",
    ownedCourseIds: [],
    unlockAll: false,
    redeemedCodes: [],
    startingUnitId: "u1",
    completedLessons: {},
    units: {},
  } as unknown as UserProgress;
  const openReads = poolForUnits(["u1", "u2"], progress, "interpret");
  assert.equal(openReads.length, 1);
  assert.equal(openReads[0]?.id, "u1-ai");
  console.log(`AI readings passed: ${reads.length} units.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
