"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Briefcase, Check, CheckCheck, Flame, Lock, Play, RotateCcw, Sparkles, Star, Target } from "lucide-react";
import { SECTIONS, UNITS, getSectionForUnit } from "@/lib/curriculum";
import { continueLessonId, continueUnitId, isUnitUnlocked, useProgress } from "@/lib/progress-store";
import { decayStrength } from "@/lib/gamification";
import { lessonsToday } from "@/lib/learning-experience";
import { cn } from "@/lib/utils";
import { Pybot, PybotCoach } from "@/components/pybot";
import { UnitIcon } from "@/components/unit-icon";
import { buttonVariants } from "@/components/ui/button";

export function SkillTree({ highlight }: { highlight?: string }) {
  const progress = useProgress();
  const [chosenSection, setChosenSection] = useState<string | null>(null);
  const nextLesson = continueLessonId(progress);
  const nextUnit = continueUnitId(progress);
  const unit = UNITS.find((u) => u.id === nextUnit);
  const currentSection = getSectionForUnit(highlight ?? nextUnit ?? "u1") ?? SECTIONS[0];
  const section = SECTIONS.find((s) => s.id === chosenSection) ?? currentSection;
  if (!progress.hydrated) return <div role="status" className="mx-auto max-w-3xl px-5 py-16"><Pybot size="lg" mood="thinking" className="mx-auto" /><p className="text-center text-sm text-muted-foreground">Pybot está preparando tu ruta…</p></div>;
  const today = lessonsToday(progress.completedLessons);
  const completed = Object.keys(progress.completedLessons).length;
  const sectionDone = section.units.filter((u) => u.lessons.every((l) => progress.units[u.id]?.completedLessonIds.includes(l.id))).length;

  return <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-28 sm:px-6">
    <div className="mb-5 flex items-center justify-between gap-4"><div><p className="quest-kicker">Tu espacio de aprendizaje</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Un pequeño paso. Mucho futuro.</h1></div><span className="hidden rounded-full border bg-card px-3 py-2 text-xs font-bold sm:inline-flex"><Sparkles className="mr-1.5 size-4 text-primary" />Python · Datos · IA</span></div>
    <section className="quest-hero relative overflow-hidden rounded-[2rem] border p-5 sm:p-8" aria-label="Tu próxima misión">
      <div className="relative flex items-center gap-3 sm:gap-8">
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card/80 px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-primary uppercase"><span className="size-1.5 rounded-full bg-emerald-500" />Tu siguiente misión</span>
          <h2 className="mt-4 max-w-lg text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">{unit ? unit.title : "Tu camino sigue creciendo."}</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{unit ? unit.description : "Has recorrido todas las lecciones. Refuerza lo aprendido con una práctica o un encargo."}</p>
        </div>
        <div className="hidden w-28 shrink-0 self-start pt-5 min-[380px]:block sm:w-48 sm:self-center sm:pt-0"><Pybot size="xl" mood="wave" className="!h-auto !w-full" /><p className="text-center text-[10px] font-bold tracking-[.18em] text-muted-foreground uppercase">Pybot está contigo</p></div>
      </div>
      <Link href={nextLesson ? "/lesson/" + nextLesson : "/practice"} className={cn(buttonVariants(), "mt-5 h-12 w-full rounded-2xl px-5 font-bold sm:w-auto sm:px-7")}><Play className="size-4 fill-current" />{completed ? "Continuar mi ruta" : "Empezar mi primera clase"}<ArrowRight className="size-4" /></Link>
      <div className="mt-6 flex flex-wrap gap-3 border-t border-primary/10 pt-4 text-xs font-semibold text-muted-foreground"><span className="flex items-center gap-1.5"><CheckCheck className="size-4 text-emerald-600" />Aprende haciendo</span><span className="flex items-center gap-1.5"><Target className="size-4 text-primary" />Una idea por reto</span><span className="flex items-center gap-1.5"><Star className="size-4 text-amber-500" />{completed} lecciones completadas</span></div>
    </section>
    <div className="mt-5 grid gap-4 sm:grid-cols-[1.2fr_1fr]">
      <section className="quest-card rounded-2xl p-4" aria-label="Objetivo diario">
        <div className="flex items-center justify-between"><p className="flex items-center gap-2 text-sm font-bold"><Target className="size-4 text-primary" />Tu objetivo de hoy</p><span className="text-xs font-bold text-muted-foreground">{Math.min(today, 3)}/3 clases</span></div>
        <div className="mt-3 flex gap-2">{[0, 1, 2].map((n) => <span key={n} className={cn("flex h-8 flex-1 items-center justify-center rounded-xl transition-colors", today > n ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" : "bg-muted text-muted-foreground")}><Star className={cn("size-4", today > n && "fill-current")} /></span>)}</div>
        <p className="mt-2 text-xs text-muted-foreground">{today >= 3 ? "¡Objetivo alcanzado! Tú decides si sigues explorando." : "Tres clases es una sugerencia. Tu ritmo lo eliges tú."}</p>
      </section>
      <section className="quest-card flex items-center gap-4 rounded-2xl p-4"><span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10"><Flame className="size-7 text-orange-500" /></span><div><p className="text-xl font-extrabold">{progress.streak} {progress.streak === 1 ? "día" : "días"} de racha</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{progress.streak ? "Cada regreso refuerza lo que sabes." : "Completa una clase para empezar tu racha."}</p></div></section>
    </div>
    <div className="mt-8 flex items-end justify-between"><div><p className="quest-kicker">Explora tu ruta</p><h2 className="mt-1 text-xl font-extrabold">De cero a tus propios proyectos</h2></div><span className="hidden text-xs text-muted-foreground sm:inline">53 temas · 5 niveles por tema</span></div>
    <div className="mt-4 flex gap-2 overflow-x-auto pb-3" aria-label="Secciones del curso">{SECTIONS.map((s) => <button key={s.id} type="button" aria-pressed={section.id === s.id} onClick={() => setChosenSection(s.id)} className={cn("min-h-11 shrink-0 rounded-xl border px-4 text-xs font-bold transition", section.id === s.id ? "border-primary bg-primary text-primary-foreground shadow-sm" : "bg-card text-muted-foreground hover:border-primary/40")}>{s.index + 1}. {s.title}</button>)}</div>
    <section key={section.id} className="quest-enter mt-3" aria-labelledby="route-heading">
      <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border bg-card p-4"><div className="min-w-0"><p className="quest-kicker">Sección {section.index + 1}</p><h3 id="route-heading" className="mt-1 text-lg font-extrabold">{section.title}</h3><p className="mt-1 text-xs text-muted-foreground">{section.subtitle}</p></div><div className="flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-primary/15 text-sm font-extrabold text-primary">{sectionDone}/{section.units.length}</div></div>
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
