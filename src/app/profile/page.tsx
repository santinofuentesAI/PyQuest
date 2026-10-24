"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress-store";
import { levelFromXp } from "@/lib/gamification";
import { BADGES, getUnit } from "@/lib/curriculum";
import { howToEarn } from "@/lib/badges";
import { UnitIcon } from "@/components/unit-icon";
import { PALETTES, DEFAULT_PALETTE } from "@/lib/palettes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PortfolioSection } from "@/components/portfolio-section";
import { toast } from "sonner";
import { Volume2 } from "lucide-react";
import { AiSettings } from "@/components/ai-settings";
import { spanishVoices, speakSpanish } from "@/lib/speech";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PybotCoach } from "@/components/pybot";

export default function ProfilePage() {
  const p = useProgress();
  const router = useRouter();
  const lvl = levelFromXp(p.xp);
  const [code, setCode] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const currentPalette = p.palette ?? DEFAULT_PALETTE;
  useEffect(() => {
    const load = () => setVoices(spanishVoices());
    load();
    window.speechSynthesis?.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", load);
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-24">
      <h1 className="font-heading text-3xl font-extrabold">{p.displayName}</h1>
      <p className="text-muted-foreground">
        Nivel {lvl.level} · {p.xp} XP · Oficina ${p.jobUsd ?? 0}
      </p>
      <PybotCoach className="mt-5" mood="celebrate" title="Mira lo que has construido">Tu aprendizaje se convierte en proyectos. Cambia de curso cuando quieras: cada ruta guarda su progreso.</PybotCoach>

      <section className="mt-6 rounded-2xl border bg-card p-4">
        <h2 className="font-bold">Cursos</h2>
        <p className="text-sm text-muted-foreground">
          Activo: {p.activeCourseId === "python-datos" ? "Python para análisis de datos" : p.activeCourseId === "agentes-ia" ? "Agentes de IA" : "Python para IA"}.
        </p>
        <Button className="mt-3 h-11 w-full rounded-xl" variant="outline" render={<Link href="/courses" />}>
          Cambiar de curso
        </Button>
      </section>

      <section className="mt-8 rounded-2xl border bg-card p-4">
        <h2 className="font-bold">Códigos</h2>
        <p className="text-sm text-muted-foreground">
          Si tienes un código de recompensa, canjéalo aquí. Cada código solo funciona una vez en este dispositivo.
        </p>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const result = p.redeemCode(code);
            if (result.ok) {
              toast.success(result.message);
              setCode("");
              if (result.openMap) router.push("/learn");
            } else {
              toast.error(result.message);
            }
          }}
        >
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Escribe el código"
            className="h-11 rounded-xl font-mono uppercase"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
          />
          <Button type="submit" className="h-11 shrink-0 rounded-xl font-bold">
            Canjear
          </Button>
        </form>
        {(p.redeemedCodes ?? []).length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Canjeados: {(p.redeemedCodes ?? []).join(", ")}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-4">
        <h2 className="font-bold">Tienda</h2>
        <p className="text-sm text-muted-foreground">Tienes {p.gems} gemas · {p.hearts} corazones.</p>
        <Button className="mt-3 h-11 w-full rounded-xl" variant="outline" render={<Link href="/shop" />}>
          Abrir tienda
        </Button>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-4">
        <h2 className="font-bold">Ajustes</h2>
        <p className="text-sm text-muted-foreground">Color de toda la app. Negro es OLED, casi sin grises.</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PALETTES.map((pal) => {
            const selected = currentPalette === pal.id;
            return (
              <button
                key={pal.id}
                type="button"
                onClick={() => p.setPalette(pal.id)}
                aria-pressed={selected}
                className={cn(
                  "rounded-2xl border-2 p-3 text-left transition",
                  selected
                    ? "border-primary ring-2 ring-primary/25"
                    : "border-border hover:border-primary/40"
                )}
              >
                <span className="flex gap-1" aria-hidden>
                  {pal.swatches.map((c) => (
                    <span
                      key={c}
                      className="size-5 rounded-full border border-black/10 dark:border-white/15"
                      style={{ background: c }}
                    />
                  ))}
                </span>
                <p className="mt-2 text-sm font-bold">{pal.name}</p>
                <p className="text-xs text-muted-foreground">{pal.hint}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <span className="text-sm">Sonidos de acierto</span>
          <Switch checked={p.soundEnabled !== false} onCheckedChange={(c) => p.setSound(c)} />
        </div>
        <div className="mt-4 border-t pt-3">
          <p className="text-sm font-bold">Voz</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Pybot lee en voz alta con una voz en español de este dispositivo. Si hay una de Latinoamérica, esa queda primero.</p>
          {voices.length === 0 ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Aquí no apareció ninguna voz en español. En el teléfono o en la computadora sí se pueden elegir.</p> : null}
          <select
            className="mt-3 h-11 w-full rounded-xl border bg-background px-3 text-sm"
            value={p.voiceURI ?? ""}
            onChange={(e) => p.setVoice(e.target.value || null)}
            aria-label="Voz de Pybot"
          >
            <option value="">La primera voz latina disponible</option>
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} · {voice.lang}
              </option>
            ))}
          </select>
          <Button type="button" variant="outline" className="mt-3 h-11 w-full rounded-xl" onClick={() => speakSpanish("Hola. Soy Pybot. Te leo las insignias cuando quieras.", p.voiceURI)}>
            <Volume2 className="size-4" />
            Probar voz
          </Button>
        </div>
        <AiSettings />
      </section>

      <PortfolioSection />

      <section className="mt-6">
        <h2 className="font-bold">Insignias</h2>
        <p className="mt-1 text-sm text-muted-foreground">Cada medalla dice cómo se logra.</p>
        <ul className="mt-3 grid grid-cols-2 gap-3">
          {BADGES.map((b) => {
            const earned = p.badges.includes(b.id);
            const how = howToEarn(b, typeof b.value === "string" ? getUnit(b.value)?.title : undefined);
            return (
              <li key={b.id} className={cn("flex flex-col rounded-3xl border p-3 text-sm", earned ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40" : "bg-card")}>
                <span className={cn("mx-auto flex size-14 items-center justify-center rounded-full border-4", earned ? "border-amber-400 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200" : "border-muted bg-muted text-muted-foreground")}>
                  <UnitIcon name={b.icon} className="size-6" />
                </span>
                <p className="mt-2 text-center font-extrabold">{b.title}</p>
                <p className="mt-2 text-[10px] font-bold tracking-wider text-primary uppercase">Cómo se logra</p>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{how}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-8 text-center text-sm">
        <Link href="/library" className="font-semibold text-primary">
          Abrir la librería
        </Link>
        {" · "}
        <Link href="/playground" className="font-semibold text-primary">
          Laboratorio libre
        </Link>
      </p>
      <button
        type="button"
        className="mt-6 w-full text-xs text-muted-foreground underline"
        onClick={() => {
          p.resetProgress();
          toast.message("Progreso reiniciado");
        }}
      >
        Reiniciar progreso de este dispositivo
      </button>
    </div>
  );
}
