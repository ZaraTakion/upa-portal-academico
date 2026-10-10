import { expect, test } from "@playwright/test";
import { fileURLToPath } from "node:url";

const baseUrl = "http://127.0.0.1:5173";

async function expectNoAccessibilityViolations(page) {
  await page.addScriptTag({
    path: fileURLToPath(new URL("../node_modules/axe-core/axe.min.js", import.meta.url)),
  });
  const violations = await page.evaluate(async () => {
    const results = await window.axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
      },
    });
    return results.violations.map((violation) => ({
      id: violation.id, impact: violation.impact, help: violation.help,
      elements: violation.nodes.map((node) => ({
        target: node.target.join(", "), summary: node.failureSummary,
      })),
    }));
  });
  expect(violations).toEqual([]);
}

async function login(page, username, password) {
  await page.goto(baseUrl);
  await page.getByLabel("Usuário").fill(username);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar no Portal" }).click();
}

test("visitor sees Campus Folio login and protected pages redirect", async ({ page }) => {
  await page.goto(`${baseUrl}/teacher/classes`);
  await expect(page).toHaveURL(`${baseUrl}/`);
  await expect(page.getByRole("heading", { name: "Seu próximo capítulo." })).toBeVisible();
  await expectNoAccessibilityViolations(page);
});

test("student signs in and cannot access teacher pages", async ({ page }) => {
  await login(page, "rodrigo", "aluno123");
  await expect(page).toHaveURL(`${baseUrl}/dashboard`);
  await expect(page.getByRole("heading", { name: /Olá, Rodrigo Maciel/ })).toBeVisible();
  await expectNoAccessibilityViolations(page);
  await page.getByRole("button", { name: "Ativar tema escuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== "running"));
  await expectNoAccessibilityViolations(page);
  await page.goto(`${baseUrl}/subjects`);
  await expect(page.getByRole("heading", { name: "Disciplinas" })).toBeVisible();
  await page.goto(`${baseUrl}/teacher/classes`);
  await expect(page).toHaveURL(`${baseUrl}/dashboard`);
});

test("professor and administrator go to their own workspaces", async ({ browser }) => {
  for (const [username, password, path] of [
    ["leandro", "prof123", "/teacher/classes"],
    ["admin", "admin123", "/admin-panel"],
  ]) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page, username, password);
    await expect(page).toHaveURL(`${baseUrl}${path}`);
    await page.goto(`${baseUrl}/dashboard`);
    await expect(page).toHaveURL(`${baseUrl}${path}`);
    await context.close();
  }
});

test("mobile layout keeps primary actions usable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page, "rodrigo", "aluno123");
  await expect(page.getByRole("heading", { name: /Olá, Rodrigo Maciel/ })).toBeVisible();
  await page.getByRole("button", { name: "Abrir menu de navegação" }).click();
  await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
  await expectNoAccessibilityViolations(page);
});


const apiUrl = "http://127.0.0.1:8000/api";

async function apiAs(page, method, path, data) {
  const username = await page.evaluate(() => JSON.parse(localStorage.getItem("currentUser")).username);
  const password = { rodrigo: "aluno123", leandro: "prof123", admin: "admin123" }[username];
  const csrf = await (await page.request.get(`${apiUrl}/accounts/csrf/`)).json();
  const loginResponse = await page.request.post(`${apiUrl}/token/`, {
    data: { username, password }, headers: { "X-CSRFToken": csrf.csrfToken },
  });
  expect(loginResponse.status()).toBe(200);
  const access = (await loginResponse.json()).access;
  const options = { method, headers: { Authorization: `Bearer ${access}` } };
  if (data !== undefined) options.data = data;
  return page.request.fetch(`${apiUrl}${path}`, options);
}

test("student's API data are private and academic mutations require privileges", async ({ page }) => {
  await login(page, "rodrigo", "aluno123");
  await expect(page).toHaveURL(`${baseUrl}/dashboard`);
  const self = await apiAs(page, "GET", "/accounts/me/");
  expect(self.status()).toBe(200);
  expect((await self.json()).groups).toContain("Aluno");
  const profile = await apiAs(page, "GET", "/academic/students/");
  expect(profile.status()).toBe(200);
  const entries = await profile.json();
  expect(entries.length).toBe(1);
  const forbidden = await apiAs(page, "POST", "/academic/courses/", {
    name: "Curso que aluno não pode criar", duration_semesters: 8,
  });
  expect(forbidden.status()).toBe(403);
  await page.goto(`${baseUrl}/admin-panel`);
  await expect(page).toHaveURL(`${baseUrl}/dashboard`);
});

test("refresh recovers an expired access token and a missing cached token", async ({ page }) => {
  await login(page, "rodrigo", "aluno123");
  await expect(page).toHaveURL(`${baseUrl}/dashboard`);

  await page.evaluate(() => localStorage.setItem("accessToken", "expired-token-for-test"));
  await page.reload();
  await expect(page.getByRole("heading", { name: /Olá, Rodrigo Maciel/ })).toBeVisible();
  const restored = await page.evaluate(() => localStorage.getItem("accessToken"));
  expect(restored).toBeNull();

  await page.evaluate(() => localStorage.removeItem("accessToken"));
  await page.reload();
  await expect(page).toHaveURL(`${baseUrl}/dashboard`);
  await expect(page.getByRole("heading", { name: /Olá, Rodrigo Maciel/ })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("accessToken"))).toBeNull();
});

test("logout clears session and denies navigation to authenticated pages", async ({ page }) => {
  await login(page, "rodrigo", "aluno123");
  await expect(page).toHaveURL(`${baseUrl}/dashboard`);
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(`${baseUrl}/`);
  expect(await page.evaluate(() => localStorage.getItem("accessToken"))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("sessionStarted"))).toBeNull();
  await page.goto(`${baseUrl}/dashboard`);
  await expect(page).toHaveURL(`${baseUrl}/`);
});

test("professor creates an assessment and does not gain administrator access", async ({ page }) => {
  await login(page, "leandro", "prof123");
  await expect(page).toHaveURL(`${baseUrl}/teacher/classes`);
  const self = await apiAs(page, "GET", "/accounts/me/");
  expect((await self.json()).groups).toContain("Professor");
  const forbidden = await apiAs(page, "POST", "/academic/courses/", {
    name: "Curso proibido", duration_semesters: 6,
  });
  expect(forbidden.status()).toBe(403);
  await page.goto(`${baseUrl}/teacher/assessments`);
  await expect(page.getByRole("heading", { name: "Avaliações e notas" })).toBeVisible();
  await expect(page.getByLabel("Turma", { exact: true })).not.toHaveValue("");
  const title = `Avaliação E2E ${Date.now()}`;
  await page.getByLabel("Título").fill(title);
  await page.getByRole("button", { name: "Criar avaliação" }).click();
  await expect(page.getByText("Avaliação criada.")).toBeVisible();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await page.goto(`${baseUrl}/admin-panel`);
  await expect(page).toHaveURL(`${baseUrl}/teacher/classes`);
});

test("administrator creates a course and has visibility of all students", async ({ page }) => {
  await login(page, "admin", "admin123");
  await expect(page).toHaveURL(`${baseUrl}/admin-panel`);
  const self = await apiAs(page, "GET", "/accounts/me/");
  expect((await self.json()).is_superuser).toBe(true);
  const studentList = await apiAs(page, "GET", "/academic/students/");
  expect(studentList.status()).toBe(200);
  expect((await studentList.json()).length).toBeGreaterThanOrEqual(4);
  await page.goto(`${baseUrl}/admin/management?section=courses`);
  await expect(page.getByRole("heading", { name: "Gestão acadêmica" })).toBeVisible();
  const name = `Curso Validado ${Date.now()}`;
  await page.getByLabel("Nome do curso").fill(name);
  await page.getByLabel("Duração (semestres)").fill("6");
  await page.getByRole("button", { name: "Criar registro" }).click();
  await expect(page.getByText("Registro salvo com sucesso.")).toBeVisible();
  await expect(page.getByRole("cell", { name })).toBeVisible();
  await page.goto(`${baseUrl}/teacher/classes`);
  await expect(page).toHaveURL(`${baseUrl}/admin-panel`);
});
