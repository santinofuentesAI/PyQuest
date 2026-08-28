"use client";

import { useProgress } from "@/lib/progress-store";
import { HEART_REFILL_COST, STREAK_FREEZE_COST, MAX_HEARTS } from "@/lib/gamification";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function ShopPage() {
  const p = useProgress();

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-24">
      <h1 className="font-heading text-3xl font-extrabold">Tienda</h1>
      <p className="mt-1 text-muted-foreground">
        Tienes <span className="font-bold text-foreground">{p.gems} gemas</span>. Las ganas al completar lecciones.
      </p>

      <div className="mt-6 grid gap-3">
        <div className="rounded-2xl border bg-card p-4">
          <p className="font-bold">Recarga de corazones</p>
          <p className="text-sm text-muted-foreground">Vuelve a {MAX_HEARTS}/5 ahora mismo.</p>
          <Button
            className="mt-3 h-11 w-full justify-between rounded-xl"
            variant="outline"
            onClick={() => {
              if (p.refillHearts()) toast.success("Corazones recargados");
              else toast.error(`Necesitas ${HEART_REFILL_COST} gemas`);
            }}
          >
            Recargar <span>{HEART_REFILL_COST} 💎</span>
          </Button>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="font-bold">Congelador de racha</p>
          <p className="text-sm text-muted-foreground">
            Si un día no practicas, no rompes la racha. Tienes {p.streakFreezes} listos.
          </p>
          <Button
            className="mt-3 h-11 w-full justify-between rounded-xl"
            variant="outline"
            onClick={() => {
              if (p.buyFreeze()) toast.success("Congelador listo");
              else toast.error(`Necesitas ${STREAK_FREEZE_COST} gemas`);
            }}
          >
            Comprar uno <span>{STREAK_FREEZE_COST} 💎</span>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          También recuperas 1 corazón al <Link href="/learn" className="font-semibold text-primary">repasar una unidad débil</Link>.
        </p>
      </div>
    </div>
  );
}
