"use client";

import { CoursePicker, CourseUnlockCard, SchoolLicenseCard } from "@/components/course-picker";
import { PybotCoach } from "@/components/pybot";
import { COURSE_CATALOG, formatCoursePrice } from "@/lib/courses";
import { useProgress } from "@/lib/progress-store";
import { useRouter } from "next/navigation";

export default function CoursesPage() {
  const router = useRouter();
  const active = useProgress((s) => s.activeCourseId) ?? "python-ia";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-28">
      <p className="text-xs font-bold tracking-widest text-primary uppercase">Cursos</p>
      <h1 className="font-heading mt-1 text-3xl font-extrabold">Elige un camino</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        PyQuest escala por curso: Python para IA, análisis de datos, y agentes (MCP, skills, harness).
        Cada uno se paga una sola vez ({formatCoursePrice()}), con los primeros módulos gratis. Sin muros a cada clic.
      </p>
      <PybotCoach className="mt-5" mood="wave">
        Toca un curso para abrirlo en el mapa. El primero de cada ruta se puede estudiar ya.
      </PybotCoach>
      <div className="mt-6">
        <CoursePicker onChoose={() => router.push("/learn")} />
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <CourseUnlockCard courseId={active} />
        <SchoolLicenseCard />
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Más adelante: collabs en temas puntuales. {COURSE_CATALOG.map((c) => c.title).join(" · ")}.
      </p>
    </div>
  );
}
