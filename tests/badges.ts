import assert from "node:assert/strict";
import { howToEarn } from "../src/lib/badges";
import type { BadgeDef } from "../src/lib/types";

const base = { id: "x", title: "X", description: "d", icon: "star", value: 1 } satisfies Omit<BadgeDef, "check">;
assert.match(howToEarn({ ...base, check: "unit", value: "u1" }, "¿Qué es programar?"), /¿Qué es programar\?/);
assert.match(howToEarn({ ...base, check: "streak", value: 7 }), /7 días/);
assert.match(howToEarn({ ...base, check: "xp", value: 500 }), /500 XP/);
assert.match(howToEarn({ ...base, check: "perfect", value: 1 }), /primer intento/);
assert.match(howToEarn({ ...base, check: "placement", value: 1 }), /primer paso/);
console.log("Badge how-to lines passed.");
