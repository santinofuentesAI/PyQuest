"use client";

import { useProgress, mockLeague } from "@/lib/progress-store";
import { leagueTitle } from "@/lib/gamification";
import { cn } from "@/lib/utils";

export default function LeaguePage() {
  const name = useProgress((s) => s.displayName);
  const weeklyXp = useProgress((s) => s.weeklyXp);
  const league = useProgress((s) => s.league);
  const rows = mockLeague(weeklyXp, name, league);
  const you = rows.findIndex((r) => r.isYou) + 1;

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-24">
      <p className="text-xs font-bold tracking-widest text-primary uppercase">Liga semanal</p>
      <h1 className="font-heading mt-1 text-3xl font-extrabold">Liga {leagueTitle(league)}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Vas el {you}º esta semana con {weeklyXp} XP. Los 3 primeros ascienden; los 3 últimos bajan (en la versión con
        cuentas reales).
      </p>
      <ol className="mt-6 space-y-2">
        {rows.map((row, i) => (
          <li
            key={row.name + i}
            className={cn(
              "flex items-center justify-between rounded-2xl border px-4 py-3",
              row.isYou && "border-primary bg-primary/10 font-bold",
              i < 3 && !row.isYou && "border-amber-300/60"
            )}
          >
            <span className="flex items-center gap-3">
              <span className="w-6 tabular-nums text-muted-foreground">{i + 1}</span>
              {row.name}
              {row.isYou && <span className="text-xs text-primary">tú</span>}
            </span>
            <span className="tabular-nums">{row.xp} XP</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
