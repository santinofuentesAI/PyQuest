"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { getUnit } from "@/lib/curriculum";
import { canSkipToUnit } from "@/lib/skip-exam";
import { isUnitUnlocked, useProgress } from "@/lib/progress-store";
import { Button } from "@/components/ui/button";

const SkipExamPlayer = dynamic(
  () => import("@/components/skip-exam-player").then((m) => ({ default: m.SkipExamPlayer })),
  { ssr: false, loading: () => <p className="px-6 py-16 text-sm text-muted-foreground">Preparando el examen de salto…</p> }
);

export default function SkipExamPage() {
  const params = useParams<{ unitId: string }>();
  const progress = useProgress();
  const unit = getUnit(params.unitId);

  if (!unit) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="font-heading text-2xl font-extrabold">Módulo no encontrado</h1>
        <Button className="mt-4 h-12 rounded-2xl font-bold" render={<Link href="/learn" />}>
          Volver al mapa
        </Button>
      </div>
    );
  }

  if (!progress.hydrated) {
    return <p className="px-6 py-16 text-sm text-muted-foreground">Cargando…</p>;
  }

  if (isUnitUnlocked(unit.id, progress)) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="font-heading text-2xl font-extrabold">Este tema ya está abierto</h1>
        <Button className="mt-4 h-12 rounded-2xl font-bold" render={<Link href={`/unit/${unit.id}`} />}>
          Ir al módulo
        </Button>
      </div>
    );
  }

  if (!canSkipToUnit(unit.id, progress)) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="font-heading text-2xl font-extrabold">No puedes saltar aquí todavía</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          El examen abre temas de tu curso que aún no alcanzaste. Completa el camino o desbloquea el curso si este módulo es de pago.
        </p>
        <Button className="mt-4 h-12 rounded-2xl font-bold" render={<Link href="/learn" />}>
          Volver al mapa
        </Button>
      </div>
    );
  }

  return <SkipExamPlayer unit={unit} />;
}
