/* PyQuest Python runtime — Pyodide in a Web Worker */
const PYODIDE_VERSION = "0.27.5";
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodide = null;
let loading = null;
const installed = new Set();
const mountedFiles = new Set();

function post(msg) {
  self.postMessage(msg);
}

async function ensurePyodide() {
  if (pyodide) return pyodide;
  if (loading) return loading;
  loading = (async () => {
    importScripts(`${INDEX_URL}pyodide.js`);
    pyodide = await loadPyodide({ indexURL: INDEX_URL });
    await pyodide.loadPackage(["numpy", "pandas", "matplotlib", "micropip"]);
    await pyodide.runPythonAsync(`
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import sys, io, traceback, base64, json
`);
    return pyodide;
  })();
  try {
    return await loading;
  } catch (err) {
    loading = null;
    throw err;
  }
}

async function maybeInstall(packages) {
  if (!packages || !packages.length) return;
  const missing = packages.filter((p) => !installed.has(p));
  if (!missing.length) return;
  const micropip = pyodide.pyimport("micropip");
  await micropip.install(missing);
  missing.forEach((p) => installed.add(p));
}

const CAPTURE_PLOTS = `
def __pyquest_capture_plots():
    import matplotlib.pyplot as plt
    import io, base64
    images = []
    for num in list(plt.get_fignums()):
        fig = plt.figure(num)
        buf = io.BytesIO()
        fig.savefig(buf, format="png", bbox_inches="tight", dpi=120)
        buf.seek(0)
        images.append(base64.b64encode(buf.read()).decode("ascii"))
    plt.close("all")
    return images
`;

self.onmessage = async (event) => {
  const msg = event.data || {};
  if (msg.type === "init") {
    try {
      await ensurePyodide();
      post({ type: "ready" });
    } catch (err) {
      post({ type: "init_error", error: String(err) });
    }
    return;
  }

  if (msg.type === "run") {
    const started = Date.now();
    try {
      const runtime = await ensurePyodide();
      await maybeInstall(msg.packages);

      for (const path of mountedFiles) {
        try { runtime.FS.unlink(path); } catch { /* Already removed by the program. */ }
      }
      mountedFiles.clear();
      await runtime.runPythonAsync("plt.close('all')");

      if (msg.files && typeof msg.files === "object") {
        for (const [path, content] of Object.entries(msg.files)) {
          const clean = path.startsWith("/") ? path : `/home/pyodide/${path}`;
          const parts = clean.split("/");
          parts.pop();
          const dir = parts.join("/") || "/home/pyodide";
          runtime.FS.mkdirTree(dir);
          runtime.FS.writeFile(clean, content);
          mountedFiles.add(clean);
        }
      }

      let stdout = "";
      let stderr = "";
      runtime.setStdout({ batched: (s) => { stdout += (stdout ? "\n" : "") + s; } });
      runtime.setStderr({ batched: (s) => { stderr += (stderr ? "\n" : "") + s; } });

      const userCode = String(msg.code ?? "");
      const tests = String(msg.tests ?? "");
      const capturePlots = Boolean(msg.capturePlots);

      await runtime.runPythonAsync(CAPTURE_PLOTS);
      runtime.globals.set("USER_CODE", userCode);
      runtime.globals.set("TEST_CODE", tests);

      let error = null;
      post({ type: "run_started", id: msg.id });
      try {
        await runtime.runPythonAsync(`
ns = {"__name__": "__main__"}
exec(compile(USER_CODE, "<user>", "exec"), ns)
if str(TEST_CODE).strip():
    exec(compile(TEST_CODE, "<tests>", "exec"), ns)
`);
      } catch (err) {
        error = String(err);
      }

      let images = [];
      if (capturePlots) {
        try {
          const captured = runtime.runPython("__pyquest_capture_plots()");
          images = captured.toJs({ dict_converter: Object.fromEntries });
          if (captured && captured.destroy) captured.destroy();
        } catch {
          images = [];
        }
      }

      post({
        type: "result",
        id: msg.id,
        ok: !error,
        stdout,
        stderr,
        error,
        images,
        elapsedMs: Date.now() - started,
      });
    } catch (err) {
      post({
        type: "result",
        id: msg.id,
        ok: false,
        stdout: "",
        stderr: "",
        error: String(err),
        images: [],
        elapsedMs: Date.now() - started,
      });
    }
  }
};
