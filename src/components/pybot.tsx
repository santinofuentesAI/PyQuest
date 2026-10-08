"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export type PybotMood = "wave" | "happy" | "thinking" | "celebrate" | "encourage";

const imageSizes = { xs: "36px", sm: "64px", md: "96px", lg: "160px", xl: "(min-width: 640px) 256px, 208px" };

/** Reference-faithful 2D artwork with CSS motion that honors reduced-motion. */
export function Pybot({ mood = "happy", size = "md", className, decorative = true }: {
  mood?: PybotMood;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  decorative?: boolean;
}) {
  return (
    <div data-mood={mood} className={cn("pybot relative shrink-0", { xs: "size-9", sm: "size-16", md: "size-24", lg: "size-40", xl: "size-52 sm:size-64" }[size], className)}>
      <div className="pybot-float size-full">
        <Image
          src="/pybot-reference-2d.png"
          width={1254}
          height={1254}
          sizes={imageSizes[size]}
          loading={size === "xs" ? "eager" : "lazy"}
          alt={decorative ? "" : "Pybot, tu compañero de Python"}
          aria-hidden={decorative ? true : undefined}
          className="size-full object-contain select-none"
          draggable={false}
        />
      </div>
      {mood === "celebrate" ? <span className="pybot-sparkles pointer-events-none absolute inset-0" aria-hidden="true"><span className="absolute top-[15%] left-0 text-lg text-amber-400">✦</span><span className="absolute top-[35%] right-0 text-sm text-amber-400">✦</span></span> : null}
    </div>
  );
}

export function PybotCoach({ children, mood = "encourage", title = "Pybot", className }: {
  children: React.ReactNode; mood?: PybotMood; title?: string; className?: string;
}) {
  return <div className={cn("pybot-coach flex items-center gap-3 rounded-2xl border bg-card p-3 sm:p-4", className)}>
    <Pybot mood={mood} size="sm" />
    <div className="min-w-0"><p className="mb-1 text-[10px] font-extrabold tracking-[.16em] text-primary uppercase">{title}</p><div className="text-sm leading-relaxed">{children}</div></div>
  </div>;
}
