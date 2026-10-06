"use client";

import { Button } from "@/components/ui/button";

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
    <div className="bridge-fired relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center text-zinc-100">
      <div className="bridge-rain" aria-hidden>
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} style={{ left: `${(i * 53) % 100}%`, animationDelay: `${(i % 7) * 0.18}s` }} />
        ))}
      </div>
      <p className="relative z-10 text-xs font-bold tracking-[0.25em] text-rose-400 uppercase">Despedido</p>
      <h1 className="relative z-10 mt-4 max-w-2xl font-heading text-3xl font-extrabold leading-tight sm:text-4xl">
        Tu jefe vio tu trabajo mal hecho, te despidió y estás viviendo en un puente…
      </h1>
      <p className="relative z-10 mt-4 max-w-lg text-sm text-zinc-400">
        Solo se reinicia este encargo ({projectTitle}). El mapa, el XP y el resto de proyectos siguen igual.
      </p>
      <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-2">
        <Button className="h-12 rounded-2xl px-6 font-bold" onClick={onRetry}>
          Reintentar este encargo
        </Button>
        <Button variant="secondary" className="h-12 rounded-2xl px-6 font-bold" onClick={onBack}>
          Volver a encargos
        </Button>
      </div>
    </div>
  );
}
