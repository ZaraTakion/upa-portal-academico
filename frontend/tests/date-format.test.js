import assert from "node:assert/strict";
import test from "node:test";

import { formatDate, formatDateTime } from "../src/utils/dateFormat.js";

test("formats date-only values in Brazilian format without shifting the day", () => {
  assert.equal(formatDate("2026-10-05"), "05/10/2026");
});

test("uses a fallback for missing and invalid values", () => {
  assert.equal(formatDate(null), "—");
  assert.equal(formatDate("not-a-date"), "—");
  assert.equal(formatDate("", "Sem data"), "Sem data");
});

test("formats timestamps in the São Paulo timezone", () => {
  assert.equal(formatDateTime("2026-10-05T15:30:00Z"), "05/10/2026, 12:30");
});
