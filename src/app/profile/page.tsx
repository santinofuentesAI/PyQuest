"use client";

import { useState } from "react";
import { useProgress } from "@/lib/progress-store";
import { levelFromXp, leagueTitle } from "@/lib/gamification";
import { BADGES } from "@/lib/curriculum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const p = useProgress();
  const lvl = levelFromXp(p.xp);
  const [code, setCode] = useState("");

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-24">
      <h1 className="font-heading text-3xl font-extrabold">{p.displayName}</h1>
      <p className="text-muted-foreground">
        Nivel {lvl.level} · {p.xp} XP · Liga {leagueTitle(p.league)}
      </p>

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
        <h2 className="font-bold">Apariencia y sonido</h2>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm">Modo oscuro forzado</span>
          <Switch checked={p.theme === "dark"} onCheckedChange={(c) => p.setTheme(c ? "dark" : "system")} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm">Sonidos de acierto</span>
          <Switch checked={p.soundEnabled !== false} onCheckedChange={(c) => p.setSound(c)} />
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
