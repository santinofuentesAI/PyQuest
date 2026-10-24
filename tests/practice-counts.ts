import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { practiceCountChoices } from "../src/lib/practice";

describe("practiceCountChoices", () => {
  it("offers only sizes that exist in the pool", () => {
    assert.deepEqual(practiceCountChoices(4), [4]);
    assert.deepEqual(practiceCountChoices(8), [8]);
    assert.deepEqual(practiceCountChoices(12), [8, 12]);
    assert.deepEqual(practiceCountChoices(15), [8, 12, 15]);
    assert.deepEqual(practiceCountChoices(20), [8, 12, 20]);
    assert.deepEqual(practiceCountChoices(25), [8, 12, 20, 25]);
    assert.deepEqual(practiceCountChoices(0), []);
  });
});
