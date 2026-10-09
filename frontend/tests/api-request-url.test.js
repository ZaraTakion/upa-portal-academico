import assert from "node:assert/strict";
import test from "node:test";
import { resolveAllowedApiRequestUrl } from "../src/utils/apiRequestUrl.js";

const apiBaseUrl = "https://api.upa.example/api";
const browserOrigin = "https://portal.upa.example";

test("accepts API-relative requests matching Axios baseURL semantics", () => {
  assert.equal(
    resolveAllowedApiRequestUrl("/accounts/me/", apiBaseUrl, browserOrigin),
    "https://api.upa.example/api/accounts/me/"
  );
  assert.equal(
    resolveAllowedApiRequestUrl("token/refresh/", apiBaseUrl, browserOrigin),
    "https://api.upa.example/api/token/refresh/"
  );
  assert.equal(
    resolveAllowedApiRequestUrl("?page=1", apiBaseUrl, browserOrigin),
    "https://api.upa.example/api/?page=1"
  );
});

test("accepts absolute addresses within the API namespace", () => {
  assert.equal(
    resolveAllowedApiRequestUrl("https://api.upa.example/api/files/42/download/", apiBaseUrl, browserOrigin),
    "https://api.upa.example/api/files/42/download/"
  );
});

test("rejects foreign origins and origin spoofing before credentials are attached", () => {
  for (const destination of [
    "https://attacker.example/collect",
    "//attacker.example/collect",
    "https://api.upa.example.attacker.example/api/collect",
    "http://api.upa.example/api/files/",
    "https://user:pass@attacker.example/api/files/",
  ]) {
    assert.throws(() => resolveAllowedApiRequestUrl(destination, apiBaseUrl, browserOrigin));
  }
});

test("rejects absolute paths outside the API even on the same origin", () => {
  for (const destination of [
    "https://api.upa.example/admin/",
    "https://api.upa.example/api-other/collect",
    "../admin/",
    "/../admin/",
    "/%2e%2e/admin/",
  ]) {
    assert.throws(() => resolveAllowedApiRequestUrl(destination, apiBaseUrl, browserOrigin));
  }
});

test("rejects missing, dangerous scheme and backslash escape requests", () => {
  for (const destination of ["", null, undefined, "javascript:alert(1)", "data:text/plain,test", "\\attacker.example"]) {
    assert.throws(() => resolveAllowedApiRequestUrl(destination, apiBaseUrl, browserOrigin));
  }
});

test("supports API configured at a relative path on the current origin", () => {
  assert.equal(
    resolveAllowedApiRequestUrl("/files/", "/api", browserOrigin),
    "https://portal.upa.example/api/files/"
  );
  assert.throws(() => resolveAllowedApiRequestUrl("https://portal.upa.example/admin/", "/api", browserOrigin));
});
