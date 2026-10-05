import assert from "node:assert/strict";
import test from "node:test";

import { getInitialClassGroup } from "../src/utils/initialClassGroup.js";

const groups = [
  { id: 4, name: "Turma A" },
  { id: 9, name: "Turma B" },
];

test("uses the requested class when it belongs to the teacher", () => {
  assert.equal(getInitialClassGroup(groups, "9"), groups[1]);
});

test("falls back to the first available class for an invalid request", () => {
  assert.equal(getInitialClassGroup(groups, "999"), groups[0]);
});

test("returns null when the teacher has no classes", () => {
  assert.equal(getInitialClassGroup([], null), null);
});
