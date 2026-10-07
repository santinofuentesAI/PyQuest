import { test, expect } from "@playwright/test";

for (const width of [320, 390, 768, 1440]) {
  test(`lab puts writing first and preserves its draft across tabs at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/playground");
    const editor = page.getByRole("textbox", { name: "Código Python" });
    await expect(editor).toBeVisible();
    await expect(page.locator("details")).not.toHaveAttribute("open");
    const box = await editor.boundingBox();
    expect(box!.y).toBeLessThan(230);
    expect(box!.y + box!.height).toBeLessThan(760);
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

test("a shorter mobile viewport keeps the symbol row above navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 500 });
  await page.goto("/playground");
  await expect(page.getByRole("textbox", { name: "Código Python" })).toBeVisible();
  const symbol = await page.getByRole("button", { name: "Insertar (", exact: true }).boundingBox();
  const nav = await page.getByRole("navigation", { name: "Navegación principal" }).boundingBox();
  expect(symbol!.y + symbol!.height).toBeLessThan(nav!.y);
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
