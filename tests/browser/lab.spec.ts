import { test, expect } from "@playwright/test";

test("nav shows the lab instead of the league", async ({ page }) => {
  await page.goto("/learn");
  await expect(page.getByRole("link", { name: "Laboratorio" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Liga" })).toHaveCount(0);
});

test("lab runs NumPy, Pandas and Matplotlib", async ({ page }) => {
  await page.goto("/playground");
  await expect(page.getByRole("heading", { name: "Laboratorio" })).toBeVisible();
  await page.getByRole("link", { name: "Construir", exact: true }).click();
  await expect(page.getByRole("navigation", { name: "Navegación principal" })).toHaveCount(0);
  await page.getByRole("button", { name: "Ejecutar" }).click();
  const output = page.locator("pre").filter({ hasText: "Hola desde Pyodide" });
  await expect(output).toBeVisible({ timeout: 180_000 });
  await expect(page.locator("img[alt='plot']")).toBeVisible({ timeout: 30_000 });
  const src = await page.locator("img[alt='plot']").getAttribute("src");
  expect(src?.startsWith("data:image/png;base64,")).toBe(true);
  expect((src ?? "").length).toBeGreaterThan(200);
  await expect(page.locator("pre").filter({ hasText: "Error" })).toHaveCount(0);
});
