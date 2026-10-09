import assert from "node:assert/strict";
import test from "node:test";
import { resolveApiDownloadUrl } from "../src/utils/allowedDownloadUrl.js";

const base = "https://api.upatest.example/api";
const origin = "https://portal.upatest.example";

test("permits only downloads under the configured API", () => {
  assert.equal(
    resolveApiDownloadUrl("/api/files/12/download/", base, origin),
    "https://api.upatest.example/api/files/12/download/"
  );
  assert.equal(
    resolveApiDownloadUrl("https://api.upatest.example/api/files/12/download/", base, origin),
    "https://api.upatest.example/api/files/12/download/"
  );
});

test("rejects foreign origins and deceptive path prefixes", () => {
  const paths = [
    "https://evil.example/collect",
    "https://api.upatest.example.evil.example/api/files/12/download/",
    "//evil.example/collect",
    "https://api.upatest.example/api-other/files/12/download/",
    "https://api.upatest.example/other/",
    "",
    null,
  ];
  for (const path of paths) {
    assert.throws(() => resolveApiDownloadUrl(path, base, origin));
  }
});

test("supports relative API base URL without allowing other application paths", () => {
  assert.equal(
    resolveApiDownloadUrl("/api/files/1/download/", "/api", origin),
    "https://portal.upatest.example/api/files/1/download/"
  );
  assert.throws(() => resolveApiDownloadUrl("/admin", "/api", origin));
});
