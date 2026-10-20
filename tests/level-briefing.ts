import assert from "node:assert/strict";
import { getUnit } from "../src/lib/curriculum";
import { getLessonGuide } from "../src/lib/lesson-guides";
import { levelBriefing } from "../src/lib/level-briefing";

const unit = getUnit("u1");
assert.ok(unit);
const [first, second] = unit.lessons;
const guide = getLessonGuide("u1");
const opening = levelBriefing(first, unit, guide);
assert.ok(opening.length > 4, "The opening level can take more than four screens");
assert.equal(opening[0].body, first.description);
assert.equal(opening.filter((slide) => slide.label.startsWith("Idea")).length, 3);
assert.equal(opening.at(-1)?.kind, "practice");
assert.match(opening.at(-1)?.body ?? "", /no hace falta/);

const later = levelBriefing(second, unit, guide);
assert.equal(later.length, 2);
assert.equal(later[0].body, second.description);
assert.equal(later.some((slide) => slide.kind === "code"), false);

console.log("Level briefing keeps the module explanation on the first level and practice on every level.");
