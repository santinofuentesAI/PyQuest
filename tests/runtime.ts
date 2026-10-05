import assert from 'node:assert/strict';
import { runPython } from '../src/lib/python-runtime';

type Message = { type: string; id?: string; code?: string };
let active = 0, maxActive = 0;
class FakeWorker {
  alive = true;
  running = false;
  onmessage: ((event: { data: Record<string, unknown> }) => void) | null = null;
  onerror: ((event: { message: string }) => void) | null = null;
  postMessage(msg: Message) {
    if (msg.type === 'init') { setTimeout(() => this.onmessage?.({ data: { type: 'ready' } }), 0); return; }
    active++; this.running = true; maxActive = Math.max(active, maxActive);
    if (msg.code === 'crash') {
      setTimeout(() => this.onerror?.({ message: 'Connection interrupted' }), 0);
      return;
    }
    // Simulate package loading taking longer than the code timeout.
    setTimeout(() => {
      if (!this.alive) return;
      this.onmessage?.({ data: { type: 'run_started', id: msg.id } });
      if (msg.code === 'hang') return;
      setTimeout(() => {
        if (!this.alive) return;
        active--; this.running = false;
        this.onmessage?.({ data: { type: 'result', id: msg.id, ok: true, stdout: msg.code } });
      }, 5);
    }, 50);
  }
  terminate() { this.alive = false; if (this.running) { active--; this.running = false; } }
}
Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
Object.defineProperty(globalThis, 'Worker', { configurable: true, value: FakeWorker });

async function main() {
  const results = await Promise.all([runPython({ code: 'one', timeoutMs: 20 }), runPython({ code: 'two', timeoutMs: 20 })]);
  assert.equal(maxActive, 1, 'Pyodide jobs must be serialized');
  assert.equal(results[0].stdout, 'one');
  assert.equal(results[1].stdout, 'two');
  assert.equal(results[0].timedOut, undefined, 'Package loading must not use the execution budget');
  await assert.rejects(runPython({ code: 'crash' }), /Connection interrupted/);
  const recovered = await runPython({ code: 'recovered' });
  assert.equal(recovered.stdout, 'recovered', 'A failed worker must be recreated');
  const timeout = await runPython({ code: 'hang', timeoutMs: 10 });
  assert.equal(timeout.timedOut, true);
  const afterTimeout = await runPython({ code: 'after timeout' });
  assert.equal(afterTimeout.stdout, 'after timeout');
  console.log('Worker checks passed: concurrency, package loading, error recovery and timeout recovery.');
}
main().catch((err) => { console.error(err); process.exitCode = 1; });
