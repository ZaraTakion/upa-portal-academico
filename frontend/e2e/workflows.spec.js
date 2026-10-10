import { Buffer } from "node:buffer";
import process from "node:process";
import { expect, test } from "@playwright/test";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

const apiUrl = "http://127.0.0.1:8000/api";
const unique = () => `Teste ${Date.now()}`;

async function login(page, username = "rodrigo", password = "aluno123") {
  await page.goto("/");
  await page.getByLabel("Usuário", { exact: true }).fill(username);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar no Portal" }).click();
  await expect(page).not.toHaveURL("http://127.0.0.1:5173/");
}

async function token(request, username, password) {
  const csrf = await (await request.get(`${apiUrl}/accounts/csrf/`)).json();
  const response = await request.post(`${apiUrl}/token/`, { data: { username, password }, headers: { "X-CSRFToken": csrf.csrfToken } });
  expect(response.status()).toBe(200);
  return (await response.json()).access;
}

async function axe(page) {
  await page.evaluate(() => Promise.all(document.getAnimations().filter(animation => Number.isFinite(animation.effect.getComputedTiming().iterations)).map((animation) => animation.finished.catch(() => {}))));
  await page.addScriptTag({ path: fileURLToPath(new URL("../node_modules/axe-core/axe.min.js", import.meta.url)) });
  const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } })).violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target }) => target) })));
  expect(violations).toEqual([]);
}

async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}

test("session is restored from HttpOnly cookie and logout revokes it", async ({ page }) => {
  await login(page);
  expect(await page.evaluate(() => localStorage.getItem("accessToken"))).toBeNull();
  await page.reload();
  await expect(page.getByRole("heading", { name: /Olá, Rodrigo/ })).toBeVisible();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL("http://127.0.0.1:5173/");
  await page.goto("/dashboard");
  await expect(page).toHaveURL("http://127.0.0.1:5173/");
});

test("a rejected access token is refreshed and the original request succeeds", async ({ page }) => {
  await login(page);
  let first = true;
  await page.route("**/api/academic/grades/", (route) => {
    if (first) { first = false; return route.continue({ headers: { ...route.request().headers(), authorization: "Bearer expired-test-token" } }); }
    return route.continue();
  });
  await page.goto("/grades");
  await expect(page.getByRole("heading", { name: "Notas e avaliações", exact: true })).toBeVisible();
  await expect(page.getByText("9.50", { exact: true })).toBeVisible();
});

test("student profile changes persist and server denies another student's records", async ({ page, request }) => {
  await login(page);
  await page.goto("/profile");
  await page.getByLabel("Telefone", { exact: true }).fill("000-TESTE");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByText("Perfil atualizado com sucesso.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Telefone", { exact: true })).toHaveValue("000-TESTE");
  const admin = await token(request, "admin", "admin123");
  const profiles = await (await request.get(`${apiUrl}/academic/students/`, { headers: { Authorization: `Bearer ${admin}` } })).json();
  const ana = profiles.find((profile) => profile.username === "ana");
  const student = await token(request, "rodrigo", "aluno123");
  const headers = { Authorization: `Bearer ${student}` };
  expect((await request.get(`${apiUrl}/academic/students/${ana.id}/`, { headers })).status()).toBe(404);
  expect((await request.patch(`${apiUrl}/academic/students/${ana.id}/`, { headers, data: { phone: "intrusão" } })).status()).toBe(404);
  expect((await request.post(`${apiUrl}/academic/assessment-results/`, { headers, data: {} })).status()).toBe(403);
  expect((await request.get(`${apiUrl}/accounts/users/`, { headers })).status()).toBe(403);
});

test("teacher creates assessment, records grade and frequency; student sees persisted result", async ({ page }) => {
  const title = unique();
  await login(page, "leandro", "prof123");
  await expect(page).toHaveURL(/teacher\/classes/);
  await page.goto("/teacher/assessments");
  await page.getByLabel("Título", { exact: true }).fill(title);
  await page.getByRole("button", { name: "Criar avaliação", exact: true }).click();
  const assessment = page.getByRole("article").filter({ has: page.getByRole("heading", { name: title, exact: true }) });
  await expect(assessment).toBeVisible();
  const row = assessment.getByRole("row").filter({ hasText: "Rodrigo Maciel" });
  await row.getByLabel("Nota de Rodrigo Maciel").fill("8.5");
  await row.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByText("Nota salva.", { exact: true })).toBeVisible();
  await page.reload();
  await expect(assessment.getByLabel("Nota de Rodrigo Maciel")).toHaveValue("8.50");
  await axe(page);
  await page.goto("/teacher/attendance");
  await page.getByLabel("Data da aula").fill("2026-10-10");
  await page.getByLabel("Presença de Rodrigo Maciel").uncheck();
  await page.getByRole("button", { name: "Salvar frequência" }).click();
  await expect(page.getByText("Frequência salva.")).toBeVisible();
  await page.reload();
  await page.getByLabel("Data da aula").fill("2026-10-10");
  await expect(page.getByLabel("Presença de Rodrigo Maciel")).not.toBeChecked();
  await axe(page);
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL("http://127.0.0.1:5173/");
  await login(page);
  await page.goto("/grades");
  const card = page.getByRole("heading", { name: title, exact: true }).locator("..");
  await expect(card).toContainText("8.50");
});

test("another teacher cannot manage a class belonging to the demo teacher", async ({ request }) => {
  const admin = await token(request, "admin", "admin123");
  const username = `teacher-${Date.now()}`;
  const headers = { Authorization: `Bearer ${admin}` };
  const response = await request.post(`${apiUrl}/accounts/users/`, { headers, data: { username, password: "Senha-ficticia-forte-532!", role: "professor" } });
  expect(response.status()).toBe(201);
  const classes = await (await request.get(`${apiUrl}/academic/class-groups/`, { headers })).json();
  const other = await token(request, username, "Senha-ficticia-forte-532!");
  const otherHeaders = { Authorization: `Bearer ${other}` };
  expect((await request.get(`${apiUrl}/academic/class-groups/${classes[0].id}/`, { headers: otherHeaders })).status()).toBe(404);
  expect((await request.post(`${apiUrl}/academic/assessments/`, { headers: otherHeaders, data: { title: "Proibida", class_group: classes[0].id } })).status()).toBe(400);
  const roster = await (await request.get(`${apiUrl}/academic/class-enrollments/?class_group=${classes[0].id}`, { headers })).json();
  expect((await request.post(`${apiUrl}/academic/attendance/batch/`, { headers: otherHeaders, data: { class_group: classes[0].id, date: "2026-10-10", records: [{ student: roster[0].student, present: false }] } })).status()).toBe(400);
});

test("administrator creates account and student profile through the interface", async ({ page }) => {
  const username = `student-${Date.now()}`;
  await login(page, "admin", "admin123");
  await expect(page).toHaveURL(/admin-panel/);
  await page.goto("/admin/management?section=users");
  await page.getByLabel("Usuário", { exact: true }).fill(username);
  await page.getByLabel("Nome", { exact: true }).fill("Estudante Fictício");
  await page.getByLabel("Perfil de acesso").selectOption("student");
  await page.getByLabel(/Senha \(obrigatória/).fill("Senha-ficticia-forte-532!");
  await page.getByRole("button", { name: "Criar registro" }).click();
  await expect(page.getByText("Registro salvo com sucesso.")).toBeVisible();
  await page.goto("/admin/management?section=students");
  await page.getByLabel("Conta de estudante").selectOption({ label: username });
  await page.getByLabel("Matrícula", { exact: true }).fill(`S${Date.now()}`);
  await page.getByLabel("Curso", { exact: true }).selectOption({ label: "Sistemas para Internet" });
  await page.getByLabel("Semestre", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Criar registro" }).click();
  await expect(page.getByText("Registro salvo com sucesso.")).toBeVisible();
  await axe(page);
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL("http://127.0.0.1:5173/");
  await login(page, username, "Senha-ficticia-forte-532!");
  await expect(page.getByRole("heading", { name: /Olá, Estudante Fictício/ })).toBeVisible();
});

test("administrator publishes an invoice and notice; student reads both", async ({ page }) => {
  const description = unique();
  await login(page, "admin", "admin123");
  await page.goto("/admin/management?section=invoices");
  await page.getByLabel("Titular", { exact: true }).selectOption({ label: "rodrigo" });
  await page.getByLabel("Descrição", { exact: true }).fill(description);
  await page.getByLabel("Valor (R$)").fill("125.50");
  await page.getByLabel("Vencimento", { exact: true }).fill("2026-12-20");
  await page.getByRole("button", { name: "Criar registro" }).click();
  await expect(page.getByText("Registro salvo com sucesso.")).toBeVisible();
  await page.goto("/admin/management?section=notifications");
  await page.getByLabel("Destinatário").selectOption({ label: "rodrigo" });
  await page.getByLabel("Título", { exact: true }).fill(description);
  await page.getByLabel("Mensagem", { exact: true }).fill("Aviso fictício enviado pela administração.");
  await page.getByRole("button", { name: "Criar registro" }).click();
  await expect(page.getByText("Registro salvo com sucesso.")).toBeVisible();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL("http://127.0.0.1:5173/");
  await login(page);
  await page.goto("/financial");
  await expect(page.getByText(description, { exact: true })).toBeVisible();
  await page.goto("/notifications");
  const notice = page.getByRole("article").filter({ hasText: description });
  await notice.getByRole("button", { name: "Marcar como lida" }).click();
  await expect(notice.getByRole("button", { name: "Marcar como lida" })).toHaveCount(0);
  await page.reload();
  await expect(notice.getByRole("button", { name: "Marcar como lida" })).toHaveCount(0);
});

test("student opens a ticket; administrator responds; student sees the response", async ({ page }) => {
  const subject = unique();
  await login(page);
  await page.goto("/contact");
  await page.getByLabel("Assunto", { exact: true }).fill(subject);
  await page.getByLabel("Mensagem", { exact: true }).fill("Solicitação fictícia de atendimento.");
  await page.getByRole("button", { name: "Enviar solicitação" }).click();
  await expect(page.getByText(/Solicitação registrada. Protocolo:/)).toBeVisible();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL("http://127.0.0.1:5173/");
  await login(page, "admin", "admin123");
  await page.goto("/contact");
  const ticket = page.getByRole("listitem").filter({ hasText: subject });
  await ticket.getByLabel(`Resposta para ${subject}`).fill("Resposta fictícia registrada.");
  await ticket.getByRole("button", { name: "Responder solicitação" }).click();
  await expect(page.getByText("Resposta enviada ao solicitante.")).toBeVisible();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL("http://127.0.0.1:5173/");
  await login(page);
  await page.goto("/contact");
  await expect(page.getByRole("listitem").filter({ hasText: subject })).toContainText("Resposta fictícia registrada.");
});

test("teacher publishes activity, student uploads, teacher reviews and download is private", async ({ page, request }) => {
  const title = unique();
  const payload = { name: "atividade.txt", mimeType: "text/plain", buffer: Buffer.from("Conteúdo fictício de atividade.") };
  await login(page, "leandro", "prof123");
  await page.goto("/files");
  await page.getByLabel("Título", { exact: true }).fill(title);
  await page.getByLabel("Turma", { exact: true }).selectOption({ index: 1 });
  await page.getByLabel("Tipo", { exact: true }).selectOption("assignment");
  await page.getByLabel("Prazo de entrega").fill("2027-12-20T12:00");
  await page.getByLabel(/Arquivo \(PDF/).setInputFiles(payload);
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(page.getByText("Arquivo enviado com sucesso.")).toBeVisible();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL("http://127.0.0.1:5173/");
  await login(page);
  await page.goto("/files");
  await page.getByLabel("Título", { exact: true }).fill(`Entrega ${title}`);
  await page.getByLabel("Atividade (opcional)").selectOption({ label: title });
  await page.getByLabel("Turma", { exact: true }).selectOption({ index: 1 });
  await page.getByLabel(/Arquivo \(PDF/).setInputFiles(payload);
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(page.getByText("Arquivo enviado com sucesso.")).toBeVisible();
  const submission = page.getByRole("listitem").filter({ has: page.getByText(`Entrega ${title}`, { exact: true }) });
  const downloadPromise = page.waitForEvent("download");
  await submission.getByRole("button", { name: "Baixar", exact: true }).click();
  const download = await downloadPromise;
  expect(await download.failure()).toBeNull();
  const studentAccess = await token(request, "rodrigo", "aluno123");
  const files = await (await request.get(`${apiUrl}/files/`, { headers: { Authorization: `Bearer ${studentAccess}` } })).json();
  const file = files.find((item) => item.title === `Entrega ${title}`);
  const anaAccess = await token(request, "ana", "aluno123");
  expect((await request.get(new URL(file.download_url, apiUrl).href, { headers: { Authorization: `Bearer ${anaAccess}` } })).status()).toBe(404);
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL("http://127.0.0.1:5173/");
  await login(page, "leandro", "prof123");
  await page.goto("/files");
  const teacherSubmission = page.getByRole("listitem").filter({ has: page.getByText(`Entrega ${title}`, { exact: true }) });
  await teacherSubmission.getByRole("button", { name: "Adicionar devolutiva" }).click();
  await teacherSubmission.getByLabel("Devolutiva", { exact: true }).fill("Entrega revisada com sucesso.");
  await teacherSubmission.getByRole("button", { name: "Salvar devolutiva" }).click();
  await expect(teacherSubmission).toContainText("Entrega revisada com sucesso.");
});

test("password recovery uses the real email output and the link is single-use", async ({ page }) => {
  const mailPath = process.env.EMAIL_FILE_PATH || "/tmp/upa-verification-emails";
  const previousMessages = new Set(await fs.readdir(mailPath).catch(() => []));
  await page.goto("/forgot-password");
  await page.getByLabel("E-mail cadastrado", { exact: true }).fill("recuperacao@example.test");
  await page.getByRole("button", { name: /Enviar/ }).click();
  await expect(page.getByRole("alert")).toContainText("Se houver uma conta ativa");
  await expect.poll(async () => (await fs.readdir(mailPath).catch(() => [])).length).toBeGreaterThan(0);
  let latest;
  await expect.poll(async () => {
    const entries = (await fs.readdir(mailPath)).filter((name) => !previousMessages.has(name));
    const messages = await Promise.all(entries.sort().reverse().map((name) => fs.readFile(`${mailPath}/${name}`, "utf8")));
    latest = messages.find((message) => message.includes("To: recuperacao@example.test") && message.includes("/reset-password/"));
    return Boolean(latest);
  }).toBe(true);
  // Django file backend can encode long lines using quoted-printable.
  const decoded = latest.replace(/=\r?\n/g, "").replace(/=([A-F0-9]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  const resetUrl = decoded.match(/http:\/\/127\.0\.0\.1:5173\/reset-password\/[^\s]+/)[0];
  await page.goto(resetUrl);
  await page.getByLabel("Nova senha", { exact: true }).fill("Senha-nova-ficticia-632!");
  await page.getByLabel("Confirme a nova senha").fill("Diferente-123!");
  await page.getByRole("button", { name: "Salvar nova senha" }).click();
  await expect(page.getByText("As senhas não coincidem.")).toBeVisible();
  await page.getByLabel("Confirme a nova senha").fill("Senha-nova-ficticia-632!");
  await page.getByRole("button", { name: "Salvar nova senha" }).click();
  await expect(page.getByText("Senha atualizada com sucesso.")).toBeVisible();
  await page.goto(resetUrl);
  await page.getByLabel("Nova senha", { exact: true }).fill("Outra-senha-ficticia-532!");
  await page.getByLabel("Confirme a nova senha").fill("Outra-senha-ficticia-532!");
  await page.getByRole("button", { name: "Salvar nova senha" }).click();
  await expect(page.getByText("Link inválido ou expirado.")).toBeVisible();
  await login(page, "recuperacao", "Senha-nova-ficticia-632!");
});

for (const width of [320, 390, 768, 1366, 1920, 2560]) {
  test(`student dashboard responds at ${width}px with keyboard menu and accessible themes`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await login(page);
    await expect(page.getByRole("heading", { name: /Olá, Rodrigo/ })).toBeVisible();
    await noOverflow(page);
    await axe(page);
    if (width <= 900) {
      await page.getByRole("button", { name: "Abrir menu de navegação" }).click();
      await expect(page.getByRole("button", { name: "Fechar menu de navegação" })).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("button", { name: "Abrir menu de navegação" })).toBeFocused();
    }
    await page.getByRole("button", { name: "Ativar tema escuro" }).click();
    await axe(page);
    await page.screenshot({ path: testInfo.outputPath(`dashboard-${width}.png`), fullPage: true });
  });
}

test("student pages expose accessible labels and do not overflow a small phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await login(page);
  for (const path of ["/profile", "/subjects", "/grades", "/calendar", "/files", "/financial", "/contact", "/notifications"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/Carregando/)).toHaveCount(0);
    await noOverflow(page);
    await axe(page);
  }
});

test("network errors show actionable feedback instead of a successful empty list", async ({ page }) => {
  await login(page);
  await page.route("**/api/academic/subjects/**", (route) => route.abort("failed"));
  await page.goto("/subjects");
  await expect(page.getByText("Não foi possível carregar as disciplinas.")).toBeVisible();
});

for (const [role, username, password, paths] of [
  ["teacher", "leandro", "prof123", ["/teacher/classes", "/teacher/students", "/teacher/grades", "/teacher/attendance", "/teacher/assessments", "/files"]],
  ["admin", "admin", "admin123", ["/admin-panel", "/admin/management?section=users", "/admin/management?section=students", "/admin/management?section=invoices", "/admin/management?section=schedule", "/contact"]],
]) {
  for (const width of [320, 390, 768, 1366, 1920, 2560]) {
    test(`${role} forms and tables remain usable at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await login(page, username, password);
      for (const path of paths) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.getByText(/Carregando/)).toHaveCount(0);
        await noOverflow(page);
        if ([320, 1366].includes(width)) await axe(page);
      }
      await page.getByRole("button", { name: "Ativar tema escuro" }).click();
      await noOverflow(page);
      await axe(page);
      await page.screenshot({ path: testInfo.outputPath(`${role}-${width}.png`), fullPage: true });
    });
  }
}
