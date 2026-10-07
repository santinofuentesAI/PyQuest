import { test, expect } from "@playwright/test";
import curriculum from "../../src/content/curriculum.json";
import type { Curriculum } from "../../src/lib/types";

async function capture(page: import("@playwright/test").Page, name: string) {
  // Let the short entrance transition finish before recording the resting UI.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: true, animations: "disabled" });
}

for (const width of [320, 390, 768, 1440]) {
  test(`Pybot route, help and course sections at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/learn");
    await expect(page.getByRole("heading", { name: "Aprender" })).toBeVisible();
    const cta = page.getByRole("link", { name: "Empezar clase" });
    await expect(cta).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const box = await cta.boundingBox();
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    const route = page.getByRole("button", { name: /Explora tu ruta/ });
    await expect(route).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("button", { name: "2. NumPy", exact: true })).toBeHidden();
    await expect(page.getByRole("region", { name: "Objetivo diario" })).toHaveCount(0);
    await expect(page.getByText(/días? de racha/, { exact: true })).toHaveCount(0);
    const firstTopic = await page.locator("ol li").first().boundingBox();
    expect(firstTopic!.y + firstTopic!.height).toBeLessThan(600);
    await route.click();
    await expect(route).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("button", { name: "2. NumPy", exact: true }).click();
    await expect(route).toHaveAttribute("aria-expanded", "false");
    await expect(route).toBeFocused();
    await expect(page.locator("#route-heading")).toHaveText("NumPy");
    await page.getByRole("button", { name: "Hablar con Pybot" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Hola, soy Pybot." })).toBeVisible();
    await page.getByRole("button", { name: "Otro consejo" }).click();
    await expect(page.getByRole("dialog").getByRole("status")).toContainText("Equivocarte");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await route.click();
    await page.getByRole("button", { name: "1. Fundamentos absolutos", exact: true }).click();
    await capture(page, `pybot-map-${width}`);
    expect(errors).toEqual([]);
  });
}

test("a class flows through intro, retry, checkpoint and real rewards", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem("pyquest-progress-v1", JSON.stringify({ version: 6, state: { soundEnabled: false, hearts: 5, heartsUpdatedAt: Date.now() } })));
  const lesson = (curriculum as unknown as Curriculum).sections[0].units[0].lessons[1];
  await page.goto("/lesson/" + lesson.id);
  await expect(page.getByRole("heading", { name: lesson.title })).toBeVisible();
  await capture(page, "pybot-class-intro");
  await page.getByRole("button", { name: "Empezar clase" }).click();
  for (const [i, exercise] of lesson.exercises.entries()) {
    if (exercise.type === "multiple_choice" || exercise.type === "find_error") {
      if (i === 0) {
        const wrong = exercise.choices!.find((c) => c.id !== exercise.correctChoiceId)!;
        await page.getByRole("radio", { name: wrong.text, exact: true }).click();
        await page.getByRole("button", { name: "Comprobar", exact: true }).click();
        await page.getByRole("button", { name: "Corregir y reintentar" }).click();
      }
      await page.getByRole("radio", { name: exercise.choices!.find((c) => c.id === exercise.correctChoiceId)!.text, exact: true }).click();
    } else if (exercise.type === "predict_output") {
      await page.getByRole("textbox", { name: "Salida del programa" }).fill(exercise.solution);
    } else if (exercise.type === "fill_blank") {
      for (const blank of exercise.blanks!) await page.getByRole("button", { name: blank.accepted[0], exact: true }).click();
    } else if (exercise.type === "trace") {
      for (const [index, step] of exercise.traceSteps!.entries()) {
        await page.getByRole("button", { name: step.choices.find((c) => c.id === step.correctChoiceId)!.text, exact: true }).click();
        if (index < exercise.traceSteps!.length - 1) await page.getByRole("button", { name: "Paso siguiente" }).click();
      }
    }
    await page.getByRole("button", { name: exercise.type === "trace" ? "Comprobar el recorrido" : "Comprobar", exact: true }).click();
    await expect(page.getByText("¡Correcto!", { exact: true })).toBeVisible();
    if (i === 1) await capture(page, "pybot-class-feedback");
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
  }
  await expect(page.getByRole("heading", { name: "¡Lección completada!" })).toBeVisible();
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem("pyquest-progress-v1")!).state);
  expect(state.completedLessons[lesson.id].perfect).toBe(false);
  expect(state.completedLessons[lesson.id].correct).toBe(lesson.exercises.length - 1);
  expect(state.hearts).toBe(4);
  await expect(page.getByText("+" + state.xp, { exact: true })).toBeVisible();
  await capture(page, "pybot-class-complete");
  await page.locator("a").filter({ hasText: "Siguiente lección" }).click();
  await expect(page.getByRole("button", { name: "Empezar clase" })).toBeVisible();
});

test("lab draft, portfolio and downloadable Python survive navigation", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/playground/editor");
  const area = page.getByRole("textbox", { name: "Código Python" });
  await area.fill("print('Mi experimento')");
  await page.reload();
  await expect(area).toHaveValue("print('Mi experimento')");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await capture(page, "pybot-lab-mobile");
  await page.getByText("Ejemplos y herramientas", { exact: true }).click();
  await page.getByRole("button", { name: "Guardar con nombre", exact: true }).click();
  await page.getByRole("textbox", { name: "Nombre", exact: true }).fill("Experimento de prueba");
  await page.getByRole("textbox", { name: "Qué descubriste" }).fill("Una idea que quiero conservar");
  await page.getByRole("button", { name: "Guardar proyecto" }).click();
  await page.goto("/profile");
  await expect(page.getByText("Experimento de prueba", { exact: true })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar Experimento de prueba como Python" }).click();
  expect((await download).suggestedFilename()).toBe("Experimento_de_prueba.py");
});

test("Pybot honors reduced motion and keeps dark themes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("pyquest-progress-v1", JSON.stringify({ version: 6, state: { palette: "night", theme: "dark" } })));
  await page.goto("/learn");
  await expect(page.getByRole("heading", { name: "Aprender" })).toBeVisible();
  expect(await page.locator(".pybot-float").first().evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  expect(await page.locator("html").getAttribute("data-palette")).toBe("night");
  expect(await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe("rgb(247, 248, 252)");
  await capture(page, "pybot-night");
});
