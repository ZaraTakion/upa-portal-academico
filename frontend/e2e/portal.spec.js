import { expect, test } from "@playwright/test";

const baseUrl = "http://127.0.0.1:5173";

test("unauthenticated visitors are redirected to login", async ({ page }) => {
  await page.goto(`${baseUrl}/teacher/classes`);

  await expect(page).toHaveURL(`${baseUrl}/`);
  await expect(
    page.getByRole("heading", { name: "Bem-vindo de volta" }),
  ).toBeVisible();
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

  await page.goto(`${baseUrl}/teacher/classes`);
  await expect(page).toHaveURL(`${baseUrl}/dashboard`);
  await expect(
    page.getByRole("heading", { name: /Olá, Rodrigo Maciel/ }),
  ).toBeVisible();
});
