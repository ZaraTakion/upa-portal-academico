import test from "node:test";
import assert from "node:assert/strict";
import { collectPages } from "../src/utils/collectPages.js";

test("collects relation options after the first 100 without following server URLs", async () => {
  const calls = [];
  const client = { get: async (endpoint, config) => {
    calls.push([endpoint, config.params.page]);
    return { data: config.params.page === 1 ? { results: [{ id: 1 }], next: "https://untrusted.test/" } : { results: [{ id: 2 }], next: null } };
  } };
  assert.deepEqual(await collectPages(client, "/academic/students/"), [{ id: 1 }, { id: 2 }]);
  assert.deepEqual(calls, [["/academic/students/", 1], ["/academic/students/", 2]]);
});

test("supports legacy arrays and rejects malformed lists", async () => {
  assert.deepEqual(await collectPages({ get: async () => ({ data: [{ id: 1 }] }) }, "/test/"), [{ id: 1 }]);
  await assert.rejects(() => collectPages({ get: async () => ({ data: {} }) }, "/test/"), /inválida/);
});
