"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Check, ClipboardCheck, Copy, DollarSign, Rocket, Target } from "lucide-react";
import { toast } from "sonner";
import { careerProjects, offerSteps, type CareerProject } from "@/content/projects";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProjectState = Record<string, string[]>;

const storageKey = "pyquest-project-studio-v1";

export function ProjectStudio() {
  const [selectedId, setSelectedId] = useState(careerProjects[0].id);
  const [done, setDone] = useState<ProjectState>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as ProjectState;
    } catch { return {}; }
  });

  useEffect(() => {
    try { window.localStorage.setItem(storageKey, JSON.stringify(done)); } catch { /* ignore */ }
  }, [done]);

  const project = careerProjects.find((item) => item.id === selectedId) ?? careerProjects[0];
  const completed = done[project.id] ?? [];
  const total = project.milestones.length + project.deliverables.length;
  const progress = Math.round((completed.length / total) * 100);

  const toggle = (id: string) => {
    setDone((current) => {
      const list = current[project.id] ?? [];
      return { ...current, [project.id]: list.includes(id) ? list.filter((item) => item !== id) : [...list, id] };
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28">
      <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="bg-[radial-gradient(circle_at_80%_0%,rgba(6,182,212,.2),transparent_37%),radial-gradient(circle_at_8%_100%,rgba(124,58,237,.2),transparent_40%)] px-5 py-7 sm:px-8 sm:py-10">
          <p className="flex items-center gap-2 text-xs font-bold tracking-[.18em] text-primary uppercase"><BriefcaseBusiness className="size-4" /> Proyecto a portafolio</p>
          <h1 className="font-heading mt-2 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">Aprende Python y conviértelo en algo que un negocio puede usar.</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">Elige un reto, crea evidencia y prepara una oferta pequeña y clara. Los precios son referencias de piloto en Costa Rica; no son una promesa de ingreso.</p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
            <span className="rounded-full bg-background/80 px-3 py-1.5">4 proyectos guiados</span>
            <span className="rounded-full bg-background/80 px-3 py-1.5">Entregables reales</span>
            <span className="rounded-full bg-background/80 px-3 py-1.5">Pitch para un primer cliente</span>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <div><p className="text-xs font-bold tracking-widest text-primary uppercase">Elige tu misión</p><h2 className="font-heading text-2xl font-extrabold">No solo practiques: entrega algo.</h2></div>
          <span className="hidden text-sm text-muted-foreground sm:block">Empieza por ventas si es tu primer caso.</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {careerProjects.map((item) => <ProjectCard key={item.id} item={item} selected={project.id === item.id} onSelect={() => setSelectedId(item.id)} />)}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-3xl border bg-card p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-sm font-bold text-primary">{project.level} · {project.client}</p><h2 className="font-heading mt-1 text-2xl font-extrabold">{project.title}</h2><p className="mt-2 text-muted-foreground">{project.question}</p></div>
            <div className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-right text-sm"><p className="font-bold text-emerald-700 dark:text-emerald-300">{project.price}</p><p className="text-xs text-muted-foreground">{project.hours}</p></div>
          </div>
          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4"><p className="flex items-center gap-2 font-bold"><Target className="size-4 text-primary" /> Resultado que demostrarás</p><p className="mt-1 text-sm text-muted-foreground">{project.outcome}</p></div>
          <div className="mt-5 flex flex-wrap gap-2">{project.skills.map((skill) => <span key={skill} className="rounded-full border bg-muted/40 px-3 py-1 text-xs font-bold">{skill}</span>)}</div>

          <div className="mt-7"><div className="flex items-center justify-between"><h3 className="font-bold">Tablero de entrega</h3><span className="text-sm font-bold text-primary">{completed.length}/{total} · {progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all" style={{ width: `${progress}%` }} /></div></div>
          <Checklist title="Construye" items={project.milestones} prefix="m" checked={completed} onToggle={toggle} />
          <Checklist title="Entrega" items={project.deliverables} prefix="d" checked={completed} onToggle={toggle} />
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border bg-card p-5"><p className="flex items-center gap-2 font-bold"><DollarSign className="size-4 text-emerald-500" /> Cómo convertirlo en servicio</p><p className="mt-2 text-sm text-muted-foreground">El objetivo inicial es una prueba útil y pequeña. Cobra por el resultado acordado, no por palabras como “IA”.</p><ol className="mt-4 space-y-4">{offerSteps.map(([title, text], index) => <li key={title} className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">{index + 1}</span><div><p className="text-sm font-bold">{title}</p><p className="text-xs leading-relaxed text-muted-foreground">{text}</p></div></li>)}</ol></div>
          <div className="rounded-3xl border bg-card p-5"><p className="flex items-center gap-2 font-bold"><Rocket className="size-4 text-primary" /> Mensaje para iniciar</p><p className="mt-2 rounded-2xl bg-muted/60 p-3 text-sm leading-relaxed text-muted-foreground">“{project.pitch}”</p><Button variant="outline" className="mt-3 h-10 w-full rounded-xl" onClick={async () => { try { await navigator.clipboard.writeText(project.pitch); toast.success("Mensaje copiado"); } catch { toast.message("Selecciona y copia el mensaje"); } }}><Copy className="size-4" /> Copiar mensaje</Button></div>
          <div className="rounded-3xl border border-dashed p-5"><p className="flex items-center gap-2 font-bold"><ClipboardCheck className="size-4 text-primary" /> Regla para publicar</p><p className="mt-2 text-sm text-muted-foreground">No publiques datos de un negocio sin permiso. Usa datos simulados o anonimizados y explica qué limitaciones tiene tu análisis.</p></div>
        </aside>
      </section>
    </div>
  );
}

function ProjectCard({ item, selected, onSelect }: { item: CareerProject; selected: boolean; onSelect: () => void }) {
  return <button type="button" onClick={onSelect} className={cn("rounded-3xl border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/50", selected && "border-primary bg-primary/5 ring-2 ring-primary/20")}><span className="text-xs font-bold text-primary">{item.level}</span><h3 className="font-heading mt-1 font-extrabold">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">{item.question}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">Abrir proyecto <ArrowRight className="size-3.5" /></span></button>;
}

function Checklist({ title, items, prefix, checked, onToggle }: { title: string; items: string[]; prefix: string; checked: string[]; onToggle: (id: string) => void }) {
  return <div className="mt-6"><h3 className="font-bold">{title}</h3><ul className="mt-2 space-y-2">{items.map((item, index) => { const id = `${prefix}-${index}`; const done = checked.includes(id); return <li key={id}><button type="button" onClick={() => onToggle(id)} className="flex w-full items-start gap-3 rounded-2xl border p-3 text-left hover:bg-muted/50"><span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border", done && "border-emerald-500 bg-emerald-500 text-white")}><Check className={cn("size-3", !done && "opacity-0")} /></span><span className={cn("text-sm", done && "text-muted-foreground line-through")}>{item}</span></button></li>; })}</ul></div>;
}
