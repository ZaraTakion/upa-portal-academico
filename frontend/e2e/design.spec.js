import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";

const widths = [320, 360, 390, 430, 768, 1024, 1366, 1440, 1920, 2560, 3840];
const sections = [
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
];
const profiles = {
  public: {
    paths: [
      "/",
      "/forgot-password",
      "/reset-password/ficticio/link-ficticio",
      "/pagina-inexistente",
    ],
  },
  student: {
    username: "rodrigo",
    password: "aluno123",
    paths: [
      "/dashboard",
      "/profile",
      "/subjects",
      "/grades",
      "/calendar",
      "/notifications",
      "/files",
      "/financial",
      "/contact",
      "/pagina-inexistente",
    ],
  },
  professor: {
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
      "/pagina-inexistente",
    ],
  },
  admin: {
    username: "admin",
    password: "admin123",
    paths: [
      "/admin-panel",
      ...sections.map((section) => `/admin/management?section=${section}`),
      "/notifications",
      "/contact",
      "/pagina-inexistente",
    ],
  },
};
async function signIn(page, profile) {
  await page.goto("/");
  await page.getByLabel("Usuário", { exact: true }).fill(profile.username);
  await page.getByLabel("Senha", { exact: true }).fill(profile.password);
  await page
    .getByRole("button", { name: "Entrar no Portal", exact: true })
    .click();
  await expect(page).not.toHaveURL("http://127.0.0.1:5173/");
}
async function ready(page) {
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".loading")).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
}
async function audit(page) {
  await page.addScriptTag({
    path: fileURLToPath(
      new URL("../node_modules/axe-core/axe.min.js", import.meta.url),
    ),
  });
  const violations = await page.evaluate(async () =>
    (
      await window.axe.run(document, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
        },
      })
    ).violations.map(({ id, nodes }) => ({
      id,
      targets: nodes.map((n) => n.target),
      details: nodes.map((n) => n.failureSummary),
    })),
  );
  expect(violations).toEqual([]);
}
for (const [role, profile] of Object.entries(profiles))
  for (const width of widths) {
    test(`design: ${role} at ${width}px, light and dark`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(180000);
      await page.setViewportSize({ width, height: 900 });
      if (profile.username) await signIn(page, profile);
      else await page.goto("/");
      const checks = [];
      for (const theme of ["light", "dark"]) {
        await page.evaluate(
          (value) => localStorage.setItem("theme", value),
          theme,
        );
        for (const path of profile.paths) {
          await page.goto(path);
          await ready(page);
          await expect(page.locator("html")).toHaveAttribute(
            "data-theme",
            theme,
          );
          const layout = await page.evaluate(() => ({
            scroll: document.documentElement.scrollWidth,
            viewport: innerWidth,
            clippedControls: [
              ...document.querySelectorAll(
                "main input, main select, main textarea, main button",
              ),
            ]
              .filter(
                (el) =>
                  el.getClientRects().length && !el.closest(".table-wrapper"),
              )
              .filter(
                (el) =>
                  el.getBoundingClientRect().right > innerWidth + 1 ||
                  el.getBoundingClientRect().left < 0,
              )
              .map((el) => el.outerHTML.slice(0, 180)),
          }));
          expect(layout.scroll, `${role} ${path} ${theme}`).toBeLessThanOrEqual(
            width + 1,
          );
          expect(layout.clippedControls, `${role} ${path} ${theme}`).toEqual(
            [],
          );
          expect(await page.locator(".brand").first().innerText()).toContain(
            "Takion",
          );
          await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
          if (width === 320 || width === 1440) await audit(page);
          if (width === 1440 && theme === "light")
            await testInfo.attach(
              `${role}-${path.replace(/[^a-z0-9]/gi, "-")}`,
              { body: await page.screenshot(), contentType: "image/png" },
            );
          checks.push({
            role,
            path,
            width,
            theme,
            ...layout,
            axe: width === 320 || width === 1440 ? "passed" : "not-run",
          });
        }
      }
      await testInfo.attach("responsive-evidence", {
        body: JSON.stringify(checks, null, 2),
        contentType: "application/json",
      });
    });
  }

test("navigation keeps one current section and a named collapsed menu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await signIn(page, profiles.admin);
  for (const section of ["users", "calendar", "invoices", "subjects"]) {
    await page.goto(`/admin/management?section=${section}`);
    await ready(page);
    await expect(
      page.locator('#sidebar-nav [aria-current="page"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('.management-nav [aria-pressed="true"]'),
    ).toHaveCount(1);
  }
  await page
    .getByRole("button", { name: "Recolher menu", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Painel de Gestão", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Painel de Gestão", exact: true })
    .click();
  await expect(page).toHaveURL(/admin-panel/);
});

test("text zoom reflows, reduced motion and keyboard focus remain usable", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await signIn(page, profiles.student);
  for (const path of [
    "/dashboard",
    "/profile",
    "/subjects",
    "/grades",
    "/calendar",
    "/files",
    "/financial",
    "/contact",
  ]) {
    await page.setViewportSize({ width: 640, height: 900 });
    await page.goto(path);
    await ready(page);
    await page.evaluate(
      () => (document.documentElement.style.fontSize = "200%"),
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(641);
    await page.evaluate(() => (document.documentElement.style.fontSize = ""));
  }
  await page.goto("/dashboard");
  await ready(page);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Pular para o conteúdo" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await page.getByRole("button", { name: "Abrir menu de navegação" }).click();
  await expect(
    page.getByRole("button", { name: "Fechar menu de navegação" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("link", { name: "Atendimento", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Abrir menu de navegação" }),
  ).toBeFocused();
  expect(
    await page
      .locator(".sidebar")
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("1e-05s");
});
