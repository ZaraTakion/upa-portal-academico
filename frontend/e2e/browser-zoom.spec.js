/* global chrome */
import { chromium, test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Use Chromium's real tab zoom through a test-only extension, rather than CSS zoom.
test("real browser zoom at 200% and 400% reflows public and role workspaces", async ({ browserName }, testInfo) => {
  test.setTimeout(240000);
  expect(browserName).toBe("chromium");
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "campus-browser-zoom-"),
  );
  const extension = fileURLToPath(
    new URL("./fixtures/zoom-extension", import.meta.url),
  );
  const context = await chromium.launchPersistentContext(directory, {
    channel: "chromium",
    headless: true,
    viewport: null,
    args: [
      `--disable-extensions-except=${extension}`,
      `--load-extension=${extension}`,
      "--window-size=1280,900",
    ],
  });
  try {
    const worker =
      context.serviceWorkers()[0] ||
      (await context.waitForEvent("serviceworker"));
    const page = context.pages()[0];
    await page.goto("http://127.0.0.1:5173/");
    const tabs = await worker.evaluate(() => chrome.tabs.query({}));
    const tab = tabs.find((item) =>
      item.url.startsWith("http://127.0.0.1:5173"),
    );
    const checks = [];
    const profiles = [
      {
        role: "public",
        paths: [
          "/",
          "/forgot-password",
          "/reset-password/ficticio/link-ficticio",
          "/pagina-inexistente",
        ],
      },
      {
        role: "student",
        username: "rodrigo",
        password: "aluno123",
        paths: [
          "/dashboard",
          "/profile",
          "/subjects",
          "/grades",
          "/calendar",
          "/files",
          "/financial",
          "/notifications",
          "/contact",
        ],
      },
      {
        role: "professor",
        username: "leandro",
        password: "prof123",
        paths: [
          "/teacher/classes",
          "/teacher/students",
          "/teacher/grades",
          "/teacher/attendance",
          "/teacher/assessments",
          "/files",
          "/notifications",
          "/contact",
        ],
      },
      {
        role: "admin",
        username: "admin",
        password: "admin123",
        paths: [
          "/admin-panel",
          ...[
            "users",
            "students",
            "teachers",
            "invoices",
            "notifications",
            "schedule",
            "courses",
            "terms",
            "subjects",
            "classes",
            "enrollments",
            "calendar",
            "gradePolicy",
          ].map((section) => `/admin/management?section=${section}`),
          "/contact",
          "/notifications",
        ],
      },
    ];
    for (const profile of profiles) {
      await worker.evaluate((id) => chrome.tabs.setZoom(id, 1), tab.id);
      if (profile.username) {
        await page.goto("http://127.0.0.1:5173/");
        await page
          .getByLabel("Usuário", { exact: true })
          .fill(profile.username);
        await page.getByLabel("Senha", { exact: true }).fill(profile.password);
        await page.getByRole("button", { name: "Entrar no Portal" }).click();
        await expect(page).not.toHaveURL("http://127.0.0.1:5173/");
      }
      for (const zoom of [2, 4]) {
        await worker.evaluate(
          ({ id, value }) => chrome.tabs.setZoom(id, value),
          { id: tab.id, value: zoom },
        );
        expect(
          await worker.evaluate((id) => chrome.tabs.getZoom(id), tab.id),
        ).toBeCloseTo(zoom, 6);
        for (const route of profile.paths) {
          await page.goto(`http://127.0.0.1:5173${route}`);
          await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
          await expect(page.locator(".loading")).toHaveCount(0);
          const size = await page.evaluate(() => ({
            viewport: innerWidth,
            scroll: document.documentElement.scrollWidth,
            dpr: devicePixelRatio,
          }));
          expect(size.viewport).toBe(1280 / zoom);
          expect(
            size.scroll,
            `${profile.role} ${route} at ${zoom * 100}%`,
          ).toBeLessThanOrEqual(size.viewport + 1);
          checks.push({ role: profile.role, route, zoom, ...size });
        }
        await testInfo.attach(`${profile.role}-${zoom * 100}-percent`, {
          body: await page.screenshot(),
          contentType: "image/png",
        });
      }
      if (profile.username) {
        await page.getByRole("button", { name: "Sair", exact: true }).click();
        await expect(page).toHaveURL("http://127.0.0.1:5173/");
      }
    }
    await testInfo.attach("real-browser-zoom-evidence", {
      body: JSON.stringify(checks, null, 2),
      contentType: "application/json",
    });
  } finally {
    await context.close();
    await fs.rm(directory, { recursive: true, force: true });
  }
});
