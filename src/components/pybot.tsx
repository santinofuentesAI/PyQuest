"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export type PybotMood = "wave" | "happy" | "thinking" | "celebrate" | "encourage";

/** Original vector mascot. Motion is CSS-only and honors reduced-motion. */
export function Pybot({ mood = "happy", size = "md", className, decorative = true }: {
  mood?: PybotMood;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  decorative?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <div data-mood={mood} className={cn("pybot shrink-0", { xs: "size-9", sm: "size-16", md: "size-24", lg: "size-40", xl: "size-52 sm:size-64" }[size], className)}>
      <svg viewBox="0 0 200 200" fill="none" aria-hidden={decorative ? true : undefined} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : "Pybot, tu compañero de Python"}>
        <defs>
          <linearGradient id={`${id}-shell`} x1="60" y1="40" x2="160" y2="150" gradientUnits="userSpaceOnUse"><stop stopColor="#d7fff4" /><stop offset=".5" stopColor="#64e4c1" /><stop offset="1" stopColor="#23bda4" /></linearGradient>
          <linearGradient id={`${id}-visor`} x1="45" y1="55" x2="155" y2="105" gradientUnits="userSpaceOnUse"><stop stopColor="#223653" /><stop offset="1" stopColor="#122238" /></linearGradient>
        </defs>
        <ellipse className="pybot-shadow" cx="100" cy="180" rx="47" ry="9" fill="#132e40" fillOpacity=".10" />
        <g className="pybot-float">
          <path d="M99 43V28" stroke="#319e94" strokeWidth="5" strokeLinecap="round" />
          <circle className="pybot-signal" cx="99" cy="24" r="8" fill="#ffd55f" stroke="#edb934" strokeWidth="3" />
          <rect x="63" y="125" width="73" height="40" rx="19" fill={`url(#${id}-shell)`} stroke="#279e8b" strokeWidth="2" />
          <rect x="70" y="157" width="23" height="13" rx="6" fill="#22415b" />
          <rect x="107" y="157" width="23" height="13" rx="6" fill="#22415b" />
          <g className="pybot-arm-left"><path d="M66 137L45 146" stroke="#54d8b7" strokeWidth="13" strokeLinecap="round" /><circle cx="43" cy="147" r="9" fill="#a0f4db" stroke="#279e8b" strokeWidth="2" /></g>
          <g className="pybot-arm-right"><path d="M133 138L157 122" stroke="#54d8b7" strokeWidth="13" strokeLinecap="round" /><rect x="150" y="105" width="19" height="25" rx="9" transform="rotate(18 159 117)" fill="#a0f4db" stroke="#279e8b" strokeWidth="2" /></g>
          <rect x="32" y="70" width="12" height="29" rx="6" fill="#239f8d" /><rect x="157" y="70" width="12" height="29" rx="6" fill="#239f8d" />
          <rect x="40" y="41" width="121" height="90" rx="31" fill={`url(#${id}-shell)`} stroke="#279e8b" strokeWidth="2" />
          <path d="M56 58C62 50 74 48 92 48" stroke="white" strokeOpacity=".8" strokeWidth="5" strokeLinecap="round" />
          <rect x="50" y="57" width="101" height="59" rx="23" fill={`url(#${id}-visor)`} />
          <g className="pybot-eyes">
            {mood === "celebrate" || mood === "happy" ? <><path d="M69 80Q76 69 83 80M117 80Q124 69 131 80" stroke="#a2ffe1" strokeWidth="6" strokeLinecap="round" /></> : <><rect x="72" y="72" width="9" height={mood === "thinking" ? "13" : "16"} rx="4.5" fill="#a2ffe1" /><rect x="120" y="72" width="9" height="16" rx="4.5" fill="#a2ffe1" /></>}
          </g>
          <path d={mood === "thinking" ? "M95 97H105" : "M91 94Q100 103 109 94"} stroke="#a2ffe1" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="65" cy="94" rx="6" ry="3" fill="#fa9faf" fillOpacity=".5" /><ellipse cx="137" cy="94" rx="6" ry="3" fill="#fa9faf" fillOpacity=".5" />
          <path d="M89 138L83 143L89 148M112 138L118 143L112 148" stroke="#20546a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><path d="M103 136L97 150" stroke="#20546a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="144" cy="121" r="4" fill="#ffd55f" />
        </g>
        {mood === "celebrate" ? <g className="pybot-sparkles" stroke="#e8af26" strokeWidth="3" strokeLinecap="round"><path d="M24 42V56M17 49H31M174 51V61M169 56H179M24 120V130M19 125H29" /></g> : null}
      </svg>
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
