"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProgress } from "@/lib/progress-store";

export default function OnboardingPage() {
  const router = useRouter();
  const setName = useProgress((s) => s.setName);
  const complete = useProgress((s) => s.completeOnboarding);
  const onboarded = useProgress((s) => s.onboarded);
  const placementDone = useProgress((s) => s.placementDone);
  const hydrated = useProgress((s) => s.hydrated);
  const [name, setLocal] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!hydrated) return;
    if (onboarded && placementDone) router.replace("/learn");
    else if (onboarded && !placementDone) router.replace("/placement");
  }, [hydrated, onboarded, placementDone, router]);

  const slides = [
    {
      kicker: "Bienvenida",
      title: "No hace falta que sepas programar",
      body: "Empezamos por variables y print. Si ya vienes de DataCamp, el test de nivel te salta hasta NumPy.",
    },
    {
      kicker: "Laboratorio",
      title: "Python vive en tu pestaña",
      body: "Pyodide (WebAssembly) ejecuta NumPy, Pandas y Matplotlib sin instalar Anaconda. Un worker evita que la UI se congele, con tope de 8 segundos.",
    },
    {
      kicker: "Juego",
      title: "Corazones, XP y racha",
      body: "Cinco vidas por sesión. Cada acierto suma XP. Practica un rato cada día: el congelador protege tu racha.",
    },
  ];

  if (step < slides.length) {
    const s = slides[step];
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-6 py-12">
        <p className="text-xs font-bold tracking-widest text-primary uppercase">{s.kicker}</p>
        <h1 className="font-heading mt-2 text-3xl font-extrabold">{s.title}</h1>
        <p className="mt-3 text-muted-foreground">{s.body}</p>
        <Button className="mt-8 h-12 rounded-2xl font-bold" onClick={() => setStep(step + 1)}>
          Siguiente
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-6 py-12">
      <p className="text-xs font-bold tracking-widest text-primary uppercase">Tu perfil</p>
      <h1 className="font-heading mt-2 text-3xl font-extrabold">¿Cómo te llamamos en el ranking?</h1>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setName(name.trim() || "Explorador");
          complete();
          router.push("/placement");
        }}
      >
        <Input
          value={name}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="p. ej. Mara"
          className="h-12 rounded-2xl text-base"
          autoFocus
        />
        <Button type="submit" className="h-12 w-full rounded-2xl font-bold">
          Ir al test de nivel
        </Button>
        <button
          type="button"
          className="w-full text-sm font-semibold text-muted-foreground"
          onClick={() => {
            setName("Explorador");
            complete();
            router.push("/learn");
          }}
        >
          Saltar el test y empezar desde cero
        </button>
      </form>
    </div>
  );
}
