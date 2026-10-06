"use client";

import type { PythonRunResult } from "./types";
import { pickPyodideIndex, prefetchDataStack } from "./pyodide-cdn";

const TIMEOUT_MS = 8000;

type Pending = {
  resolve: (value: PythonRunResult) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
  timeoutMs: number;
  onTimeout: () => void;
};

let worker: Worker | null = null;
let ready = false;
const readyWaiters: Array<() => void> = [];
let initError: string | null = null;
const pending = new Map<string, Pending>();
let requestId = 0;
let runQueue: Promise<unknown> = Promise.resolve();
const statusListeners = new Set<(s: RuntimeStatus) => void>();

export type RuntimeStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ready" }
  | { state: "error"; message: string };

let status: RuntimeStatus = { state: "idle" };

function setStatus(next: RuntimeStatus) {
  status = next;
  statusListeners.forEach((fn) => fn(next));
}

export function getRuntimeStatus() {
  return status;
}

export function subscribeRuntimeStatus(fn: (s: RuntimeStatus) => void) {
  statusListeners.add(fn);
  fn(status);
  return () => {
    statusListeners.delete(fn);
  };
}

function recreateWorker() {
  for (const p of pending.values()) {
    clearTimeout(p.timer);
    p.reject(new Error("Python se reinició. Vuelve a ejecutar tu código."));
  }
  pending.clear();
  if (worker) {
    worker.terminate();
    worker = null;
  }
  ready = false;
  initError = null;
  worker = new Worker("/pyodide-worker.js");
  worker.onmessage = (event: MessageEvent) => {
    const msg = event.data;
    if (msg.type === "ready") {
      ready = true;
      setStatus({ state: "ready" });
      readyWaiters.splice(0).forEach((fn) => fn());
      return;
    }
    if (msg.type === "init_error") {
      initError = msg.error;
      setStatus({ state: "error", message: msg.error });
      readyWaiters.splice(0).forEach((fn) => fn());
      return;
    }
    if (msg.type === "result") {
      const p = pending.get(msg.id);
      if (!p) return;
      clearTimeout(p.timer);
      pending.delete(msg.id);
      p.resolve({
        ok: msg.ok,
        stdout: msg.stdout ?? "",
        stderr: msg.stderr ?? "",
        error: msg.error ?? null,
        images: Array.isArray(msg.images) ? msg.images : [],
      });
    }
    if (msg.type === "run_started") {
      const p = pending.get(msg.id);
      if (p) {
        clearTimeout(p.timer);
        p.timer = setTimeout(p.onTimeout, p.timeoutMs);
      }
    }
  };
  worker.onerror = (err) => {
    ready = false;
    initError = err.message || "Python perdió la conexión.";
    setStatus({ state: "error", message: initError });
    readyWaiters.splice(0).forEach((fn) => fn());
    for (const p of pending.values()) {
      clearTimeout(p.timer);
      p.reject(new Error(initError));
    }
    pending.clear();
  };
  setStatus({ state: "loading" });
  worker.postMessage({ type: "init" });
}

export function preloadPython(opts?: { dataStack?: boolean; packages?: string[] }) {
  if (typeof window === "undefined") return;
  if (!worker || initError) recreateWorker();
  const roots = [
    ...(opts?.dataStack ? ["numpy", "pandas", "matplotlib"] : []),
    ...(opts?.packages ?? []),
  ];
  if (roots.length) {
    void pickPyodideIndex().then((index) => prefetchDataStack(index, roots));
  }
}

function waitReady(): Promise<void> {
  if (ready) return Promise.resolve();
  if (initError) return Promise.reject(new Error(initError));
  if (!worker) recreateWorker();
  return new Promise((resolve, reject) => {
    const onReady = () => {
      clearTimeout(t);
      if (initError) reject(new Error(initError));
      else resolve();
    };
    const t = setTimeout(() => {
      const i = readyWaiters.indexOf(onReady);
      if (i >= 0) readyWaiters.splice(i, 1);
      initError = "Python tardó demasiado en cargar.";
      setStatus({ state: "error", message: initError });
      reject(new Error(initError));
    }, 120000);
    readyWaiters.push(onReady);
  });
}

type RunOptions = {
  code: string;
  tests?: string;
  files?: Record<string, string>;
  packages?: string[];
  capturePlots?: boolean;
  timeoutMs?: number;
};

/** One active run: Pyodide cannot safely execute two Python jobs concurrently. */
export function runPython(options: RunOptions): Promise<PythonRunResult> {
  const next = runQueue.then(() => performRun(options));
  runQueue = next.catch(() => undefined);
  return next;
}

async function performRun(options: RunOptions): Promise<PythonRunResult> {
  preloadPython();
  await waitReady();
  const id = `r${++requestId}`;
  const timeoutMs = options.timeoutMs ?? TIMEOUT_MS;

  return new Promise((resolve, reject) => {
    const onTimeout = () => {
      pending.delete(id);
      recreateWorker();
      resolve({
        ok: false,
        stdout: "",
        stderr: "",
        error: `Tiempo de ejecución agotado (${Math.round(timeoutMs / 1000)}s). Revisa bucles infinitos.`,
        images: [],
        timedOut: true,
      });
    };
    // Package downloads get a separate budget; execution starts after run_started.
    const timer = setTimeout(() => {
      pending.delete(id);
      recreateWorker();
      reject(new Error("La descarga de los paquetes tardó demasiado. Revisa la conexión."));
    }, 120000);

    pending.set(id, { resolve, reject, timer, timeoutMs, onTimeout });
    worker?.postMessage({
      type: "run",
      id,
      code: options.code,
      tests: options.tests ?? "",
      files: options.files,
      packages: options.packages,
      capturePlots: options.capturePlots ?? false,
    });
  });
}
