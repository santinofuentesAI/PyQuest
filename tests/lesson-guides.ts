import assert from "node:assert/strict";
import { UNITS } from "../src/lib/curriculum";
import { getLessonGuide, LESSON_GUIDES } from "../src/lib/lesson-guides";

const units = UNITS;
assert.deepEqual(Object.keys(LESSON_GUIDES).sort(), units.map((unit) => unit.id).sort(), "Every teaching unit needs a reviewed guide");
for (const unit of units) {
  const guide = getLessonGuide(unit.id);
  assert.ok(guide, `Missing explanation for ${unit.title}`);
  assert.equal(guide.steps.length, 3, `Incomplete explanation for ${unit.title}`);
  for (const lesson of unit.lessons) {
    assert.ok(lesson.description.trim(), `Missing level-specific focus for ${lesson.id}`);
    assert.ok(guide.code.trim() && guide.output.trim() && guide.explanation.trim(), `Missing example for ${lesson.id}`);
  }
}
assert.equal(new Set(units.map((unit) => LESSON_GUIDES[unit.id].code)).size, units.length, "Each unit needs its own example");
console.log(`Teaching guides passed: ${units.length} units, ${units.reduce((n, unit) => n + unit.lessons.length, 0)} lessons.`);
