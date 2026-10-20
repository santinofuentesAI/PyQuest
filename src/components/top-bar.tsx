"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gem, Heart, Star } from "lucide-react";
import { Pybot } from "@/components/pybot";
import { useProgress } from "@/lib/progress-store";
import { HEART_REGEN_MS, MAX_HEARTS, heartSlotLabel, levelFromXp, msUntilNextHeart } from "@/lib/gamification";
import { isImmersivePath } from "@/lib/chrome";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function TopBar() {
  const progress = useProgress();
  const pathname = usePathname();
  const hide = isImmersivePath(pathname);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (hide) return;
    const t = setInterval(() => {
      setNow(Date.now());
      progress.refresh();
    }, 15000);
    return () => clearInterval(t);
  }, [hide, progress]);

  if (hide) return null;

  const lvl = levelFromXp(progress.xp);
  const until = msUntilNextHeart({ ...progress, heartsUpdatedAt: progress.heartsUpdatedAt }, now);
  const pct = Math.min(100, Math.round((lvl.into / Math.max(1, lvl.needed)) * 100));

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-3">
        <Link href="/learn" className="flex items-center gap-2 font-heading text-base font-bold tracking-tight">
          <Pybot size="xs" />
          <span>PyQuest<span className="hidden text-primary sm:inline">.</span></span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Meter
            href="/shop"
            icon={<Heart className="size-4 fill-rose-500 text-rose-500" />}
            value={heartSlotLabel(progress.hearts)}
            label={
              progress.hearts < MAX_HEARTS
                ? `Siguiente corazón en ${Math.max(1, Math.ceil(until / 60000))} min · recarga en la tienda`
                : "Corazones llenos"
            }
            className="text-rose-600 dark:text-rose-400"
          />
          <Meter
            href="/shop"
            icon={<Gem className="size-4 text-cyan-600 dark:text-cyan-400" />}
            value={String(progress.gems)}
            label="Gemas · abrir tienda"
            className="text-cyan-700 dark:text-cyan-300"
          />
          <Meter
            icon={<StreakFlame />}
            value={String(progress.streak)}
            label={`Racha de ${progress.streak} día${progress.streak === 1 ? "" : "s"}. Vuelve mañana para mantenerla.`}
            className={cn("streak-meter text-orange-600 dark:text-orange-400", progress.streak > 0 && "streak-live")}
          />
          <Meter
            icon={<Star className="size-4 fill-amber-400 text-amber-500" />}
            value={`${progress.xp} XP`}
            label={`Nivel ${lvl.level} · ${pct}% hacia el siguiente`}
            className="hidden text-amber-700 sm:inline-flex dark:text-amber-300"
          />
        </div>
      </div>
      <div className="h-1 bg-muted">
        <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </header>
  );
}

function StreakFlame() {
  return (
    <svg viewBox="0 0 16 16" className="streak-flame size-4 overflow-visible" aria-hidden>
      <path className="streak-flame-outer" d="M8 1.1C8 1.1 3.8 5.4 3.8 9.2C3.8 11.8 5.6 14 8 14C10.4 14 12.2 11.8 12.2 9.2C12.2 5.4 8 1.1 8 1.1Z" fill="#f97316" />
      <path className="streak-flame-mid" d="M8 4.8C8 4.8 5.8 7.3 5.8 9.4C5.8 10.9 6.8 12 8 12C9.2 12 10.2 10.9 10.2 9.4C10.2 7.3 8 4.8 8 4.8Z" fill="#fb923c" />
      <path className="streak-flame-core" d="M8 8.4c-.9.8-1.3 1.5-1.3 2.2 0 .9.6 1.5 1.3 1.5s1.3-.6 1.3-1.5c0-.7-.4-1.4-1.3-2.2Z" fill="#fde68a" />
      <circle className="streak-ember" cx="6.2" cy="5.5" r=".7" fill="#fde68a" />
    </svg>
  );
}

function Meter({
  icon,
  value,
  label,
  className,
  href,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  className?: string;
  href?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={href ? <Link href={href} /> : <button type="button" />}
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-full bg-muted/80 px-2.5 text-sm font-bold tabular-nums",
          className
        )}
      >
        {icon}
        <span>{value}</span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export { HEART_REGEN_MS };
