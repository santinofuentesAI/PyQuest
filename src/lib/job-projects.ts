import { JOB_PROJECTS, type JobProject } from "@/content/job-projects";
import { coreLessons, SECTIONS } from "@/lib/curriculum";
import type { UserProgress } from "@/lib/types";
import { hasFullUnlock } from "@/lib/redeem-codes";

export { JOB_PROJECTS, type JobProject };

export function getJobProject(id: string): JobProject | undefined {
  return JOB_PROJECTS.find((p) => p.id === id);
}

export function projectsForSection(sectionId: string): JobProject[] {
  return JOB_PROJECTS.filter((p) => p.sectionId === sectionId);
}

export function isSectionCoreComplete(sectionId: string, progress: UserProgress): boolean {
  const section = SECTIONS.find((s) => s.id === sectionId);
  if (!section) return false;
  return section.units.every((unit) => {
    const done = progress.units[unit.id]?.completedLessonIds ?? [];
    return coreLessons(unit).every((lesson) => done.includes(lesson.id));
  });
}

export function isJobUnlocked(project: JobProject, progress: UserProgress): boolean {
  if (hasFullUnlock(progress)) return true;
  // Internship week: the two fundamentals jobs are playable from day one
  // so the office intro is not locked behind 14 units.
  if (project.sectionId === "s0") return true;
  return isSectionCoreComplete(project.sectionId, progress);
}

export const MAX_JOB_HINTS = 4;

/** Only authored hints and the test the boss will run. No generic filler. */
export function hintsFor(project: JobProject): string[] {
  const merged = [
    ...project.hints,
    ...project.tests.map((t) => t.message).filter((m): m is string => Boolean(m)),
  ];
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const hint of merged) {
    const text = hint.trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    unique.push(text);
  }
  return unique.slice(0, MAX_JOB_HINTS);
}

export function projectPayout(project: JobProject, hintsUsed: number, walletHints = 0): number {
  const chargedToJob = Math.max(0, hintsUsed - walletHints);
  return Math.max(0, project.salaryUsd - chargedToJob * project.hintCostUsd);
}

export function testsToCode(project: JobProject): string {
  if (!project.tests.length) return "";
  return project.tests
    .map((t) => {
      const msg = t.message ? `, ${JSON.stringify(t.message)}` : "";
      const setup = t.setup ? `${t.setup}\n` : "";
      return `${setup}assert ${t.assert.replace(/^assert\s+/, "")}${msg}`;
    })
    .join("\n");
}

export function briefText(project: JobProject): string {
  return `Tu jefe te pidió que, basado en tus conocimientos del módulo (${project.moduleName}), vas a crear ${project.deliverable}. Hazlo lo mejor posible.`;
}

function compactSource(s: string) {
  return s.replace(/#.*$/gm, "").replace(/\s+/g, " ").trim();
}

export function looksIncomplete(code: string, starter: string): boolean {
  const compact = compactSource(code);
  if (!compact) return true;
  if (compact === compactSource(starter)) return true;
  // Authored runtime checks judge values. Counting None/return {} in source
  // rejects valid code that assigns later or has a legitimate empty fallback.
  return false;
}

export function reviewDelivery(
  project: JobProject,
  code: string,
  result: { ok?: boolean; error: string | null; images?: string[] },
): { accepted: boolean; incomplete: boolean; message: string } {
  const incomplete = looksIncomplete(code, project.starterCode);
  const missingPlot = Boolean(project.requirePlot && (!result.images || result.images.length === 0));
  const checksFailed = Boolean(result.error) || result.ok === false;
  if (incomplete || missingPlot || checksFailed) {
    const plotErr = missingPlot ? "El jefe quiere ver el gráfico. Dibuja las barras o las líneas con matplotlib." : null;
    return {
      accepted: false,
      incomplete,
      message: friendlyFailMessage(result.error ?? plotErr, incomplete && !missingPlot),
    };
  }
  if (!project.tests.length && !project.requirePlot) {
    return {
      accepted: false,
      incomplete: true,
      message: "Todavía no hay resultados que revisar. Completa el encargo y vuelve a entregarlo.",
    };
  }
  return { accepted: true, incomplete: false, message: "" };
}

/** Drop Pyodide internals. Keep a single human line. */
export function humanPythonError(error: string | null): string | null {
  if (!error) return null;
  const assertMsg = error.match(/AssertionError:\s*([^\n]+)/)?.[1]?.trim();
  if (assertMsg) return assertMsg;
  const named = error.match(
    /(NameError|TypeError|ValueError|ZeroDivisionError|SyntaxError|IndentationError|KeyError):\s*([^\n]+)/
  );
  if (named) return `${named[1]}: ${named[2].trim()}`;
  const lines = error
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l &&
        !l.startsWith("PythonError") &&
        !l.includes("/lib/python") &&
        !l.includes("pyodide") &&
        !l.includes("CodeRunner") &&
        !l.includes("eval_code") &&
        !l.startsWith("File ") &&
        !/^\^+/.test(l)
    );
  return lines.at(-1) || null;
}

export function friendlyFailMessage(error: string | null, incomplete: boolean): string {
  const detail = humanPythonError(error);
  if (incomplete && detail) {
    return `Todavía falta una parte. ${detail}`;
  }
  if (incomplete) {
    return "Este es el código inicial. Completa los cálculos antes de entregar.";
  }
  if (detail) return `Revisa esto: ${detail}`;
  return "La entrega todavía no cumple el encargo. Revisa las variables del briefing y vuelve a probar.";
}
