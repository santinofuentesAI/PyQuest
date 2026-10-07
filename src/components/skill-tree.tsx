"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Briefcase, Check, ChevronDown, Compass, Lock, Play, RotateCcw } from "lucide-react";
import { SECTIONS, getSectionForUnit } from "@/lib/curriculum";
import { continueLessonId, continueUnitId, isUnitUnlocked, useProgress } from "@/lib/progress-store";
import { decayStrength } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { Pybot, PybotCoach } from "@/components/pybot";
import { UnitIcon } from "@/components/unit-icon";
import { buttonVariants } from "@/components/ui/button";

export function SkillTree({ highlight }: { highlight?: string }) {
  const progress = useProgress();
  const [routeOpen, setRouteOpen] = useState(false);
  const routeToggle = useRef<HTMLButtonElement>(null);
  const [chosenSection, setChosenSection] = useState<string | null>(null);
  const nextLesson = continueLessonId(progress);
  const nextUnit = continueUnitId(progress);
  const currentSection = getSectionForUnit(highlight ?? nextUnit ?? "u1") ?? SECTIONS[0];
  const section = SECTIONS.find((s) => s.id === chosenSection) ?? currentSection;
  if (!progress.hydrated) return <div role="status" className="mx-auto max-w-3xl px-5 py-16"><Pybot size="lg" mood="thinking" className="mx-auto" /><p className="text-center text-sm text-muted-foreground">Pybot está preparando tu ruta…</p></div>;
  const completed = Object.keys(progress.completedLessons).length;
  const sectionDone = section.units.filter((u) => u.lessons.every((l) => progress.units[u.id]?.completedLessonIds.includes(l.id))).length;

  function closeRoute() {
    setRouteOpen(false);
    routeToggle.current?.focus();
  }

  return <div className="mx-auto w-full max-w-5xl px-4 pt-4 pb-28 sm:px-6 sm:pt-6">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Aprender</h1>
        <p className="mt-1 text-xs text-muted-foreground">Python · Datos · IA</p>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Pybot size="xs" mood="wave" className="sm:!size-12" />
        <Link href={nextLesson ? "/lesson/" + nextLesson : "/practice"} className={cn(buttonVariants({ size: "sm" }), "h-11 rounded-xl px-3 text-xs font-bold sm:px-4 sm:text-sm")}>
          <Play className="size-3.5 fill-current" />{nextLesson ? completed ? "Retomar clase" : "Empezar clase" : "Repasar"}
        </Link>
      </div>
    </div>
    <button ref={routeToggle} type="button" aria-expanded={routeOpen} aria-controls="course-sections" onClick={() => setRouteOpen((open) => !open)} className="quest-card mb-3 flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left">
      <Compass className="size-5 shrink-0 text-primary" />
      <span className="flex-1 text-sm font-bold">Explora tu ruta<span className="ml-2 hidden text-xs font-normal text-muted-foreground sm:inline">{SECTIONS.length} secciones · 53 temas</span></span>
      <ChevronDown className={cn("size-4 text-primary transition-transform motion-reduce:transition-none", routeOpen && "rotate-180")} />
    </button>
    <div id="course-sections" hidden={!routeOpen} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); closeRoute(); } }}>
      <div className="quest-enter mb-4 rounded-2xl border bg-card p-3">
        <p className="mb-3 px-1 text-xs text-muted-foreground">Elige una sección para ver sus temas. Tu progreso sigue guardado.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="Secciones del curso">
          {SECTIONS.map((s) => <button key={s.id} type="button" aria-label={`${s.index + 1}. ${s.title}`} aria-pressed={section.id === s.id} onClick={() => { setChosenSection(s.id); closeRoute(); }} className={cn("flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition", section.id === s.id ? "border-primary bg-primary text-primary-foreground shadow-sm" : "bg-card text-muted-foreground hover:border-primary/40")}>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-current/10">{s.index + 1}.</span>{s.title}
          </button>)}
        </div>
      </div>
    </div>
    <section key={section.id} className="quest-enter" aria-labelledby="route-heading">
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border bg-card p-4"><div className="min-w-0"><p className="quest-kicker">Sección {section.index + 1}</p><h3 id="route-heading" className="mt-1 text-lg font-extrabold">{section.title}</h3><p className="mt-1 text-xs text-muted-foreground">{section.subtitle}</p></div><div className="flex size-11 shrink-0 items-center justify-center rounded-full border-[3px] border-primary/15 text-xs font-extrabold text-primary">{sectionDone}/{section.units.length}</div></div>
      <ol className="relative grid gap-4 before:absolute before:top-6 before:bottom-6 before:left-6 before:w-0.5 before:bg-border sm:grid-cols-2 sm:before:hidden">
        {section.units.map((u, index) => {
          const open = isUnitUnlocked(u.id, progress);
          const doneIds = progress.units[u.id]?.completedLessonIds ?? [];
          const done = u.lessons.every((l) => doneIds.includes(l.id));
          const weak = done && decayStrength(progress.units[u.id]?.strength ?? 0, progress.units[u.id]?.lastPracticedAt ?? null) < .45;
          const current = u.id === nextUnit || u.id === highlight;
          const content = <><span className={cn("relative flex size-12 shrink-0 items-center justify-center rounded-2xl border-2", done ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-600" : open ? "border-primary/15 bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground")}>{!open ? <Lock className="size-5" /> : done ? (weak ? <RotateCcw className="size-5" /> : <Check className="size-6" />) : <UnitIcon name={u.icon} className="size-5" />}</span><div className="min-w-0 flex-1"><p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Tema {index + 1}{current ? " · Tu siguiente paso" : u.isProject ? " · Proyecto" : ""}</p><p className="mt-1 text-sm font-extrabold sm:text-base">{u.title}</p><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{u.description}</p><div className="mt-3 flex items-center gap-1" aria-label={doneIds.length + " de " + u.lessons.length + " niveles completados"}>{u.lessons.map((l) => <span key={l.id} className={cn("h-1.5 w-6 rounded-full", doneIds.includes(l.id) ? "bg-emerald-500" : "bg-muted")} />)}<span className="ml-2 text-[10px] font-bold text-muted-foreground">{open ? weak ? "Repasa" : done ? "Completado" : doneIds.length + "/" + u.lessons.length : "Por desbloquear"}</span></div></div>{open ? <ArrowRight className="size-4 shrink-0 text-primary" /> : null}</>;
          return <li key={u.id}>{open ? <Link href={"/unit/" + u.id} className={cn("quest-card flex h-full items-center gap-3 rounded-2xl p-4", current && "quest-current border-primary/50")}>{content}</Link> : <div className="flex h-full items-center gap-3 rounded-2xl border bg-muted/40 p-4">{content}</div>}</li>;
        })}
      </ol>
    </section>
    <PybotCoach className="mt-6">Tu ruta llega hasta análisis de datos e IA. Si algo se complica, prueba el ejemplo en la librería y vuelve con una idea nueva.</PybotCoach>
    <div className="mt-5 grid grid-cols-2 gap-3"><Link href="/library" className="quest-card rounded-2xl p-4"><BookOpen className="mb-3 size-5 text-primary" /><p className="text-sm font-bold">Entender una idea</p><p className="mt-1 text-xs text-muted-foreground">Ejemplos que puedes tocar.</p></Link><Link href="/projects" className="quest-card rounded-2xl p-4"><Briefcase className="mb-3 size-5 text-emerald-600" /><p className="text-sm font-bold">Crear algo propio</p><p className="mt-1 text-xs text-muted-foreground">Lleva Python a un encargo.</p></Link></div>
  </div>;
}
