"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FlaskConical, Play, RotateCcw, Save, Terminal } from "lucide-react";
import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { PythonStatus } from "@/components/python-status";
import { Pybot, PybotCoach } from "@/components/pybot";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { runPython, preloadPython } from "@/lib/python-runtime";
import { humanPythonError } from "@/lib/job-projects";
import { useProgress } from "@/lib/progress-store";
import { toast } from "sonner";

const SAMPLE = `import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

print("Hola desde Pyodide")
print("numpy", np.__version__)

s = pd.Series([10, 12, 9, 15], name="temp")
print(s.mean())

fig, ax = plt.subplots()
ax.plot(s.values, marker="o", color="#6746d8")
ax.set_title("Temperaturas de juguete")
ax.set_ylabel("ºC")
`;

export default function PlaygroundPage() {
  const progress = useProgress();
  const code = progress.labDraft ?? SAMPLE;
  const [out, setOut] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [resultCode, setResultCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  useEffect(() => { preloadPython({ dataStack: true }); }, []);
  async function run() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    setImages([]);
    setOut("");
    setResultCode(null);
    try {
      const res = await runPython({ code, capturePlots: true, packages: ["numpy", "pandas", "matplotlib"], timeoutMs: 90000 });
      setOut(res.stdout);
      setErr(res.error ? humanPythonError(res.error) ?? res.error : null);
      setImages(res.images ?? []);
      if (res.ok) setResultCode(code);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Python no pudo cargar. Revisa la conexión y vuelve a ejecutar.");
    } finally { setBusy(false); }
  }
  function save() {
    const current = resultCode === code && !err;
    if (!progress.addLabPortfolio({ title, description, code, stdout: current ? out : undefined, image: current ? images[0] : undefined })) { toast.error("Ponle un nombre y escribe el código que quieres guardar."); return; }
    toast.success("Tu experimento ya está en el portafolio.");
    setSaveOpen(false); setTitle(""); setDescription("");
  }
  if (!progress.hydrated) return <p role="status" className="p-8 text-center text-sm text-muted-foreground">Preparando tu laboratorio…</p>;
  return <div className="mx-auto max-w-5xl px-4 pt-6 pb-28 sm:px-6">
    <section className="quest-hero flex items-center gap-4 rounded-3xl border p-5 sm:p-7">
      <div className="min-w-0 flex-1"><p className="quest-kicker">Imagina · Prueba · Descubre</p><h1 className="mt-2 text-3xl font-extrabold">Laboratorio</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Tu espacio para experimentar con Python, datos y gráficos. Cambia una idea y mira qué ocurre.</p><PythonStatus className="mt-3" /></div><Pybot mood={busy ? "thinking" : "happy"} size="md" />
    </section>
    <PybotCoach className="mt-5" mood="thinking">¿Y si cambias una temperatura? Predice cómo cambiarán la media y la línea, luego ejecuta para comprobarlo.</PybotCoach>
    <div className="mt-5 overflow-hidden rounded-3xl border bg-[#101725] text-zinc-100 shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><span className="flex items-center gap-2 text-xs font-bold"><Terminal className="size-4 text-emerald-300" />mi_experimento.py</span><span className="text-[10px] font-semibold text-emerald-300">Guardado en este navegador</span></div>
      <div className="p-3 sm:p-5"><CodeEditor value={code} onChange={progress.saveLabDraft} height={350} forceDark /></div>
    </div>
    <div className="mt-4 flex flex-wrap gap-3">
      <Button className="h-12 rounded-2xl px-6 font-bold" onClick={run} disabled={busy}><Play className="size-4 fill-current" />{busy ? "Ejecutando…" : "Ejecutar"}</Button>
      <Button variant="outline" className="h-12 rounded-2xl font-bold" onClick={() => setSaveOpen(true)} disabled={busy || !code.trim()}><Save className="size-4" />Guardar en portafolio</Button>
      <Button variant="ghost" className="h-12 rounded-2xl text-xs" onClick={() => { progress.saveLabDraft(SAMPLE); setOut(""); setImages([]); setErr(null); setResultCode(null); }} disabled={busy}><RotateCcw className="size-4" />Restaurar ejemplo</Button>
    </div>
    <section className="quest-card mt-6 rounded-3xl p-5" aria-label="Resultados del laboratorio">
      <p className="mb-3 flex items-center gap-2 text-sm font-extrabold"><FlaskConical className="size-4 text-primary" />Lo que descubriste</p>
      {!out && !err && !images.length ? <p role="status" className="rounded-2xl border border-dashed p-5 text-sm leading-relaxed text-muted-foreground">{busy ? "Pybot está preparando Python y ejecutando tu experimento…" : resultCode ? "Tu código terminó sin imprimir. Añade print() para observar un valor." : "Ejecuta tu código. Aquí aparecerán la salida y los gráficos."}</p> : null}
      {out ? <pre className="overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-sm text-emerald-200">{out}</pre> : null}
      {err ? <pre role="alert" className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-rose-950 p-4 text-sm text-rose-100">{err}</pre> : null}
      {resultCode && resultCode !== code ? <p className="mt-3 text-xs font-semibold text-amber-700 dark:text-amber-300">Cambiaste el código. Vuelve a ejecutar para actualizar estos resultados.</p> : null}
      {images.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} alt="plot" src={"data:image/png;base64," + img} className="quest-enter mt-4 w-full rounded-2xl border bg-white" />
      ))}
    </section>
    <Link href="/library" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary">Encontrar una idea en la librería<ArrowRight className="size-4" /></Link>
    <Dialog open={saveOpen} onOpenChange={setSaveOpen}><DialogContent className="rounded-3xl p-6 sm:max-w-md"><DialogTitle className="text-xl font-extrabold">Tu próximo proyecto empieza aquí</DialogTitle><DialogDescription>Guarda el código en tu portafolio. Los resultados se incluyen si corresponden a esta versión del código.</DialogDescription><label className="text-sm font-semibold">Nombre<Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mi primer análisis" className="mt-2 h-11 rounded-xl" /></label><label className="text-sm font-semibold">Qué descubriste<Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Una conclusión o el objetivo del experimento" className="mt-2 h-11 rounded-xl" /></label><Button onClick={save} className="h-12 rounded-2xl font-bold">Guardar proyecto</Button></DialogContent></Dialog>
  </div>;
}
