import { expect, test } from "@playwright/test";

const baseUrl = "http://127.0.0.1:5173";

async function expectNoAccessibilityViolations(page) {
  await page.addScriptTag({
    path: `${process.cwd()}/node_modules/axe-core/axe.min.js`,
  });
  const violations = await page.evaluate(async () => {
    const results = await window.axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
      },
    });
    return results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      elements: violation.nodes.map((node) => node.target.join(", ")),
    }));
  });
  expect(violations).toEqual([]);
}

test("unauthenticated visitors are redirected to login", async ({ page }) => {
  await page.goto(`${baseUrl}/teacher/classes`);

  await expect(page).toHaveURL(`${baseUrl}/`);
  await expect(
    page.getByRole("heading", { name: "Bem-vindo de volta" }),
  ).toBeVisible();
  await expectNoAccessibilityViolations(page);
});

test("student can sign in and cannot open teacher pages", async ({ page }) => {
  await page.goto(baseUrl);
  await page.getByLabel("Usuário").fill("rodrigo");
  await page.getByLabel("Senha").fill("aluno123");
  await page.getByRole("button", { name: "Entrar no Portal" }).click();

  await expect(page).toHaveURL(`${baseUrl}/dashboard`);
  await expect(
    page.getByRole("heading", { name: /Olá, Rodrigo Maciel/ }),
  ).toBeVisible();
  await expectNoAccessibilityViolations(page);

  await page.goto(`${baseUrl}/teacher/classes`);
  await expect(page).toHaveURL(`${baseUrl}/dashboard`);
  await expect(
    page.getByRole("heading", { name: /Olá, Rodrigo Maciel/ }),
  ).toBeVisible();
});
