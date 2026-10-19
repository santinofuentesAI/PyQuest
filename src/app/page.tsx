"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Sparkles, Terminal } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CoursePicker, SchoolLicenseCard } from "@/components/course-picker";
import { PybotCoach } from "@/components/pybot";
import { formatCoursePrice } from "@/lib/courses";
import { useProgress } from "@/lib/progress-store";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const hydrated = useProgress((s) => s.hydrated);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(6,182,212,0.18),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(244,63,94,0.12),transparent_40%)]" />
      <div className="relative mx-auto max-w-5xl px-5 py-12 pb-28">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-widest text-primary uppercase">
            <Sparkles className="size-3.5" />
            Cursos interactivos · pago único
          </p>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Python, datos y agentes de IA. En el navegador, a profundidad.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Elige un camino. Los primeros módulos son gratis, sin muros a cada clic. El resto es un pago único de{" "}
            {formatCoursePrice()} por curso. Colegios y bootcamps tienen otro monto por estudiante.
          </p>
          <PybotCoach mood="wave">Toca un curso para abrirlo. Las librerías de Python siguen cargándose dentro de la app.</PybotCoach>
          {hydrated ? (
            <CoursePicker onChoose={() => router.push("/learn")} />
          ) : (
            <p className="text-sm text-muted-foreground">Cargando cursos…</p>
          )}
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
          <div className="grid gap-3 pt-2 lg:grid-cols-2">
            <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <Feature icon={<Heart className="size-4 fill-current" />} title="Primeros módulos gratis" text="Entras, practicas y decides. El pago aparece solo al pasar al resto del curso." />
              <Feature icon={<Terminal className="size-4" />} title="Python real en la pestaña" text="NumPy, Pandas y Matplotlib corren aquí. Los agentes se practican con contratos y evals." />
              <Feature icon={<Sparkles className="size-4" />} title="Collabs más adelante" text="Temas con partners, sin cambiar el modelo de un pago por curso." />
            </ul>
            <SchoolLicenseCard />
          </div>
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
