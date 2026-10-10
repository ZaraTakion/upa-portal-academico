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
  await page.getByRole("button", { name: "Entrar no campus" }).click();
}

test("visitor sees Campus Folio login and protected pages redirect", async ({ page }) => {
  await page.goto(`${baseUrl}/teacher/classes`);
  await expect(page).toHaveURL(`${baseUrl}/`);
  await expect(page.getByRole("heading", { name: "Um espaço para aprender." })).toBeVisible();
  await expectNoAccessibilityViolations(page);
});

test("student signs in and cannot access teacher pages", async ({ page }) => {
  await login(page, "rodrigo", "aluno123");
  await expect(page).toHaveURL(`${baseUrl}/dashboard`);
  await expect(page.getByRole("heading", { name: /Olá, Rodrigo Maciel/ })).toBeVisible();
  await expectNoAccessibilityViolations(page);
  await page.getByRole("button", { name: "Ativar tema escuro" }).click();
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
