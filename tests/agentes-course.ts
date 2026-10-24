import assert from "node:assert/strict";
import { COURSE_CATALOG } from "../src/content/course-catalog";
import { getCourseIdForUnit, unitsForCourse } from "../src/lib/curriculum";
import { LESSON_GUIDES } from "../src/lib/lesson-guides";
import { buildSkipExam } from "../src/lib/skip-exam";
import type { Exercise, ExerciseType } from "../src/lib/types";

const PYTHON_TYPES = new Set<ExerciseType>(["code", "data", "predict_output", "trace"]);
const PYTHON_TEXT = /\b(print|def |import |lambda|while True|Python)\b/;

function blobs(exercise: Exercise) {
  return [
    exercise.prompt,
    exercise.template,
    exercise.starterCode,
    exercise.solution,
    exercise.explanation,
    ...(exercise.blocks ?? []).map((block) => block.code),
    ...(exercise.choices ?? []).map((choice) => choice.text),
  ].filter((value): value is string => Boolean(value));
}

const units = unitsForCourse("agentes-ia");
assert.equal(units.length, 3);
const opening = units[0]?.lessons.map((lesson) => lesson.id) ?? [];
assert.deepEqual(opening.slice(0, 5), ["ag1-4d", "ag1-delegar", "ag1-discernir", "ag1-diligencia", "ag1-prompt"]);
const inspection = units.flatMap((unit) => unit.lessons.flatMap((lesson) => lesson.exercises)).find((exercise) => exercise.type === "ai_interpret");
assert.equal(inspection?.aiLabel, "Respuesta hecha por IA");
assert.match(inspection?.starterCode ?? "", /Pedido:/);
let exercises = 0;
for (const unit of units) {
  assert.equal(getCourseIdForUnit(unit.id), "agentes-ia");
  const guide = LESSON_GUIDES[unit.id];
  assert.ok(guide);
  assert.doesNotMatch(`${guide.code}\n${guide.output}\n${guide.explanation}`, PYTHON_TEXT, unit.id);
  for (const lesson of unit.lessons) {
    for (const exercise of lesson.exercises) {
      exercises += 1;
      assert.equal(PYTHON_TYPES.has(exercise.type), false, `${exercise.id} is ${exercise.type}`);
      for (const text of blobs(exercise)) {
        assert.doesNotMatch(text, PYTHON_TEXT, exercise.id);
      }
    }
  }
}

const catalog = COURSE_CATALOG.find((course) => course.id === "agentes-ia");
assert.ok(catalog);
assert.equal(catalog.includes.some((line) => /Python/i.test(line)), false);

const exam = buildSkipExam("ag2");
assert.ok(exam);
for (const exercise of exam.exercises) {
  assert.equal(PYTHON_TYPES.has(exercise.type), false, exercise.id);
  for (const text of blobs(exercise)) assert.doesNotMatch(text, PYTHON_TEXT, exercise.id);
}

console.log(`Agentes course stays off Python: ${units.length} units, ${exercises} exercises.`);
