/* Pyodide worker: core first, data packages in parallel / on demand. */
const PYODIDE_VERSION = "0.27.5";
const INDEX_URLS = [
  `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
  `https://fastly.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
  `https://cdn.jsdelivr.net/npm/pyodide@${PYODIDE_VERSION}/`,
];

const KNOWN = new Set(["numpy", "pandas", "matplotlib", "micropip"]);

let pyodide = null;
let initPromise = null;
let packageChain = Promise.resolve();
let messageChain = Promise.resolve();
const loadedPackages = new Set();

function post(payload) {
  self.postMessage(payload);
}

function toJsValue(value) {
  if (value == null) return value;
  if (typeof value.toJs === "function") {
    const converted = value.toJs();
    if (typeof value.destroy === "function") value.destroy();
    return converted;
  }
  return value;
}

function detectNeededPackages(code) {
  const needed = new Set();
  if (!code) return needed;
  if (/import\s+numpy\b|from\s+numpy\b|import\s+np\b|\bas\s+np\b/.test(code)) {
    needed.add("numpy");
  }
  if (/import\s+pandas\b|from\s+pandas\b|\bas\s+pd\b/.test(code)) {
    needed.add("pandas");
  }
  if (/matplotlib|pyplot|\bas\s+plt\b|import\s+plt\b/.test(code)) {
    needed.add("matplotlib");
  }
  return needed;
}

function friendlyError(raw) {
  const text = String(raw ?? "");
  if (/ModuleNotFoundError[\s\S]*matplotlib|No module named 'matplotlib'/i.test(text)) {
    return "No se pudo instalar Matplotlib. Revisa la conexión e inténtalo de nuevo.";
  }
  if (/ModuleNotFoundError[\s\S]*numpy|No module named 'numpy'/i.test(text)) {
    return "No se pudo instalar NumPy. Revisa la conexión e inténtalo de nuevo.";
  }
  if (/ModuleNotFoundError[\s\S]*pandas|No module named 'pandas'/i.test(text)) {
    return "No se pudo instalar Pandas. Revisa la conexión e inténtalo de nuevo.";
  }
  if (/Failed to fetch|NetworkError|Load failed|CDN|pyodide\.js/i.test(text)) {
    return "No se pudo descargar Python. Revisa la conexión e inténtalo de nuevo.";
  }
  return text;
}

function rememberLoaded() {
  if (!pyodide?.loadedPackages) return;
  for (const name of Object.keys(pyodide.loadedPackages)) {
    loadedPackages.add(name);
  }
}

async function loadPyodideFrom(indexURL) {
  if (typeof self.loadPyodide !== "function") {
    importScripts(`${indexURL}pyodide.js`);
  }
  const runtime = await self.loadPyodide({
    indexURL,
    fullStdLib: false,
  });
  await runtime.runPythonAsync(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);
  return runtime;
}

async function init(preferred) {
  if (pyodide) return pyodide;
  if (initPromise) return initPromise;
  const urls = preferred
    ? [preferred, ...INDEX_URLS.filter((url) => url !== preferred)]
    : INDEX_URLS;
  initPromise = (async () => {
    let lastError = null;
    for (const indexURL of urls) {
      try {
        post({ type: "status", message: "Descargando el motor de Python…" });
        pyodide = await loadPyodideFrom(indexURL);
        return pyodide;
      } catch (error) {
        lastError = error;
        pyodide = null;
      }
    }
    throw lastError ?? new Error("No se pudo descargar Python.");
  })();
  try {
    return await initPromise;
  } catch (error) {
    initPromise = null;
    throw error;
  }
}

async function configureMatplotlib() {
  await pyodide.runPythonAsync(`
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
`);
}

function shortLoadMessage(raw) {
  const text = String(raw ?? "");
  if (/matplotlib/i.test(text)) return "Instalando Matplotlib…";
  if (/pandas/i.test(text)) return "Instalando Pandas…";
  if (/numpy/i.test(text)) return "Instalando NumPy…";
  if (/pillow|fonttools|contourpy/i.test(text)) return "Instalando dependencias de gráficos…";
  return "Instalando librerías de datos…";
}

async function loadPackagesNow(names) {
  const pending = [
    ...new Set(names.filter((name) => typeof name === "string" && KNOWN.has(name) && !loadedPackages.has(name))),
  ];
  if (pending.length === 0) return;
  post({
    type: "status",
    phase: "warming",
    message:
      pending.length > 1
        ? "Instalando NumPy, Pandas y Matplotlib a la vez…"
        : `Instalando ${pending[0] === "matplotlib" ? "Matplotlib" : pending[0] === "pandas" ? "Pandas" : "NumPy"}…`,
  });
  try {
    await pyodide.loadPackage(pending, {
      messageCallback: (msg) => post({ type: "status", phase: "warming", message: shortLoadMessage(msg) }),
    });
  } catch {
    for (const name of pending) {
      if (loadedPackages.has(name)) continue;
      await pyodide.loadPackage(name);
    }
  }
  rememberLoaded();
  if (pending.includes("matplotlib") || loadedPackages.has("matplotlib")) {
    await configureMatplotlib();
  }
  pending.forEach((name) => loadedPackages.add(name));
}

function ensurePackages(names) {
  const job = packageChain.then(() => loadPackagesNow(names));
  packageChain = job.catch(() => {});
  return job;
}

function warmup(names) {
  const list = Array.isArray(names) && names.length > 0 ? names : ["numpy", "pandas", "matplotlib"];
  return ensurePackages(list).then(() => {
    post({ type: "warm" });
  });
}

function writeFiles(files) {
  if (!files || typeof files !== "object") return;
  for (const [path, content] of Object.entries(files)) {
    if (typeof content !== "string") continue;
    const clean = path.startsWith("/") ? path.slice(1) : path;
    const parts = clean.split("/").filter(Boolean);
    if (parts.length > 1) {
      let dir = "";
      for (const part of parts.slice(0, -1)) {
        dir += `/${part}`;
        try {
          pyodide.FS.mkdir(dir);
        } catch {
          /* exists */
        }
      }
    }
    pyodide.FS.writeFile(clean, content);
  }
}

function readStd() {
  const stdout = String(toJsValue(pyodide.runPython("sys.stdout.getvalue()")) ?? "");
  const stderr = String(toJsValue(pyodide.runPython("sys.stderr.getvalue()")) ?? "");
  return { stdout, stderr };
}

function captureImages() {
  if (!loadedPackages.has("matplotlib")) return [];
  const raw = pyodide.runPython(`
import io, base64
import matplotlib.pyplot as plt
_images = []
for _num in list(plt.get_fignums()):
    _fig = plt.figure(_num)
    _buf = io.BytesIO()
    _fig.savefig(_buf, format="png", bbox_inches="tight")
    _buf.seek(0)
    _images.append(base64.b64encode(_buf.read()).decode("ascii"))
    plt.close(_fig)
_images
`);
  const images = toJsValue(raw);
  return Array.isArray(images) ? images : [];
}

function wantsPlots(code, capturePlots) {
  return Boolean(capturePlots) && /matplotlib|pyplot|\bas\s+plt\b/.test(code ?? "");
}

function indentBlock(src) {
  return String(src)
    .split("\n")
    .map((line) => (line.length ? `    ${line}` : line))
    .join("\n");
}

async function runBossTests(tests) {
  const src = String(tests ?? "").trim();
  if (!src) return null;
  await pyodide.runPythonAsync(`
__pq_test_error = None
try:
${indentBlock(src)}
except Exception as __pq_ex:
    __pq_test_error = f"{type(__pq_ex).__name__}: {__pq_ex}"
`);
  const err = toJsValue(pyodide.runPython("__pq_test_error"));
  if (err && String(err) !== "None") return String(err);
  return null;
}

async function run(code, tests, files, packages, capturePlots, onStarted) {
  await init();
  const needed = detectNeededPackages(`${code}\n${tests ?? ""}`);
  for (const name of packages ?? []) needed.add(name);
  if (wantsPlots(code, capturePlots)) needed.add("matplotlib");
  if (needed.size > 0) {
    await ensurePackages([...needed]);
  }
  if (typeof onStarted === "function") onStarted();

  writeFiles(files);

  pyodide.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);

  const plot = wantsPlots(code, capturePlots) && loadedPackages.has("matplotlib");
  if (plot) {
    await pyodide.runPythonAsync(`
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.close("all")
`);
  }

  let execError = null;
  try {
    await pyodide.runPythonAsync(code);
  } catch (error) {
    execError = friendlyError(error instanceof Error ? error.message : String(error));
  }
  const testError = execError ? null : await runBossTests(tests);

  const { stdout, stderr } = readStd();
  const images = plot ? captureImages() : [];
  return { stdout, stderr, images, testError: execError || testError };
}

async function handleMessage(event) {
  const { id, type, code, tests, files, packages, capturePlots, indexURL, warmup: shouldWarm } = event.data;
  try {
    if (type === "init") {
      await init(indexURL);
      post({ id, type: "ready" });
      if (shouldWarm) warmup(packages).catch(() => {});
      return;
    }
    if (type === "warmup") {
      await init(indexURL);
      warmup(packages).catch(() => {});
      return;
    }
    if (type === "run") {
      const result = await run(code, tests, files, packages, Boolean(capturePlots), () => {
        post({ type: "run_started", id });
      });
      const failed = Boolean(result.testError);
      post({
        id,
        type: "result",
        ok: !failed,
        stdout: result.stdout,
        stderr: result.stderr,
        error: result.testError,
        images: result.images,
      });
    }
  } catch (error) {
    const message = friendlyError(error instanceof Error ? error.message : String(error));
    if (type === "init") {
      post({ type: "init_error", error: message });
      return;
    }
    if (type === "warmup") {
      post({ type: "warm" });
      return;
    }
    let stdout = "";
    let stderr = "";
    try {
      if (pyodide) {
        const std = readStd();
        stdout = std.stdout;
        stderr = std.stderr;
      }
    } catch {
      /* ignore */
    }
    post({
      id,
      type: "result",
      ok: false,
      stdout,
      stderr,
      error: message,
      images: [],
    });
  }
}

self.onmessage = (event) => {
  messageChain = messageChain.then(() => handleMessage(event)).catch(() => {});
};
