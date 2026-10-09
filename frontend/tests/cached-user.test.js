import assert from "node:assert/strict";
import test from "node:test";
import { getUser, hasGroup, saveUser } from "../src/utils/auth.js";

function withStorage(run) {
  const previous = globalThis.localStorage;
  const storage = new Map();
  globalThis.localStorage = {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
  };
  try {
    run();
  } finally {
    if (previous === undefined) {
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = previous;
    }
  }
}

test("reads a cached user profile and role without crashing", () => withStorage(() => {
  saveUser({ username: "aluno", groups: ["Aluno"] });
  assert.equal(getUser().username, "aluno");
  assert.equal(hasGroup("Aluno"), true);
  assert.equal(hasGroup("Professor"), false);
}));

test("recovers from corrupt JSON in a cached user profile", () => withStorage(() => {
  localStorage.setItem("currentUser", "{bad-json");
  assert.equal(getUser(), null);
  assert.equal(localStorage.getItem("currentUser"), null);
  assert.equal(hasGroup("Professor"), false);
}));

test("rejects null, arrays and scalar user data", () => withStorage(() => {
  for (const value of ["null", "[]", "true", "42", '"plain string"']) {
    localStorage.setItem("currentUser", value);
    assert.equal(getUser(), null);
    assert.equal(localStorage.getItem("currentUser"), null);
  }
}));
