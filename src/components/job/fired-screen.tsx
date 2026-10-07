"use client";

import { Button } from "@/components/ui/button";
import { Pybot } from "@/components/pybot";

export function FiredScreen({
  projectTitle,
  onRetry,
  onBack,
}: {
  projectTitle: string;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <div className="quest-hero relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <Pybot mood="encourage" size="xl" />
      <p className="relative z-10 quest-kicker">Una pausa para entender</p>
      <h1 className="relative z-10 mt-4 max-w-2xl font-heading text-3xl font-extrabold leading-tight sm:text-4xl">
        Revisemos este encargo juntos.
      </h1>
      <p className="relative z-10 mt-4 max-w-lg text-sm text-muted-foreground">
        Tu código de {projectTitle} está guardado. Vuelve a él, revisa las pistas y prueba un cambio a la vez. Puedes seguir intentándolo.
      </p>
      <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-2">
        <Button className="h-12 rounded-2xl px-6 font-bold" onClick={onRetry}>
          Revisar mi código
        </Button>
        <Button variant="secondary" className="h-12 rounded-2xl px-6 font-bold" onClick={onBack}>
          Volver a encargos
        </Button>
      </div>
    </div>
  );
}
