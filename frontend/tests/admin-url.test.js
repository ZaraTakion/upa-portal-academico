import assert from "node:assert/strict";
import test from "node:test";

import { buildAdminUrl } from "../src/utils/adminUrl.js";

test("builds admin and invoice destinations from the configured backend URL", () => {
  assert.equal(buildAdminUrl("https://api.example.edu/admin/"), "https://api.example.edu/admin/");
  assert.equal(
    buildAdminUrl("https://api.example.edu/admin/", "management_app/financialinvoice/"),
    "https://api.example.edu/admin/management_app/financialinvoice/",
  );
});

test("does not invent a local URL when configuration is missing or invalid", () => {
  assert.equal(buildAdminUrl(""), null);
  assert.equal(buildAdminUrl(undefined), null);
  assert.equal(buildAdminUrl("javascript:alert(1)"), null);
});

test("rejects localhost when building for production", () => {
  assert.equal(buildAdminUrl("http://localhost:8000/admin/", "", { allowLocalhost: false }), null);
});

test("supports same-origin Django admin but never protocol-relative or arbitrary paths", () => {
  const browserOrigin = "https://takion-campus.vercel.app";
  assert.equal(buildAdminUrl("/admin/", "", { browserOrigin }), browserOrigin + "/admin/");
  assert.equal(buildAdminUrl("/admin/", "management_app/financialinvoice/", { browserOrigin }), browserOrigin + "/admin/management_app/financialinvoice/");
  assert.equal(buildAdminUrl("//attacker.test/", "", { browserOrigin }), null);
  assert.equal(buildAdminUrl("/other/", "", { browserOrigin }), null);
  assert.equal(buildAdminUrl("/admin/?next=attacker.test", "", { browserOrigin }), null);
});
