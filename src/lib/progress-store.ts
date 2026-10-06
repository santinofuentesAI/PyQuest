"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { JobProjectProgress, LeagueId, LessonResult, PortfolioItem, UserProgress } from "./types";
import { getJobProject, hintsFor, looksIncomplete, projectPayout } from "./job-projects";
import { trimImage, trimStdout, upsertJobPortfolio } from "./portfolio";
import {
  applyDailyStreak,
  applyWeeklyXp,
  HEART_REFILL_COST,
  HEART_SALARY_COST,
  FREEZE_SALARY_COST,
  STREAK_FREEZE_COST,
  MAX_HEARTS,
  regenerateHearts,
  todayKey,
  weekId,
} from "./gamification";
import { coreLessons, getUnitByLessonId, UNITS } from "./curriculum";
import { FULL_UNLOCK_CODE, hasFullUnlock, lookupCode } from "./redeem-codes";
import { DEFAULT_PALETTE, type PaletteId } from "./palettes";

const defaultProgress = (): UserProgress => ({
  displayName: "Explorador",
  onboarded: true,
  placementDone: true,
  placementScore: null,
  startingUnitId: "u1",
  xp: 0,
  gems: 0,
  hearts: MAX_HEARTS,
  heartsUpdatedAt: Date.now(),
  streak: 0,
  lastPracticeDate: null,
  streakFreezes: 1,
  freezeUsedToday: false,
  weeklyXp: 0,
  weekId: weekId(),
  league: "bronze",
  completedLessons: {},
  units: {},
  badges: [],
  legendaryHighScore: 0,
  theme: "system",
  palette: DEFAULT_PALETTE,
  soundEnabled: true,
  redeemedCodes: [],
  unlockAll: false,
  jobUsd: 0,
  jobProjects: {},
  portfolio: [],
});

function emptyJobProgress(): JobProjectProgress {
  return { completed: false, hintsUsed: 0, paidUsd: 0, failCount: 0 };
}

type ProgressState = UserProgress & {
  hydrated: boolean;
  setHydrated: () => void;
  refresh: () => void;
  setName: (name: string) => void;
  completeOnboarding: () => void;
  setTheme: (theme: UserProgress["theme"]) => void;
  setPalette: (palette: PaletteId) => void;
  loseHeart: () => boolean;
  refillHearts: () => boolean;
  buyHeartWithSalary: () => boolean;
  buyFreeze: () => boolean;
  buyFreezeWithSalary: () => boolean;
  completeLesson: (result: LessonResult) => string[];
  applyPlacement: (score: number, total: number) => string;
  unlockPracticeHearts: () => void;
  addLegendaryScore: (xp: number) => void;
  setSound: (on: boolean) => void;
  restoreHeart: () => void;
  boostUnit: (unitId: string) => void;
  resetProgress: () => void;
  redeemCode: (raw: string) => { ok: boolean; message: string; openMap?: boolean };
  saveJobDraft: (projectId: string, code: string) => void;
  useJobHint: (projectId: string) => { ok: boolean; hint: string | null; charged: number };
  completeJobProject: (
    projectId: string,
    artifact?: { code: string; stdout?: string; image?: string }
  ) => { ok: boolean; paid: number };
  recordJobFail: (projectId: string) => number;
  resetJobProject: (projectId: string) => void;
  addLabPortfolio: (item: { title: string; description: string; code: string; stdout?: string; image?: string }) => boolean;
  removePortfolioItem: (id: string) => void;
};

function awardBadges(p: UserProgress): string[] {
  const newly: string[] = [];
  const has = new Set(p.badges);
  const earn = (id: string) => {
    if (!has.has(id)) {
      has.add(id);
      newly.push(id);
    }
  };

  if (p.placementDone) earn("first-steps");
  if (p.streak >= 3) earn("streak-3");
  if (p.streak >= 7) earn("streak-7");
  if (p.streak >= 30) earn("streak-30");
  if (p.xp >= 500) earn("xp-500");
  if (p.xp >= 2000) earn("xp-2000");
  if (Object.values(p.completedLessons).some((l) => l.perfect)) earn("perfect-lesson");

  const completedUnits = UNITS.filter((u) => {
    const prog = p.units[u.id];
    if (!prog) return false;
    return u.lessons.every((l) => prog.completedLessonIds.includes(l.id));
  }).map((u) => u.id);

  if (completedUnits.includes("u1")) earn("hello-python");
  if (completedUnits.includes("u14")) earn("numpy-ninja");
  if (completedUnits.includes("u19")) earn("viz-storyteller");
  if (completedUnits.includes("u23")) earn("pandas-master");
  if (completedUnits.includes("u28")) earn("stats-sage");
  if (completedUnits.includes("u32")) earn("ml-tamer");
  if (completedUnits.includes("u39")) earn("neural-spark");

  p.badges = Array.from(has);
  return newly;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...defaultProgress(),
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      refresh: () => set(regenerateHearts(get())),
      setName: (displayName) => set({ displayName }),
      completeOnboarding: () => set({ onboarded: true, placementDone: true }),
      setTheme: (theme) => set({ theme }),
      setPalette: (palette) => set({ palette }),
      loseHeart: () => {
        const current = regenerateHearts(get());
        if (current.hearts <= 0) {
          set(current);
          return false;
        }
        set({
          ...current,
          hearts: current.hearts - 1,
          heartsUpdatedAt: Date.now(),
        });
        return true;
      },
      refillHearts: () => {
        const p = get();
        if (p.hearts >= MAX_HEARTS) return false;
        if (p.gems < HEART_REFILL_COST) return false;
        set({ gems: p.gems - HEART_REFILL_COST, hearts: MAX_HEARTS, heartsUpdatedAt: Date.now() });
        return true;
      },
      buyHeartWithSalary: () => {
        const p = regenerateHearts(get());
        if (p.hearts >= MAX_HEARTS) return false;
        if ((p.jobUsd ?? 0) < HEART_SALARY_COST) return false;
        set({
          ...p,
          jobUsd: (p.jobUsd ?? 0) - HEART_SALARY_COST,
          hearts: p.hearts + 1,
          heartsUpdatedAt: Date.now(),
        });
        return true;
      },
      buyFreeze: () => {
        const p = get();
        if (p.gems < STREAK_FREEZE_COST) return false;
        set({ gems: p.gems - STREAK_FREEZE_COST, streakFreezes: p.streakFreezes + 1 });
        return true;
      },
      buyFreezeWithSalary: () => {
        const p = get();
        if ((p.jobUsd ?? 0) < FREEZE_SALARY_COST) return false;
        set({
          jobUsd: (p.jobUsd ?? 0) - FREEZE_SALARY_COST,
          streakFreezes: p.streakFreezes + 1,
        });
        return true;
      },
      completeLesson: (result) => {
        let p: UserProgress = regenerateHearts(get());
        p = applyDailyStreak(p);
        p = applyWeeklyXp(p, result.xp);
        const prev = p.completedLessons[result.lessonId];
        const firstTime = !prev;
        const xpGain = firstTime ? result.xp : Math.round(result.xp * 0.25);
        const gemGain = firstTime ? (result.perfect ? 8 : 4) : 1;
        p = {
          ...p,
          xp: p.xp + xpGain,
          gems: p.gems + gemGain,
          completedLessons: { ...p.completedLessons, [result.lessonId]: result },
        };
        const unit = getUnitByLessonId(result.lessonId);
        if (unit) {
          const current = p.units[unit.id] ?? {
            strength: 0.4,
            lastPracticedAt: null,
            completedLessonIds: [],
          };
          const completedLessonIds = Array.from(
            new Set([...current.completedLessonIds, result.lessonId])
          );
          p = {
            ...p,
            units: {
              ...p.units,
              [unit.id]: {
                strength: Math.min(1, 0.55 + completedLessonIds.length * 0.2),
                lastPracticedAt: new Date().toISOString(),
                completedLessonIds,
              },
            },
          };
        }
        const newly = awardBadges(p);
        set(p);
        return newly;
      },
      applyPlacement: (score, total) => {
        const ratio = total ? score / total : 0;
        let startingUnitId = "u1";
        if (ratio >= 0.85) startingUnitId = "u23";
        else if (ratio >= 0.7) startingUnitId = "u14";
        else if (ratio >= 0.5) startingUnitId = "u8";
        else if (ratio >= 0.3) startingUnitId = "u4";
        const nowIso = new Date().toISOString();
        const p: UserProgress = {
          ...get(),
          placementDone: true,
          placementScore: score,
          startingUnitId,
          onboarded: true,
          completedLessons: { ...get().completedLessons },
          units: { ...get().units },
        };
        const unitIndex = UNITS.find((u) => u.id === startingUnitId)?.index ?? 1;
        UNITS.filter((u) => u.index < unitIndex).forEach((u) => {
          p.units[u.id] = {
            strength: 0.7,
            lastPracticedAt: nowIso,
            completedLessonIds: u.lessons.map((l) => l.id),
          };
          for (const lesson of u.lessons) {
            if (p.completedLessons[lesson.id]) continue;
            p.completedLessons[lesson.id] = {
              lessonId: lesson.id,
              completedAt: nowIso,
              correct: lesson.exercises.length,
              total: lesson.exercises.length,
              xp: 0,
              perfect: false,
            };
          }
        });
        awardBadges(p);
        set(p);
        return startingUnitId;
      },
      unlockPracticeHearts: () => {},
      addLegendaryScore: (xp) => {
        let p: UserProgress = regenerateHearts(get());
        p = applyDailyStreak(p);
        p = applyWeeklyXp(p, xp);
        p = {
          ...p,
          xp: p.xp + xp,
          gems: p.gems + 2,
          legendaryHighScore: Math.max(p.legendaryHighScore, xp),
        };
        awardBadges(p);
        set(p);
      },
      setSound: (on) => set({ soundEnabled: on }),
      restoreHeart: () => {
        const current = regenerateHearts(get());
        const hearts =
          current.hearts >= MAX_HEARTS ? current.hearts : Math.min(MAX_HEARTS, current.hearts + 1);
        set({
          ...current,
          hearts,
          heartsUpdatedAt: Date.now(),
        });
      },
      redeemCode: (raw) => {
        const { code, def } = lookupCode(raw);
        if (!code) return { ok: false, message: "Escribe un código." };
        const current = regenerateHearts(get());
        if (!def) return { ok: false, message: "Ese código no existe." };
        if (def.kind === "unlockAll") {
          const last = UNITS[UNITS.length - 1];
          const codes = current.redeemedCodes ?? [];
          set({
            unlockAll: true,
            startingUnitId: last?.id ?? current.startingUnitId,
            redeemedCodes: codes.includes(code) ? codes : [...codes, code],
          });
          return {
            ok: true,
            openMap: true,
            message: codes.includes(code)
              ? "El mapa ya estaba abierto. Te llevo a todas las unidades."
              : `Código ${code}: ${def.label}.`,
          };
        }
        if ((current.redeemedCodes ?? []).includes(code)) {
          return { ok: false, message: "Ese código ya lo canjeaste en este dispositivo." };
        }
        set({
          hearts: def.hearts,
          heartsUpdatedAt: Date.now(),
          redeemedCodes: [...(current.redeemedCodes ?? []), code],
        });
        return { ok: true, message: `Código ${code}: tienes ${def.label}.` };
      },
      boostUnit: (unitId) => {
        const p = get();
        const current = p.units[unitId] ?? {
          strength: 0.4,
          lastPracticedAt: null,
          completedLessonIds: [],
        };
        set({
          units: {
            ...p.units,
            [unitId]: {
              ...current,
              strength: 1,
              lastPracticedAt: new Date().toISOString(),
            },
          },
        });
      },
      resetProgress: () => {
        const name = get().displayName;
        const palette = get().palette;
        const theme = get().theme;
        const soundEnabled = get().soundEnabled;
        set({
          ...defaultProgress(),
          displayName: name,
          palette,
          theme,
          soundEnabled,
          hydrated: true,
        });
      },
      saveJobDraft: (projectId, code) => {
        const current = get().jobProjects ?? {};
        const prev = current[projectId] ?? emptyJobProgress();
        set({
          jobProjects: {
            ...current,
            [projectId]: { ...prev, draftCode: code, introSeen: true },
          },
        });
      },
      useJobHint: (projectId) => {
        const project = getJobProject(projectId);
        if (!project) return { ok: false, hint: null, charged: 0 };
        const hints = hintsFor(project);
        const current = get().jobProjects ?? {};
        const prev = current[projectId] ?? emptyJobProgress();
        if (prev.hintsUsed >= hints.length) {
          return { ok: false, hint: hints[hints.length - 1] ?? null, charged: 0 };
        }
        const remaining = projectPayout(project, prev.hintsUsed);
        if (!prev.completed && remaining < project.hintCostUsd) {
          return { ok: false, hint: null, charged: 0 };
        }
        const hint = hints[prev.hintsUsed] ?? null;
        const charged = prev.completed ? 0 : project.hintCostUsd;
        set({
          jobProjects: {
            ...current,
            [projectId]: {
              ...prev,
              hintsUsed: prev.hintsUsed + 1,
              introSeen: true,
            },
          },
        });
        return { ok: true, hint, charged };
      },
      completeJobProject: (projectId, artifact) => {
        const project = getJobProject(projectId);
        if (!project) return { ok: false, paid: 0 };
        const current = get().jobProjects ?? {};
        const prev = current[projectId] ?? emptyJobProgress();
        const paid = prev.completed ? prev.paidUsd : projectPayout(project, prev.hintsUsed);
        const code = artifact?.code || prev.draftCode || project.starterCode;
        if (!prev.completed && looksIncomplete(code, project.starterCode)) {
          return { ok: false, paid: 0 };
        }
        const entry: PortfolioItem = {
          id: `job-${project.id}`,
          source: "job",
          title: project.title,
          description: project.summary,
          code,
          stdout: trimStdout(artifact?.stdout),
          image: trimImage(artifact?.image),
          company: project.company,
          jobId: project.id,
          createdAt: Date.now(),
        };
        const portfolio = upsertJobPortfolio(get().portfolio ?? [], entry);
        if (prev.completed) {
          set({ portfolio });
          return { ok: true, paid: prev.paidUsd };
        }
        set({
          jobUsd: (get().jobUsd ?? 0) + paid,
          xp: get().xp + 40,
          jobProjects: {
            ...current,
            [projectId]: {
              ...prev,
              completed: true,
              paidUsd: paid,
              draftCode: code,
              introSeen: true,
              failCount: 0,
            },
          },
          portfolio,
        });
        return { ok: true, paid };
      },
      addLabPortfolio: ({ title, description, code, stdout, image }) => {
        const name = title.trim();
        const body = code.trim();
        if (!name || !body) return false;
        const item: PortfolioItem = {
          id: `lab-${Date.now()}`,
          source: "lab",
          title: name,
          description: description.trim() || "Pieza del laboratorio",
          code: body,
          stdout: trimStdout(stdout),
          image: trimImage(image),
          createdAt: Date.now(),
        };
        set({ portfolio: [item, ...(get().portfolio ?? [])] });
        return true;
      },
      removePortfolioItem: (id) => {
        set({ portfolio: (get().portfolio ?? []).filter((i) => i.id !== id) });
      },
      recordJobFail: (projectId) => {
        const current = get().jobProjects ?? {};
        const prev = current[projectId] ?? emptyJobProgress();
        const failCount = (prev.failCount ?? 0) + 1;
        set({
          jobProjects: {
            ...current,
            [projectId]: { ...prev, failCount, introSeen: true },
          },
        });
        return failCount;
      },
      resetJobProject: (projectId) => {
        const current = get().jobProjects ?? {};
        if (!(projectId in current)) return;
        const next = { ...current };
        delete next[projectId];
        set({ jobProjects: next });
      },
    }),
    {
      name: "pyquest-progress-v1",
      partialize: (state) => {
        const skip = new Set([
          "hydrated",
          "setHydrated",
          "refresh",
          "setName",
          "completeOnboarding",
          "setTheme",
          "setPalette",
          "loseHeart",
          "refillHearts",
          "buyHeartWithSalary",
          "buyFreeze",
          "buyFreezeWithSalary",
          "completeLesson",
          "applyPlacement",
          "unlockPracticeHearts",
          "addLegendaryScore",
          "setSound",
          "restoreHeart",
          "boostUnit",
          "resetProgress",
          "redeemCode",
          "saveJobDraft",
          "useJobHint",
          "completeJobProject",
          "recordJobFail",
          "resetJobProject",
          "addLabPortfolio",
          "removePortfolioItem",
        ]);
        return Object.fromEntries(
          Object.entries(state).filter(([key]) => !skip.has(key))
        ) as UserProgress;
      },
      version: 6,
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as UserProgress;
        const base: UserProgress = {
          ...p,
          palette: p.palette ?? (p.theme === "dark" ? "night" : DEFAULT_PALETTE),
          jobUsd: p.jobUsd ?? 0,
          jobProjects: p.jobProjects ?? {},
          portfolio: p.portfolio ?? [],
          unlockAll: Boolean(p.unlockAll) || (p.redeemedCodes ?? []).includes(FULL_UNLOCK_CODE),
          redeemedCodes: p.redeemedCodes ?? [],
        };
        if (version < 2) {
          return { ...base, onboarded: true, placementDone: true };
        }
        return base;
      },
      onRehydrateStorage: () => (state) => {
        if (state && !Array.isArray(state.redeemedCodes)) state.redeemedCodes = [];
        if (state && !state.palette) state.palette = DEFAULT_PALETTE;
        if (state && typeof state.jobUsd !== "number") state.jobUsd = 0;
        if (state && (!state.jobProjects || typeof state.jobProjects !== "object")) {
          state.jobProjects = {};
        }
        if (state && !Array.isArray(state.portfolio)) state.portfolio = [];
        if (state && (state.unlockAll || (state.redeemedCodes ?? []).includes(FULL_UNLOCK_CODE))) {
          state.unlockAll = true;
          const last = UNITS[UNITS.length - 1];
          if (last) state.startingUnitId = last.id;
        } else if (state && typeof state.unlockAll !== "boolean") {
          state.unlockAll = false;
        }
        if (state) {
          state.onboarded = true;
          state.placementDone = true;
          const have = new Set((state.portfolio ?? []).filter((i) => i.jobId).map((i) => i.jobId));
          for (const [id, job] of Object.entries(state.jobProjects ?? {})) {
            if (!job.completed || have.has(id)) continue;
            const project = getJobProject(id);
            if (!project) continue;
            state.portfolio = [
              {
                id: `job-${id}`,
                source: "job",
                title: project.title,
                description: project.summary,
                code: job.draftCode || project.starterCode,
                company: project.company,
                jobId: id,
                createdAt: Date.now(),
              },
              ...(state.portfolio ?? []),
            ];
          }
        }
        state?.setHydrated();
        state?.refresh();
      },
    }
  )
);

export function continueLessonId(progress: UserProgress): string | null {
  let startIdx = 0;
  for (let i = UNITS.length - 1; i >= 0; i--) {
    const done = progress.units[UNITS[i].id]?.completedLessonIds ?? [];
    if (done.length > 0) {
      startIdx = i;
      break;
    }
  }
  for (let i = startIdx; i < UNITS.length; i++) {
    const unit = UNITS[i];
    if (!isUnitUnlocked(unit.id, progress)) continue;
    const done = progress.units[unit.id]?.completedLessonIds ?? [];
    const next = unit.lessons.find((l) => !done.includes(l.id));
    if (next) return next.id;
  }
  return null;
}

export function continueUnitId(progress: UserProgress): string | null {
  const lessonId = continueLessonId(progress);
  if (!lessonId) return null;
  return getUnitByLessonId(lessonId)?.id ?? null;
}

export function isUnitUnlocked(unitId: string, progress: UserProgress): boolean {
  if (hasFullUnlock(progress)) return true;
  const unit = UNITS.find((u) => u.id === unitId);
  if (!unit) return false;
  const start = UNITS.find((u) => u.id === progress.startingUnitId)?.index ?? 1;
  if (unit.index <= start) return true;
  const prev = UNITS.find((u) => u.index === unit.index - 1);
  if (!prev) return true;
  const prevProg = progress.units[prev.id];
  if (!prevProg) return false;
  return coreLessons(prev).every((l) => prevProg.completedLessonIds.includes(l.id));
}

export function nextHeartLabel(ms: number) {
  const m = Math.ceil(ms / 60000);
  return m <= 1 ? "1 min" : `${m} min`;
}

export function mockLeague(weeklyXp: number, name: string, league: LeagueId) {
  const bots = [
    { name: "Luna", xp: 42 },
    { name: "Mateo", xp: 110 },
    { name: "Sofía", xp: 175 },
    { name: "Kai", xp: 230 },
    { name: "Noa", xp: 88 },
    { name: "Ari", xp: 310 },
    { name: "Valen", xp: 64 },
    { name: "Iris", xp: 401 },
    { name: "Leo", xp: 19 },
    { name: "Mila", xp: 268 },
    { name: "Theo", xp: 145 },
    { name: "Cata", xp: 355 },
  ];
  const seed = league.length + weeklyXp;
  const rows = bots.map((b, i) => ({
    name: b.name,
    xp: Math.max(5, Math.round(b.xp * (0.6 + ((seed + i) % 7) / 10))),
    isYou: false,
  }));
  rows.push({ name, xp: weeklyXp, isYou: true });
  return rows.sort((a, b) => b.xp - a.xp);
}

export { todayKey };
