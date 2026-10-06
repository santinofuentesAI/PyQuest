export const PYODIDE_VERSION = "0.27.5";

export const PYODIDE_INDEX_URLS = [
  `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
  `https://fastly.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
  `https://cdn.jsdelivr.net/npm/pyodide@${PYODIDE_VERSION}/`,
];

const CORE_FILES = ["pyodide.js", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];
const DATA_ROOTS = ["numpy", "pandas", "matplotlib"];
const INDEX_KEY = "pyquest-pyodide-cdn";
const CACHE_NAME = `pyquest-pyodide-${PYODIDE_VERSION}`;

type LockPackage = {
  file_name?: string;
  depends?: string[];
};

type LockFile = {
  packages: Record<string, LockPackage>;
};

let chosenIndex: string | null = null;
let corePrefetch: Promise<string> | null = null;
let dataPrefetch: Promise<void> | null = null;

function rememberedIndex() {
  try {
    const stored = localStorage.getItem(INDEX_KEY);
    if (stored && PYODIDE_INDEX_URLS.includes(stored)) return stored;
  } catch {
    /* private mode */
  }
  return null;
}

function rememberIndex(url: string) {
  try {
    localStorage.setItem(INDEX_KEY, url);
  } catch {
    /* ignore */
  }
}

async function cacheStore() {
  if (typeof caches === "undefined") return null;
  try {
    return await caches.open(CACHE_NAME);
  } catch {
    return null;
  }
}

export async function cachedFetch(url: string) {
  const cache = await cacheStore();
  if (cache) {
    const hit = await cache.match(url);
    if (hit) return hit;
  }
  const res = await fetch(url, { mode: "cors", credentials: "omit" });
  if (res.ok && cache) {
    try {
      await cache.put(url, res.clone());
    } catch {
      /* quota */
    }
  }
  return res;
}

async function firstOk(urls: string[]) {
  return await Promise.any(
    urls.map(async (url) => {
      const res = await cachedFetch(`${url}pyodide-lock.json`);
      if (!res.ok) throw new Error(`${url} ${res.status}`);
      return url;
    }),
  ).catch(() => PYODIDE_INDEX_URLS[0]);
}

function collectWheels(lock: LockFile, roots: string[]) {
  const files = new Set<string>();
  const seen = new Set<string>();
  const walk = (name: string) => {
    const key = Object.keys(lock.packages).find((k) => k.toLowerCase() === name.toLowerCase());
    if (!key || seen.has(key)) return;
    seen.add(key);
    const pkg = lock.packages[key];
    if (pkg.file_name) files.add(pkg.file_name);
    for (const dep of pkg.depends ?? []) walk(dep);
  };
  roots.forEach(walk);
  return [...files];
}

async function fetchPool(urls: string[], limit = 10) {
  let i = 0;
  async function worker() {
    while (i < urls.length) {
      const url = urls[i++];
      try {
        await cachedFetch(url);
      } catch {
        /* worker will retry */
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, urls.length) }, () => worker()));
}

export async function pickPyodideIndex(): Promise<string> {
  if (chosenIndex) return chosenIndex;
  if (!corePrefetch) {
    corePrefetch = (async () => {
      const known = rememberedIndex();
      const index = known ?? (await firstOk(PYODIDE_INDEX_URLS));
      chosenIndex = index;
      rememberIndex(index);
      await fetchPool(
        CORE_FILES.map((file) => `${index}${file}`),
        4,
      );
      return index;
    })();
  }
  return corePrefetch;
}

export function prefetchDataStack(indexURL: string, roots: string[] = DATA_ROOTS) {
  const key = roots.slice().sort().join(",");
  if (dataPrefetch && key === DATA_ROOTS.join(",")) return dataPrefetch;
  const job = (async () => {
    try {
      const res = await cachedFetch(`${indexURL}pyodide-lock.json`);
      if (!res.ok) return;
      const lock = (await res.json()) as LockFile;
      const wheels = collectWheels(lock, roots);
      await fetchPool(wheels.map((file) => `${indexURL}${file}`));
    } catch {
      /* run-time loadPackage still works */
    }
  })();
  if (roots.length >= 3) dataPrefetch = job;
  return job;
}

export function registerPyodideServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 400));
  idle(() => {
    void navigator.serviceWorker.register("/pyodide-sw.js", { scope: "/" }).catch(() => {});
  });
}
