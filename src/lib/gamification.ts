import type { LeagueId, UserProgress } from "./types";

export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 20 * 60 * 1000;
export const STREAK_FREEZE_COST = 40;
export const HEART_REFILL_COST = 80;

export const LEAGUES: { id: LeagueId; title: string; minWeeklyXp: number; color: string }[] = [
  { id: "bronze", title: "Bronce", minWeeklyXp: 0, color: "#c47a3a" },
  { id: "silver", title: "Plata", minWeeklyXp: 80, color: "#8b9bb4" },
  { id: "gold", title: "Oro", minWeeklyXp: 180, color: "#e0b422" },
  { id: "sapphire", title: "Zafiro", minWeeklyXp: 320, color: "#3b82f6" },
  { id: "ruby", title: "Rubí", minWeeklyXp: 500, color: "#e11d48" },
  { id: "diamond", title: "Diamante", minWeeklyXp: 750, color: "#67e8f9" },
];

export function xpForLevel(level: number): number {
  return Math.round(40 * level * (level - 1));
}

export function levelFromXp(xp: number): { level: number; into: number; needed: number } {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level += 1;
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, into: xp - current, needed: next - current };
}

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function weekId(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function yesterdayKey(date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

export function heartSlotLabel(hearts: number) {
  return hearts > MAX_HEARTS ? String(hearts) : `${hearts}/${MAX_HEARTS}`;
}

export function regenerateHearts(progress: UserProgress, now = Date.now()): UserProgress {
  if (progress.hearts >= MAX_HEARTS) {
    return { ...progress, heartsUpdatedAt: now };
  }
  const elapsed = now - progress.heartsUpdatedAt;
  const gained = Math.floor(elapsed / HEART_REGEN_MS);
  if (gained <= 0) return progress;
  const hearts = Math.min(MAX_HEARTS, progress.hearts + gained);
  const leftover = elapsed % HEART_REGEN_MS;
  return {
    ...progress,
    hearts,
    heartsUpdatedAt: hearts >= MAX_HEARTS ? now : now - leftover,
  };
}

export function msUntilNextHeart(progress: UserProgress, now = Date.now()): number {
  if (progress.hearts >= MAX_HEARTS) return 0;
  const elapsed = now - progress.heartsUpdatedAt;
  return Math.max(0, HEART_REGEN_MS - (elapsed % HEART_REGEN_MS));
}

export function applyDailyStreak(progress: UserProgress, now = new Date()): UserProgress {
  const today = todayKey(now);
  if (progress.lastPracticeDate === today) return progress;
  const yesterday = yesterdayKey(now);
  if (progress.lastPracticeDate === yesterday) {
    return { ...progress, streak: progress.streak + 1, lastPracticeDate: today, freezeUsedToday: false };
  }
  if (progress.lastPracticeDate == null) {
    return { ...progress, streak: 1, lastPracticeDate: today, freezeUsedToday: false };
  }
  if (progress.streakFreezes > 0 && !progress.freezeUsedToday) {
    return {
      ...progress,
      streakFreezes: progress.streakFreezes - 1,
      freezeUsedToday: true,
      lastPracticeDate: today,
    };
  }
  return { ...progress, streak: 1, lastPracticeDate: today, freezeUsedToday: false };
}

export function applyWeeklyXp(progress: UserProgress, gained: number, now = new Date()): UserProgress {
  const id = weekId(now);
  const weeklyXp = progress.weekId === id ? progress.weeklyXp + gained : gained;
  const league = [...LEAGUES].reverse().find((l) => weeklyXp >= l.minWeeklyXp)?.id ?? "bronze";
  return { ...progress, weekId: id, weeklyXp, league };
}

export function decayStrength(strength: number, lastPracticedAt: string | null, now = new Date()): number {
  if (!lastPracticedAt) return strength;
  const days = (now.getTime() - new Date(lastPracticedAt).getTime()) / 86400000;
  if (days < 1.5) return strength;
  const decay = Math.min(0.75, (days - 1) * 0.12);
  return Math.max(0.15, strength - decay);
}

export function leagueTitle(id: LeagueId) {
  return LEAGUES.find((l) => l.id === id)?.title ?? "Bronce";
}
