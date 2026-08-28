"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Gem, Heart, Star, Zap } from "lucide-react";
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
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Zap className="size-4" />
          </span>
          <span className="hidden sm:inline">PyQuest</span>
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
            icon={<Flame className="size-4 fill-orange-500 text-orange-500" />}
            value={String(progress.streak)}
            label={`Racha de ${progress.streak} día${progress.streak === 1 ? "" : "s"}`}
            className="text-orange-600 dark:text-orange-400"
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
