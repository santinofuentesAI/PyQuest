"use client";

import { cn } from "@/lib/utils";

export type PybotMood = "wave" | "happy" | "thinking" | "celebrate" | "encourage";

/** Original vector mascot. Motion is CSS-only and honors reduced-motion. */
export function Pybot({ mood = "happy", size = "md", className, decorative = true }: {
  mood?: PybotMood;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  decorative?: boolean;
}) {
  return (
    <div data-mood={mood} className={cn("pybot shrink-0", { xs: "size-9", sm: "size-16", md: "size-24", lg: "size-40", xl: "size-52 sm:size-64" }[size], className)}>
      <svg viewBox="0 0 200 200" fill="none" aria-hidden={decorative ? true : undefined} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : "Pybot, tu compañero de Python"}>
        <ellipse className="pybot-shadow" cx="100" cy="190" rx="43" ry="5" fill="#132e40" fillOpacity=".12" />
        <g className="pybot-float">
          {/* Mint boots, rounded torso and articulated arms share a flat palette. */}
          <rect x="75" y="168" width="20" height="15" rx="5" fill="#43bfa1" stroke="#218b79" strokeWidth="2" />
          <rect x="105" y="168" width="20" height="15" rx="5" fill="#43bfa1" stroke="#218b79" strokeWidth="2" />
          <path d="M75 179H93L95 185Q95 190 88 190H75Q69 190 71 184Z" fill="#70dfba" stroke="#218b79" strokeWidth="2" />
          <path d="M107 179H125L129 184Q131 190 124 190H111Q105 190 105 185Z" fill="#70dfba" stroke="#218b79" strokeWidth="2" />
          <g className="pybot-arm-left">
            <circle cx="135" cy="143" r="9" fill="#167d70" />
            <path d="M141 143Q153 151 155 164L143 169Q140 157 131 151Z" fill="#67d9b7" stroke="#218b79" strokeWidth="2" strokeLinejoin="round" />
            <path d="M146 165Q157 162 159 170L158 178Q156 185 151 180L149 175Q147 183 143 180Q138 177 141 170Z" fill="#258d7d" stroke="#166c62" strokeWidth="2" />
          </g>
          <g className="pybot-arm-right">
            <circle cx="65" cy="143" r="9" fill="#167d70" />
            <path d="M66 136L53 123L36 132Q41 148 57 152Z" fill="#67d9b7" stroke="#218b79" strokeWidth="2" strokeLinejoin="round" />
            <path d="M36 132Q26 127 24 117L23 111Q23 107 27 107Q30 107 32 113L29 101Q29 97 33 97Q37 97 39 105L39 96Q39 92 43 93Q47 94 46 104L48 102Q52 100 54 104Q56 111 50 116L47 124Q43 131 36 132Z" fill="#258d7d" stroke="#166c62" strokeWidth="2" strokeLinejoin="round" />
            <path d="M33 113L36 119M41 108L42 115" stroke="#66ceac" strokeWidth="2" strokeLinecap="round" />
          </g>
          <path d="M72 129Q100 124 128 129L136 157Q139 177 116 179H84Q61 177 64 157Z" fill="#73dfbb" stroke="#218b79" strokeWidth="2" />
          <path d="M66 164Q100 171 134 164L132 170Q126 179 112 179H87Q72 178 67 171Z" fill="#43bfa1" />
          <path d="M82 140L71 150L82 160M118 140L129 150L118 160M106 136L94 164" stroke="#1d3b4c" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Broad rounded head, ear pods and the reference's yellow antenna. */}
          <path d="M97 39L98 25H103L104 39" fill="#258d7d" stroke="#166c62" strokeWidth="2" />
          <circle className="pybot-signal" cx="101" cy="18" r="10" fill="#ffd34f" stroke="#e5af25" strokeWidth="2" />
          <circle cx="98" cy="15" r="3" fill="#fff4b4" />
          <rect x="35" y="70" width="17" height="39" rx="8" fill="#35ad94" stroke="#218b79" strokeWidth="2" />
          <rect x="148" y="70" width="17" height="39" rx="8" fill="#35ad94" stroke="#218b79" strokeWidth="2" />
          <path d="M43 76V102M157 76V102" stroke="#74dfbc" strokeWidth="3" strokeLinecap="round" />
          <rect x="44" y="37" width="112" height="99" rx="35" fill="#83ebc7" stroke="#218b79" strokeWidth="2" />
          <path d="M47 109Q49 133 79 133H122Q149 133 153 109L150 119Q144 127 123 127H78Q57 127 50 117Z" fill="#43bfa1" />
          <path d="M59 57Q66 44 88 44H111" stroke="#d8fff0" strokeWidth="4" strokeLinecap="round" />
          <rect x="54" y="54" width="92" height="69" rx="26" fill="#152c40" stroke="#0f2132" strokeWidth="2" />
          <path d="M63 73Q67 61 82 61" stroke="#30495d" strokeWidth="4" strokeLinecap="round" />
          <g className="pybot-eyes">
            {mood === "celebrate" ? <path d="M72 85Q78 74 84 85M116 85Q122 74 128 85" stroke="#a5ffe1" strokeWidth="5" strokeLinecap="round" /> : <><rect x="73" y={mood === "thinking" ? 79 : 75} width="11" height={mood === "thinking" ? 14 : 20} rx="5.5" fill="#a5ffe1" /><rect x="116" y="75" width="11" height="20" rx="5.5" fill="#a5ffe1" /></>}
          </g>
          <ellipse cx="67" cy="100" rx="6" ry="3.5" fill="#ee91a5" /><ellipse cx="133" cy="100" rx="6" ry="3.5" fill="#ee91a5" />
          <path d={mood === "thinking" ? "M95 106H105" : "M89 102Q100 115 111 102"} stroke="#a5ffe1" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="138" cy="126" r="4.5" fill="#ffd34f" stroke="#e5af25" strokeWidth="1.5" />
        </g>
        {mood === "celebrate" ? <g className="pybot-sparkles" stroke="#e8af26" strokeWidth="2.5" strokeLinejoin="round"><path d="M24 40L27 47L34 50L27 53L24 60L21 53L14 50L21 47ZM174 48L176 54L182 56L176 58L174 64L172 58L166 56L172 54ZM174 121L177 128L184 131L177 134L174 141L171 134L164 131L171 128Z" /></g> : null}
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
