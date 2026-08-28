"use client";

import { useProgress } from "@/lib/progress-store";
import { HEART_REFILL_COST, STREAK_FREEZE_COST, levelFromXp, leagueTitle, MAX_HEARTS } from "@/lib/gamification";
import { BADGES } from "@/lib/curriculum";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const p = useProgress();
  const lvl = levelFromXp(p.xp);

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-24">
      <h1 className="font-heading text-3xl font-extrabold">{p.displayName}</h1>
      <p className="text-muted-foreground">
        Nivel {lvl.level} · {p.xp} XP · Liga {leagueTitle(p.league)}
      </p>

      <section className="mt-8 rounded-2xl border bg-card p-4">
        <h2 className="font-bold">Tienda</h2>
        <p className="text-sm text-muted-foreground">Tienes {p.gems} gemas.</p>
        <div className="mt-3 grid gap-2">
          <Button
            variant="outline"
            className="h-11 justify-between rounded-xl"
            onClick={() => {
              if (p.refillHearts()) toast.success("Corazones recargados");
              else toast.error(`Necesitas ${HEART_REFILL_COST} gemas`);
            }}
          >
            Recargar {MAX_HEARTS} corazones <span>{HEART_REFILL_COST} 💎</span>
          </Button>
          <Button
            variant="outline"
            className="h-11 justify-between rounded-xl"
            onClick={() => {
              if (p.buyFreeze()) toast.success("Congelador listo");
              else toast.error(`Necesitas ${STREAK_FREEZE_COST} gemas`);
            }}
          >
            Congelador de racha ({p.streakFreezes} listos) <span>{STREAK_FREEZE_COST} 💎</span>
          </Button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-4">
        <h2 className="font-bold">Apariencia</h2>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm">Modo oscuro forzado</span>
          <Switch checked={p.theme === "dark"} onCheckedChange={(c) => p.setTheme(c ? "dark" : "system")} />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-bold">Insignias</h2>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {BADGES.map((b) => {
            const earned = p.badges.includes(b.id);
            return (
              <li
                key={b.id}
                className={`rounded-2xl border p-3 text-sm ${earned ? "bg-amber-50 dark:bg-amber-950/40" : "opacity-50"}`}
              >
                <p className="font-bold">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.description}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-8 text-center text-sm">
        <Link href="/playground" className="font-semibold text-primary">
          Abrir laboratorio libre
        </Link>
      </p>
    </div>
  );
}
