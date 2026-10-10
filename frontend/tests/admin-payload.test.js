import test from "node:test";
import assert from "node:assert/strict";
import { adminPayload } from "../src/utils/adminPayload.js";

test("preserves optional null dates, booleans and numeric relation identifiers", () => {
  const fields = [{ name: "ends_on", type: "date", nullable: true }, { name: "maximum_absences", type: "number", nullable: true }, { name: "course_id", type: "relation" }, { name: "is_active", type: "checkbox", default: true }, { name: "semester", type: "number" }];
  assert.deepEqual(adminPayload(fields, { ends_on: "", maximum_absences: "", course_id: "42", semester: "4" }), { ends_on: null, maximum_absences: null, course_id: 42, is_active: true, semester: 4 });
});

test("omits blank passwords so editing names does not reset credentials", () => {
  const fields = [{ name: "password", type: "password" }, { name: "first_name" }];
  assert.deepEqual(adminPayload(fields, { password: "", first_name: "Fictício" }), { first_name: "Fictício" });
});

test("preserves explicit false instead of restoring checkbox defaults", () => {
  assert.deepEqual(adminPayload([{ name: "is_active", type: "checkbox", default: true }], { is_active: false }), { is_active: false });
});
