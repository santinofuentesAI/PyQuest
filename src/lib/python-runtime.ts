"use client";

import type { PythonRunResult } from "./types";

const TIMEOUT_MS = 8000;

type Pending = {
  resolve: (value: PythonRunResult) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

let worker: Worker | null = null;
let ready = false;
const readyWaiters: Array<() => void> = [];
let initError: string | null = null;
const pending = new Map<string, Pending>();
let requestId = 0;
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
  };
  worker.onerror = (err) => {
    setStatus({ state: "error", message: err.message || "Worker error" });
  };
  setStatus({ state: "loading" });
  worker.postMessage({ type: "init" });
}

export function preloadPython() {
  if (typeof window === "undefined") return;
  if (!worker) recreateWorker();
}

function waitReady(): Promise<void> {
  if (ready) return Promise.resolve();
  if (initError) return Promise.reject(new Error(initError));
  if (!worker) recreateWorker();
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("Python tardó demasiado en cargar.")), 120000);
    readyWaiters.push(() => {
      clearTimeout(t);
      if (initError) reject(new Error(initError));
      else resolve();
    });
  });
}

export async function runPython(options: {
  code: string;
  tests?: string;
  files?: Record<string, string>;
  packages?: string[];
  capturePlots?: boolean;
  timeoutMs?: number;
}): Promise<PythonRunResult> {
  preloadPython();
  await waitReady();
  const id = `r${++requestId}`;
  const timeoutMs = options.timeoutMs ?? TIMEOUT_MS;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
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
    }, timeoutMs);

    pending.set(id, { resolve, reject, timer });
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
