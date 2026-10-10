import assert from "node:assert/strict";
import test from "node:test";
import { getLoginErrorMessage } from "../src/utils/loginErrors.js";

test("wrong credentials do not reveal account existence", () => {
  assert.match(getLoginErrorMessage({ response: { status: 401 } }), /Usuário ou senha/);
});
test("rate limit is distinguished from invalid credentials", () => {
  assert.match(getLoginErrorMessage({ response: { status: 429 } }), /Muitas tentativas/);
});
test("API connection errors are distinguished from password failures", () => {
  assert.match(getLoginErrorMessage({ request: {} }), /conectar à API/);
});
test("server errors do not claim password mismatch", () => {
  assert.match(getLoginErrorMessage({ response: { status: 503 } }), /API está/);
});
