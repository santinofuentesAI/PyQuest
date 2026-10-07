"use client";

import Link from "next/link";
import { ArrowRight, Code2, FileCode2, FolderOpen } from "lucide-react";
import { Pybot } from "@/components/pybot";
import { buttonVariants } from "@/components/ui/button";
import { useProgress } from "@/lib/progress-store";
import { cn } from "@/lib/utils";

export default function PlaygroundPage() {
  const draft = useProgress((progress) => progress.labDraft);
  const hydrated = useProgress((progress) => progress.hydrated);
  return <div className="mx-auto max-w-3xl px-4 pt-6 pb-28 sm:px-6">
    <div className="flex items-center justify-between gap-3"><h1 className="text-2xl font-extrabold tracking-tight">Laboratorio</h1><Pybot size="xs" mood="wave" /></div>
    <section className="quest-card mt-5 overflow-hidden rounded-3xl p-5 sm:p-7" aria-labelledby="build-heading">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Code2 className="size-6" /></span>
      <h2 id="build-heading" className="mt-4 text-2xl font-extrabold">Construye con Python</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">Un espacio para escribir, ejecutar y probar tus ideas. Entra al editor y concéntrate en tu código.</p>
      <div className="mt-5 rounded-2xl border bg-muted/30 p-4">
        <p className="flex items-center gap-2 text-sm font-bold"><FileCode2 className="size-4 text-primary" />script.py</p>
        <p className="mt-2 text-xs text-muted-foreground">{hydrated && draft?.trim() ? "Tu borrador está listo para continuar." : "Empieza con un ejemplo que puedes transformar."}</p>
      </div>
      <Link href="/playground/editor" className={cn(buttonVariants(), "mt-5 h-12 w-full rounded-2xl font-bold sm:w-auto sm:px-7")}>Construir<ArrowRight className="size-4" /></Link>
      <p className="mt-3 text-xs text-muted-foreground">Copia el código o guárdalo en tu portafolio con un toque.</p>
    </section>
    <Link href="/profile#portfolio" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary"><FolderOpen className="size-4" />Ver mi portafolio<ArrowRight className="size-4" /></Link>
  </div>;
}
