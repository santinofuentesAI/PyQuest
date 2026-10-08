import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import type { Exercise, Lesson } from '../src/lib/types';

async function main() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost', pretendToBeVisual: true });
  for (const key of ['window', 'self', 'document', 'HTMLElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'Element', 'Node', 'MutationObserver', 'getComputedStyle', 'localStorage']) {
    Object.defineProperty(globalThis, key, { configurable: true, value: (dom.window as unknown as Record<string, unknown>)[key] });
  }
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
  globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
  globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
  const React = await import('react');
  const { render, screen, cleanup, waitFor } = await import('@testing-library/react');
  const { default: userEvent } = await import('@testing-library/user-event');
  const { CodeEditor } = await import('../src/components/code-editor');
  const { ExerciseView } = await import('../src/components/exercise-view');
  const { LessonPlayer } = await import('../src/components/lesson-player');
  const { LibraryWorkshop } = await import('../src/components/library-workshop');
  const { useProgress } = await import('../src/lib/progress-store');
  const { getUnit } = await import('../src/lib/curriculum');
  const { AppRouterContext } = await import('next/dist/shared/lib/app-router-context.shared-runtime');
  const { checkExercise } = await import('../src/lib/validators');
  const { shuffleLearnLesson } = await import('../src/lib/practice');
  const user = userEvent.setup({ document: dom.window.document });
  const base = { id: 'test', difficulty: 1, xp: 10, prompt: 'Prueba', explanation: 'Razona el resultado.', solution: 'ok' } as const;

  function EditorHarness() {
    const [value, setValue] = React.useState('');
    return <CodeEditor value={value} onChange={setValue} />;
  }
  render(<EditorHarness />);
  const code = screen.getByRole('textbox', { name: 'Código Python' });
  await user.type(code, 'pri');
  await user.click(screen.getByRole('button', { name: 'print' }));
  await waitFor(() => assert.equal((code as HTMLTextAreaElement).value, 'print'));
  await user.click(screen.getByRole('button', { name: 'Insertar (' }));
  await waitFor(() => assert.equal((code as HTMLTextAreaElement).value, 'print()'));
  await user.click(screen.getByRole('button', { name: 'Insertar "' }));
  await waitFor(() => assert.equal((code as HTMLTextAreaElement).value, 'print("")'));
  await user.keyboard('Hola');
  assert.equal((code as HTMLTextAreaElement).value, 'print("Hola")');
  await user.clear(code);
  await user.type(code, 'pri');
  await user.keyboard('{Tab}');
  await waitFor(() => assert.equal((code as HTMLTextAreaElement).value, 'print'));
  await user.clear(code);
  await user.type(code, 'if True:');
  await user.keyboard('{Enter}');
  assert.equal((code as HTMLTextAreaElement).value, 'if True:\n    ');
  cleanup();

  let submitted: unknown;
  const blanks: Exercise = { ...base, type: 'fill_blank', template: '___(___)', blanks: [{ accepted: ['print'] }, { accepted: ['"Hola"'] }], wordBank: ['len'] };
  render(<ExerciseView exercise={blanks} onSubmit={(answer) => { submitted = answer; }} />);
  await user.click(screen.getByRole('button', { name: 'print' }));
  await user.click(screen.getByRole('button', { name: '"Hola"' }));
  await user.click(screen.getByRole('button', { name: 'Comprobar' }));
  assert.deepEqual(submitted, { type: 'blanks', values: ['print', '"Hola"'] });
  cleanup();

  const prediction: Exercise = { ...base, type: 'predict_output', starterCode: "print('uno')\nprint('tres')", acceptedOutputs: ['uno\ntres'] };
  render(<ExerciseView exercise={prediction} onSubmit={(answer) => { submitted = answer; }} />);
  await user.type(screen.getByRole('textbox', { name: 'Salida del programa' }), 'uno{Enter}tres');
  await user.click(screen.getByRole('button', { name: 'Comprobar' }));
  assert.deepEqual(submitted, { type: 'text', value: 'uno\ntres' });
  assert.equal((await checkExercise(prediction, submitted as Parameters<typeof checkExercise>[1])).correct, true);
  cleanup();

  const tokens: Exercise = { ...base, type: 'token_order', solution: 'print()', blocks: [{ id: 'a', code: 'print' }, { id: 'b', code: '(' }, { id: 'c', code: ')' }], correctOrder: ['a', 'b', 'c'] };
  render(<ExerciseView exercise={tokens} onSubmit={(answer) => { submitted = answer; }} />);
  await user.click(screen.getByRole('button', { name: ')' }));
  await user.click(screen.getByRole('button', { name: 'print' }));
  await user.click(screen.getByRole('button', { name: '(' }));
  await user.click(screen.getByRole('button', { name: 'Mover pieza 1 después' }));
  await user.click(screen.getByRole('button', { name: 'Mover pieza 2 después' }));
  await user.click(screen.getByRole('button', { name: 'Comprobar' }));
  assert.deepEqual(submitted, { type: 'order', ids: ['a', 'b', 'c'] });
  assert.equal((await checkExercise(tokens, submitted as Parameters<typeof checkExercise>[1])).correct, true);
  const repeated: Exercise = { ...tokens, solution: 'a[a]', blocks: [{ id: 'a1', code: 'a' }, { id: 'open', code: '[' }, { id: 'a2', code: 'a' }, { id: 'close', code: ']' }], correctOrder: ['a1', 'open', 'a2', 'close'] };
  assert.equal((await checkExercise(repeated, { type: 'order', ids: ['a2', 'open', 'a1', 'close'] })).correct, true, 'Identical pieces must be interchangeable');
  assert.equal((await checkExercise(repeated, { type: 'order', ids: ['a1', 'open', 'a1', 'close'] })).correct, false, 'The same piece cannot be used twice');
  await user.click(screen.getByRole('button', { name: 'Quitar pieza 2' }));
  assert.equal((screen.getByRole('button', { name: 'Comprobar' }) as HTMLButtonElement).disabled, true);
  cleanup();

  const unit = getUnit('u2')!;
  const trace = unit.lessons[1].exercises.find((e) => e.type === 'trace')!;
  render(<ExerciseView exercise={trace} onSubmit={(answer) => { submitted = answer; }} />);
  for (let i = 0; i < trace.traceSteps!.length; i++) {
    const step = trace.traceSteps![i];
    const text = step.choices.find((c) => c.id === step.correctChoiceId)!.text;
    await user.click(screen.getByRole('button', { name: text }));
    if (i < trace.traceSteps!.length - 1) await user.click(screen.getByRole('button', { name: 'Paso siguiente' }));
  }
  await user.click(screen.getByRole('button', { name: 'Comprobar el recorrido' }));
  assert.equal((await checkExercise(trace, submitted as Parameters<typeof checkExercise>[1])).correct, true);
  cleanup();

  // Errors can be corrected even after spending the last heart. Retries cannot
  // spend additional hearts or advance to an unsolved exercise.
  useProgress.setState({ hearts: 1, soundEnabled: false });
  const choice: Exercise = { ...base, type: 'multiple_choice', choices: [{ id: 'yes', text: 'Correcta' }, { id: 'no', text: 'Incorrecta' }], correctChoiceId: 'yes' };
  const lesson: Lesson = { id: 'u2-l1', title: 'Test', description: '', xp: 20, exercises: [choice, { ...choice, id: 'second', prompt: 'Segunda pregunta' }] };
  const router = { bfcacheId: 'test', back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch: async () => {}, hmrRefresh() {} };
  render(<AppRouterContext.Provider value={router}><LessonPlayer lesson={lesson} /></AppRouterContext.Provider>);
  await user.click(screen.getByRole('button', { name: 'Continuar' }));
  await user.click(screen.getByRole('button', { name: 'Continuar' }));
  await user.click(screen.getByRole('button', { name: 'Ver resultado' }));
  await user.click(screen.getByRole('button', { name: 'Continuar' }));
  await user.click(screen.getByRole('button', { name: 'Empezar clase' }));
  await user.click(screen.getByRole('radio', { name: 'Incorrecta' }));
  await user.click(screen.getByRole('button', { name: 'Comprobar' }));
  await screen.findByRole('button', { name: 'Corregir y reintentar' });
  assert.equal(useProgress.getState().hearts, 0);
  assert.equal((screen.getByRole('button', { name: 'Corregir y reintentar' }) as HTMLButtonElement).disabled, false);
  await user.click(screen.getByRole('button', { name: 'Corregir y reintentar' }));
  await user.click(screen.getByRole('button', { name: 'Comprobar' }));
  await screen.findByRole('button', { name: 'Corregir y reintentar' });
  assert.equal(useProgress.getState().hearts, 0);
  await user.click(screen.getByRole('button', { name: 'Corregir y reintentar' }));
  await user.click(screen.getByRole('radio', { name: 'Correcta' }));
  await user.click(screen.getByRole('button', { name: 'Comprobar' }));
  await user.click(await screen.findByRole('button', { name: 'Continuar' }));
  assert(screen.getByText('Segunda pregunta'));
  assert(screen.getByText('Te quedaste sin corazones'));
  cleanup();

  // Free library practice exposes every level without writing lesson progress.
  const before = Object.keys(useProgress.getState().completedLessons).length;
  render(<LibraryWorkshop unit={unit} />);
  await user.click(screen.getByRole('button', { name: 'Resolver ejercicios' }));
  const select = screen.getByRole('combobox', { name: 'Elige un reto' });
  assert.equal((select as HTMLSelectElement).options.length, unit.lessons.flatMap((l) => l.exercises).length);
  await user.selectOptions(select, unit.lessons[3].exercises[0].id);
  assert.equal(Object.keys(useProgress.getState().completedLessons).length, before);
  cleanup();

  const shuffled = shuffleLearnLesson(lesson);
  assert.deepEqual(shuffled.exercises.map((e) => e.id), lesson.exercises.map((e) => e.id));
  console.log('Interaction checks passed: editor, word bank, multiline output, movable pieces, trace, retry/heart flow, library and teaching order.');
  dom.window.close();
}
main().catch((err) => { console.error(err); process.exitCode = 1; });
