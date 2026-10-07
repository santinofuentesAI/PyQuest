import { test, expect } from "@playwright/test";

for (const width of [320, 390, 768, 1440]) {
  test(`lab puts writing first and preserves its draft across tabs at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/playground/editor");
    const editor = page.getByRole("textbox", { name: "Código Python" });
    await expect(editor).toBeVisible();
    await expect(page.locator("details")).not.toHaveAttribute("open");
    const box = await editor.boundingBox();
    expect(box!.y).toBeLessThan(160);
    await expect(page.getByRole("navigation", { name: "Navegación principal" })).toHaveCount(0);
    await expect(page.locator("header")).toHaveCount(0);
    expect(box!.y + box!.height).toBeLessThan(790);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await editor.fill("pri");
    await editor.press("Tab");
    await expect(editor).toHaveValue("print");
    await page.getByRole("button", { name: "Insertar (", exact: true }).click();
    await expect(editor).toHaveValue("print()");
    await page.getByRole("button", { name: 'Insertar "', exact: true }).click();
    await editor.pressSequentially("Hola");
    await expect(editor).toHaveValue('print("Hola")');
    await page.getByRole("tab", { name: "Consola", exact: true }).click();
    await expect(editor).toBeHidden();
    await expect(page.getByRole("tabpanel", { name: "Consola" })).toBeVisible();
    await page.getByRole("tab", { name: "Consola", exact: true }).press("ArrowLeft");
    await expect(page.getByRole("tab", { name: "script.py" })).toBeFocused();
    await expect(editor).toHaveValue('print("Hola")');
    await page.reload();
    await expect(editor).toHaveValue('print("Hola")');
    await page.getByRole("button", { name: "Hablar con Pybot" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Hablar con Pybot" })).toBeFocused();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    await page.screenshot({ path: `test-results/compact-lab-${width}.png`, animations: "disabled" });
  });
}

test("resume opens the next unfinished class without expanding the course map", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("pyquest-progress-v1", JSON.stringify({ version: 6, state: {
    completedLessons: { "u1-l1": { completedAt: Date.now(), perfect: true, correct: 9, total: 9 } },
    units: { u1: { completedLessonIds: ["u1-l1"], strength: 1, lastPracticedAt: Date.now() } },
  } })));
  await page.goto("/learn");
  await expect(page.getByRole("button", { name: /Explora tu ruta/ })).toHaveAttribute("aria-expanded", "false");
  const resume = page.getByRole("link", { name: "Retomar clase" });
  await expect(resume).toHaveAttribute("href", "/lesson/u1-l2");
  await resume.click();
  await expect(page.getByRole("button", { name: "Empezar clase", exact: true })).toBeVisible();
});

test("a shorter mobile viewport keeps the symbol row on screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 500 });
  await page.goto("/playground/editor");
  await expect(page.getByRole("textbox", { name: "Código Python" })).toBeVisible();
  const symbol = await page.getByRole("button", { name: "Insertar (", exact: true }).boundingBox();
  expect(symbol!.y + symbol!.height).toBeLessThan(500);
  await page.waitForTimeout(600);
  await page.screenshot({ path: "test-results/compact-lab-short.png", animations: "disabled" });
});

test("each main section remains readable and reachable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const sections = ["Aprender", "Práctica", "Proyectos", "Librería", "Laboratorio", "Perfil"];
  await page.goto("/learn");
  for (const name of sections) {
    await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name, exact: true }).click();
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name, exact: true })).toHaveAttribute("aria-current", "page");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/section-${name}.png`, animations: "disabled" });
  }
});

test("Construct opens a focused editor with one-tap copy and portfolio save", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/playground");
  await expect(page.getByRole("textbox", { name: "Código Python" })).toHaveCount(0);
  await page.getByRole("link", { name: "Construir", exact: true }).click();
  await expect(page).toHaveURL(/\/playground\/editor$/);
  await expect(page.getByRole("navigation", { name: "Navegación principal" })).toHaveCount(0);
  const code = 'print("Mi proyecto")';
  await page.getByRole("textbox", { name: "Código Python" }).fill(code);
  await page.getByRole("button", { name: "Copiar código", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(code);
  await page.getByRole("button", { name: "Guardar en portafolio", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const items = () => page.evaluate(() => JSON.parse(localStorage.getItem("pyquest-progress-v1")!).state.portfolio);
  expect((await items())[0].code).toBe(code);
  expect((await items())[0].title).toBe("Experimento Python 1");
  await page.getByRole("button", { name: "Guardar en portafolio", exact: true }).click();
  expect(await items()).toHaveLength(1);
  await page.getByRole("link", { name: "Salir del editor", exact: true }).click();
  await expect(page.getByRole("navigation", { name: "Navegación principal" })).toBeVisible();
  await page.getByRole("link", { name: "Ver mi portafolio", exact: true }).click();
  await expect(page.getByText("Experimento Python 1", { exact: true })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar Experimento Python 1 como Python" }).click();
  expect((await download).suggestedFilename()).toBe("Experimento_Python_1.py");
});

test("AI connection in settings is visibly pending and cannot be activated", async ({ page }) => {
  await page.goto("/profile");
  const connect = page.getByRole("button", { name: "Conectar una IA", exact: true });
  await connect.scrollIntoViewIfNeeded();
  await expect(connect).toBeDisabled();
  await expect(page.getByText("Próximamente", { exact: true })).toBeVisible();
  await expect(page.getByText("Aquí podrás conectar una IA para ayudarte con tu código. Esta opción todavía no está disponible.", { exact: true })).toBeVisible();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "test-results/settings-ai-placeholder.png", animations: "disabled" });
});
