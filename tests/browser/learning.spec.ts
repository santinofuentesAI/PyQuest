import { test, expect } from '@playwright/test';
import curriculum from '../../src/content/curriculum.json';
import type { Curriculum, Exercise } from '../../src/lib/types';

for (const [name, width, height] of [['mobile', 390, 844], ['tablet', 1280, 800], ['desktop', 1440, 900]] as const) {
  test(`library editor and pieces on ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/library/u1');
    const area = page.getByRole('textbox', { name: 'Código Python' });
    await area.fill('pri');
    await page.getByRole('button', { name: 'print', exact: true }).click();
    await expect(area).toHaveValue('print');
    await page.getByRole('button', { name: 'Insertar (' }).click();
    await page.getByRole('button', { name: 'Insertar "' }).click();
    await page.keyboard.type('Hola');
    await expect(area).toHaveValue('print("Hola")');
    await page.getByRole('button', { name: 'Resolver ejercicios' }).click();
    await page.getByRole('combobox', { name: 'Elige un reto' }).selectOption('u1-l1-touch');
    for (const word of ['print', '(', '"Hola"', ')']) await page.getByRole('button', { name: word, exact: true }).click();
    await page.getByRole('button', { name: 'Comprobar', exact: true }).click();
    await expect(page.getByText('¡Lo resolviste!')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/library-${name}.png`, fullPage: true });
  });
}

test('every reference program passes in the actual Pyodide Worker', async ({ page }) => {
  await page.goto('/library');
  const exercises = (curriculum as unknown as Curriculum).sections.flatMap((s) => s.units.flatMap((u) => u.lessons.flatMap((l) => l.exercises)));
  const isolationChecks: Exercise[] = [
    { id: 'runtime-private-run', type: 'code', prompt: '', explanation: '', difficulty: 1, xp: 0, solution: "__learner_secret = 42\nprint = lambda *args: None" },
    { id: 'runtime-fresh-run', type: 'code', prompt: '', explanation: '', difficulty: 1, xp: 0, solution: "print('__learner_secret' in globals())", expectedStdout: 'False' },
    { id: 'runtime-user-output', type: 'code', prompt: '', explanation: '', difficulty: 1, xp: 0, solution: "answer = 7\nprint(answer)", expectedStdout: '7', tests: [{ setup: "print('test setup is private')", assert: 'answer == 7' }] },
  ];
  const failureCheck: Exercise & { expectFailure: true } = { id: 'runtime-error-result', type: 'code', prompt: '', explanation: '', difficulty: 1, xp: 0, solution: 'import pyquest_nonexistent_library', expectFailure: true };
  const programs = [...exercises.filter((e) => ['code', 'data', 'predict_output'].includes(e.type)), ...isolationChecks, failureCheck];
  const failures = await page.evaluate(async (rows) => {
    const worker = new Worker('/pyodide-worker.js');
    try {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Pyodide initialization timeout')), 120_000);
        worker.onerror = (event) => { clearTimeout(timer); reject(new Error(event.message)); };
        worker.onmessage = (event) => {
          if (event.data.type === 'ready') { clearTimeout(timer); resolve(); }
          if (event.data.type === 'init_error') { clearTimeout(timer); reject(new Error(event.data.error)); }
        };
        worker.postMessage({ type: 'init' });
      });
      const failures: { id: string; error: string }[] = [];
      for (const row of rows) {
        const tests = (row.tests ?? []).map((t) => `${t.setup ?? ''}\nassert ${t.assert.replace(/^assert\s+/, '')}`).join('\n');
        const result = await new Promise<{ ok: boolean; error?: string; stdout: string; stderr?: string }>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error(`${row.id}: timeout`)), 90_000);
          worker.onmessage = (event) => {
            if (event.data.type === 'result' && event.data.id === row.id) { clearTimeout(timer); resolve(event.data); }
          };
          worker.postMessage({ type: 'run', id: row.id, code: row.type === 'predict_output' ? row.starterCode : row.solution, tests, files: row.files, packages: row.packages });
        });
        if ('expectFailure' in row && row.expectFailure) {
          if (result.ok !== false || !result.error || result.stdout) failures.push({ id: row.id, error: 'Failed programs must return an error and no stale output' });
          continue;
        }
        if (result.ok !== true || result.error) { failures.push({ id: row.id, error: result.error || result.stderr || 'Worker returned an unsuccessful result' }); continue; }
        const expected = row.type === 'predict_output' ? row.acceptedOutputs ?? [row.expectedStdout ?? ''] : row.expectedStdout == null ? null : [row.expectedStdout];
        if (!expected) continue;
        const got = result.stdout.trim();
        const matches = expected.some((value) => {
          const want = value.trim();
          if (got === want) return true;
          if (row.outputComparison !== 'numeric') return false;
          const a = got.split('\n'), b = want.split('\n');
          const numeric = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
          return a.length === b.length && a.every((x, i) => numeric.test(x) && numeric.test(b[i]) && Math.abs(Number(x) - Number(b[i])) <= 1e-9 * Math.max(1, Math.abs(Number(b[i]))));
        });
        if (!matches) failures.push({ id: row.id, error: `Output: ${JSON.stringify(got)}; expected: ${JSON.stringify(expected)}` });
      }
      return failures;
    } finally { worker.terminate(); }
  }, programs);
  expect(failures).toEqual([]);
});
