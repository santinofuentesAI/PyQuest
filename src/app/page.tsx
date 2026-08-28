"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Heart, Sparkles, Terminal } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(6,182,212,0.18),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(244,63,94,0.12),transparent_40%)]" />
      <div className="relative mx-auto flex min-h-[100dvh] max-w-3xl flex-col justify-center px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-widest text-primary uppercase">
            <Sparkles className="size-3.5" />
            Laboratorio Python en el navegador
          </p>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            De <span className="text-primary">print(&quot;hola&quot;)</span> a tu primer modelo. En lecciones de 8 minutos.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            PyQuest es un camino gamificado de Python para análisis de datos e IA. Sin instalar nada: NumPy, Pandas y
            Matplotlib corren aquí mismo, con corazones, rachas y un árbol de habilidades.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/learn" className={cn(buttonVariants({ size: "lg" }), "h-14 rounded-2xl px-8 text-base font-bold")}>
              Ir al mapa
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/playground"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-14 rounded-2xl px-8 text-base font-bold")}
            >
              Probar el laboratorio
            </Link>
          </div>
          <ul className="grid gap-3 pt-6 sm:grid-cols-3">
            <Feature icon={<Heart className="size-4 fill-current" />} title="5 corazones" text="Una vida menos por error. Se recargan con el tiempo o en práctica." />
            <Feature icon={<Flame className="size-4" />} title="Racha diaria" text="Congelador de racha si un día se complica." />
            <Feature icon={<Terminal className="size-4" />} title="Código de verdad" text="Pyodide ejecuta tu Python. Sin backend obligatorio." />
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <li className="rounded-2xl border bg-card/80 p-4 shadow-sm">
      <p className="flex items-center gap-2 font-bold text-primary">
        {icon}
        {title}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </li>
  );
}
