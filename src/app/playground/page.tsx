"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { PythonStatus } from "@/components/python-status";
import { runPython, preloadPython } from "@/lib/python-runtime";

const SAMPLE = `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

print("Hola desde Pyodide")
print("numpy", np.__version__)

s = pd.Series([10, 12, 9, 15], name="temp")
print(s.mean())

fig, ax = plt.subplots()
ax.plot(s.values, marker="o")
ax.set_title("Temperaturas de juguete")
ax.set_ylabel("ºC")
`;

export default function PlaygroundPage() {
  const [code, setCode] = useState(SAMPLE);
  const [out, setOut] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    preloadPython();
  }, []);

  async function run() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await runPython({ code, capturePlots: true, timeoutMs: 12000 });
      setOut(res.stdout);
      setErr(res.error);
      setImages(res.images);
    } catch {
      setErr("Python no pudo cargar. Revisa la conexión y vuelve a ejecutar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
      <h1 className="font-heading text-3xl font-extrabold">Laboratorio</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ejecuta Python real aquí. Primera carga: descarga Pyodide y los paquetes (puede tardar ~20 s).{" "}
        <Link href="/library" className="font-semibold text-primary">
          Volver a la librería
        </Link>
      </p>
      <PythonStatus className="mt-2" />
      <div className="mt-4">
        <CodeEditor value={code} onChange={setCode} height={320} />
      </div>
      <Button className="mt-3 h-11 rounded-xl font-bold" onClick={run} disabled={busy}>
        {busy ? "Ejecutando…" : "Ejecutar"}
      </Button>
      {out && (
        <pre className="mt-4 overflow-x-auto rounded-xl bg-zinc-950 p-3 text-sm text-zinc-100">{out}</pre>
      )}
      {err && (
        <pre className="mt-3 overflow-x-auto rounded-xl bg-rose-950 p-3 text-sm text-rose-100">{err}</pre>
      )}
      {images.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} alt="plot" src={`data:image/png;base64,${img}`} className="mt-3 rounded-xl border" />
      ))}
    </div>
  );
}
