"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, FlaskConical, Play, RotateCcw, Save } from "lucide-react";
import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { PythonStatus } from "@/components/python-status";
import { PybotCoach } from "@/components/pybot";
import { PybotHelp } from "@/components/pybot-help";
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
  const [tab, setTab] = useState<"code" | "console">("code");
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
    setTab("console");
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
  return <div className="mx-auto max-w-5xl px-3 pt-3 pb-24 sm:px-6 sm:pt-5">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div><h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Laboratorio</h1><p className="mt-1 text-[11px] text-muted-foreground">Borrador guardado en este navegador</p></div>
      <div className="flex items-center gap-1"><PybotHelp inline /><Button variant="ghost" size="icon" className="size-11 rounded-xl" aria-label="Guardar en portafolio" onClick={() => setSaveOpen(true)} disabled={busy || !code.trim()}><Save className="size-5" /></Button></div>
    </div>
    <div className="overflow-hidden rounded-2xl border border-[#343958] bg-[#1e2135] text-zinc-100 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#303454] px-2 sm:px-4">
        <div role="tablist" aria-label="Vistas del laboratorio" className="flex min-w-0 gap-1" onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const next = event.key === "Home" ? "code" : event.key === "End" ? "console" : tab === "code" ? "console" : "code";
          setTab(next); document.getElementById("lab-tab-" + next)?.focus();
        }}>
          <button id="lab-tab-code" role="tab" type="button" aria-selected={tab === "code"} aria-controls="lab-code" tabIndex={tab === "code" ? 0 : -1} onClick={() => setTab("code")} className={"min-h-14 border-b-[3px] px-2 text-xs font-bold sm:px-3 sm:text-sm " + (tab === "code" ? "border-violet-300 text-white" : "border-transparent text-zinc-300")}>script.py</button>
          <button id="lab-tab-console" role="tab" type="button" aria-selected={tab === "console"} aria-controls="lab-console" tabIndex={tab === "console" ? 0 : -1} onClick={() => setTab("console")} className={"min-h-14 border-b-[3px] px-2 text-xs font-bold sm:px-3 sm:text-sm " + (tab === "console" ? "border-violet-300 text-white" : "border-transparent text-zinc-300")}>Consola<span className="sr-only">{err ? " · Error" : ""}</span></button>
        </div>
        <Button className="h-10 shrink-0 rounded-xl border border-violet-300/30 bg-violet-400/15 px-3 text-xs font-bold text-white shadow-none hover:bg-violet-400/25 sm:text-sm" onClick={run} disabled={busy}><Play className="size-3.5 fill-current" />{busy ? "Ejecutando…" : "Ejecutar"}</Button>
      </div>
      <div id="lab-code" role="tabpanel" aria-labelledby="lab-tab-code" hidden={tab !== "code"}>
        <CodeEditor value={code} onChange={progress.saveLabDraft} height="clamp(120px, calc(100dvh - 330px), 620px)" forceDark compact />
      </div>
      <section id="lab-console" role="tabpanel" aria-labelledby="lab-tab-console" tabIndex={0} hidden={tab !== "console"} className="min-h-[clamp(176px,calc(100dvh-274px),676px)] p-4">
        <p className="mb-3 flex items-center gap-2 text-xs font-bold text-zinc-300"><FlaskConical className="size-4 text-emerald-300" />Salida y gráficos</p>
        {!out && !err && !images.length ? <p role="status" className="text-sm leading-relaxed text-zinc-400">{busy ? "Preparando Python y ejecutando… La primera vez puede tardar un poco." : resultCode ? "Tu código terminó sin imprimir. Añade print() para observar un valor." : "Ejecuta tu código para ver aquí la salida y los gráficos."}</p> : null}
        {out ? <pre className="overflow-x-auto text-sm leading-relaxed text-emerald-200">{out}</pre> : null}
        {err ? <pre role="alert" className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-rose-950/70 p-3 text-sm text-rose-100">{err}</pre> : null}
        {resultCode && resultCode !== code ? <p className="mt-3 text-xs font-semibold text-amber-300">Cambiaste el código. Vuelve a ejecutar para actualizar estos resultados.</p> : null}
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} alt="plot" src={"data:image/png;base64," + img} className="quest-enter mt-4 w-full rounded-xl bg-white" />
        ))}
      </section>
    </div>
    <details className="group mt-3 rounded-xl border bg-card">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 text-xs font-bold">Ejemplos y herramientas<ChevronDown className="size-4 text-primary transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary>
      <div className="border-t p-4">
        <PythonStatus />
        <PybotCoach className="mt-3" mood="thinking">Escribe tu idea y pulsa Ejecutar. Usa los símbolos para insertar paréntesis o comillas; Tab completa palabras o indenta.</PybotCoach>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" className="min-h-11 rounded-xl text-xs" onClick={() => setSaveOpen(true)} disabled={busy || !code.trim()}><Save className="size-4" />Guardar en portafolio</Button>
          <Button variant="ghost" className="min-h-11 rounded-xl text-xs" onClick={() => { progress.saveLabDraft(SAMPLE); setTab("code"); setOut(""); setImages([]); setErr(null); setResultCode(null); }} disabled={busy}><RotateCcw className="size-4" />Restaurar ejemplo</Button>
        </div>
        <Link href="/library" className="mt-3 inline-flex min-h-11 items-center gap-2 text-xs font-bold text-primary">Encontrar una idea en la librería<ArrowRight className="size-4" /></Link>
      </div>
    </details>
    <Dialog open={saveOpen} onOpenChange={setSaveOpen}><DialogContent className="rounded-3xl p-6 sm:max-w-md"><DialogTitle className="text-xl font-extrabold">Tu próximo proyecto empieza aquí</DialogTitle><DialogDescription>Guarda el código en tu portafolio. Los resultados se incluyen si corresponden a esta versión del código.</DialogDescription><label className="text-sm font-semibold">Nombre<Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mi primer análisis" className="mt-2 h-11 rounded-xl" /></label><label className="text-sm font-semibold">Qué descubriste<Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Una conclusión o el objetivo del experimento" className="mt-2 h-11 rounded-xl" /></label><Button onClick={save} className="h-12 rounded-2xl font-bold">Guardar proyecto</Button></DialogContent></Dialog>
  </div>;
}
