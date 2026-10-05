import assert from "node:assert/strict";
import test from "node:test";

import { getRoleHome, getUserRole } from "../src/utils/roles.js";

test("resolves student, professor, and administrator roles", () => {
  assert.equal(getUserRole({ username: "student" }), "student");
  assert.equal(getUserRole({ groups: ["Professor"] }), "professor");
  assert.equal(getUserRole({ is_staff: true }), "admin");
  assert.equal(getUserRole({ is_superuser: true, groups: ["Professor"] }), "admin");
});

test("sends each role to its own home page", () => {
  assert.equal(getRoleHome({ username: "student" }), "/dashboard");
  assert.equal(getRoleHome({ groups: ["Professor"] }), "/teacher/classes");
  assert.equal(getRoleHome({ is_staff: true }), "/admin-panel");
});
