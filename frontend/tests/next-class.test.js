import assert from "node:assert/strict";
import test from "node:test";
import { findNextClass } from "../src/utils/nextClass.js";

test("selects the next same-day class by Sao Paulo time", () => {
  const now = new Date("2026-10-09T14:00:00Z"); // Friday 11:00 in Sao Paulo
  const classes = [
    { weekday: "Segunda-feira", start_time: "09:00:00", subject: "Monday" },
    { weekday: "Sexta-feira", start_time: "15:00:00", subject: "Friday" },
  ];
  assert.equal(findNextClass(classes, now).subject, "Friday");
  assert.equal(findNextClass(classes, now).dayOffset, 0);
});

test("skips a class that has already started", () => {
  const now = new Date("2026-10-09T14:00:00Z");
  const classes = [
    { weekday: "Sexta-feira", start_time: "09:00:00", subject: "Past" },
    { weekday: "Segunda-feira", start_time: "09:00:00", subject: "Next" },
  ];
  assert.equal(findNextClass(classes, now).subject, "Next");
  assert.equal(findNextClass(classes, now).dayOffset, 3);
});

test("handles missing and malformed schedule items", () => {
  assert.equal(findNextClass([], new Date("2026-10-09T14:00:00Z")), null);
  assert.equal(findNextClass([{ weekday: "?" }], new Date("2026-10-09T14:00:00Z")), null);
});
