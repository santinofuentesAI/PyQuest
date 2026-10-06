"use client";

import Link from "next/link";
import { Briefcase, Check, Lock, Play, Wallet } from "lucide-react";
import { SECTIONS } from "@/lib/curriculum";
import {
  isJobUnlocked,
  isSectionCoreComplete,
  JOB_PROJECTS,
  projectPayout,
  projectsForSection,
} from "@/lib/job-projects";
import { useProgress } from "@/lib/progress-store";
import { hasFullUnlock } from "@/lib/redeem-codes";
import { buttonVariants } from "@/components/ui/button";
import { cn, pageWrap } from "@/lib/utils";

export default function ProjectsPage() {
  const progress = useProgress();

  if (!progress.hydrated) {
    return <p className="px-6 py-16 text-sm text-muted-foreground">Cargando encargos…</p>;
  }

  const career = progress.jobUsd ?? 0;
  const doneCount = JOB_PROJECTS.filter((p) => progress.jobProjects?.[p.id]?.completed).length;

  return (
    <div className={pageWrap}>
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">Oficina</p>
      <h1 className="font-heading mt-1 text-3xl font-extrabold tracking-tight">Proyectos</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Dos encargos por sección, lo más parecidos a un trabajo real. Los de Fundamentos están
        abiertos para probar la oficina; a partir de NumPy se desbloquean al terminar las lecciones
        esenciales de esa sección. El salario es ficticio: si pides pista, se descuenta.
      </p>

      <div className="mt-4 flex items-center justify-between rounded-2xl border bg-card px-4 py-3">
        <div>
          <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Salario cobrado
          </p>
          <p className="font-heading text-2xl font-black tabular-nums">${career}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {doneCount}/{JOB_PROJECTS.length} entregas
        </p>
      </div>

      {SECTIONS.map((section) => {
        const jobs = projectsForSection(section.id);
        const sectionOpen =
          section.id === "s0" ||
          hasFullUnlock(progress) ||
          isSectionCoreComplete(section.id, progress);
        return (
          <section key={section.id} className="mt-8">
            <div className="mb-3">
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: section.color }}>
                Sección {section.index} · {section.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {sectionOpen
                  ? "2 encargos desbloqueados"
                  : "Completa las lecciones esenciales de esta sección para abrir los encargos."}
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {jobs.map((job) => {
                const unlocked = isJobUnlocked(job, progress);
                const state = progress.jobProjects?.[job.id];
                const paid = state?.completed
                  ? state.paidUsd
                  : projectPayout(job, state?.hintsUsed ?? 0, state?.walletHints ?? 0);
                return (
                  <li key={job.id}>
                    {unlocked ? (
                      <Link
                        href={`/projects/${job.id}`}
                        className="block rounded-2xl border bg-card p-4 hover:border-primary/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                              {job.company}
                            </p>
                            <h2 className="font-heading mt-0.5 text-base font-bold">{job.title}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">{job.summary}</p>
                          </div>
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-sm font-black tabular-nums text-emerald-700 dark:text-emerald-300">
                            <Wallet className="size-3.5" />
                            ${job.salaryUsd}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          {state?.completed ? (
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                              <Check className="size-4" />
                              Cobraste ${paid}
                            </span>
                          ) : (
                            <span className={cn(buttonVariants({ size: "sm" }), "h-9 rounded-xl font-bold")}>
                              <Play className="size-3.5" />
                              Iniciar
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">Pista ${job.hintCostUsd}</span>
                        </div>
                      </Link>
                    ) : (
                      <div className="rounded-2xl border border-dashed bg-muted/40 p-4 opacity-80">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                              <Lock className="size-3" />
                              {job.company}
                            </p>
                            <h2 className="font-heading mt-0.5 text-base font-bold">{job.title}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Se abre al terminar {section.title}.
                            </p>
                          </div>
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-sm font-black tabular-nums text-muted-foreground">
                            ${job.salaryUsd}
                          </span>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className="mt-10 inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Briefcase className="size-3.5" />
        Los encargos no sustituyen los proyectos del mapa: son el trabajo de oficina de cada módulo.
      </p>
    </div>
  );
}
