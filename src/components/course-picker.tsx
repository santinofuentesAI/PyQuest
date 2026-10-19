"use client";

import Link from "next/link";
import { Check, Lock, Sparkles } from "lucide-react";
import { COURSE_CATALOG, formatCoursePrice, ownsCourse } from "@/lib/courses";
import { useProgress } from "@/lib/progress-store";
import { UnitIcon } from "@/components/unit-icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CourseId } from "@/lib/types";

export function CoursePicker({
  onChoose,
  compact = false,
}: {
  onChoose?: (id: CourseId) => void;
  compact?: boolean;
}) {
  const progress = useProgress();
  const active = progress.activeCourseId ?? "python-ia";

  return (
    <ul className={cn("grid gap-3", compact ? "sm:grid-cols-3" : "lg:grid-cols-3")}>
      {COURSE_CATALOG.map((course) => {
        const owned = ownsCourse(progress, course.id);
        const current = active === course.id;
        return (
          <li key={course.id}>
            <button
              type="button"
              onClick={() => {
                progress.setActiveCourse(course.id);
                onChoose?.(course.id);
              }}
              aria-pressed={current}
              className={cn(
                "quest-card flex h-full w-full flex-col rounded-2xl p-4 text-left",
                current && "quest-current border-primary/50"
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span
                  className="flex size-10 items-center justify-center rounded-2xl text-white"
                  style={{ background: course.accent }}
                >
                  <UnitIcon name={course.icon} className="size-5" />
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                  {course.kicker}
                </span>
              </span>
              <p className="mt-3 text-base font-extrabold">{course.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{course.tagline}</p>
              {!compact && (
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {course.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              <span className="mt-4 flex items-center justify-between text-xs font-bold">
                <span>
                  {owned ? (
                    <span className="text-emerald-600">Desbloqueado</span>
                  ) : (
                    <span>
                      {course.freeUnitCount} {course.freeUnitCount === 1 ? "tema gratis" : "temas gratis"}
                      {" · "}
                      {formatCoursePrice(course.priceUsd)}
                    </span>
                  )}
                </span>
                {current ? <Sparkles className="size-4 text-primary" /> : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function CourseUnlockCard({ courseId }: { courseId: CourseId }) {
  const progress = useProgress();
  const course = COURSE_CATALOG.find((c) => c.id === courseId)!;
  const owned = ownsCourse(progress, courseId);

  if (owned) {
    return (
      <div className="rounded-2xl border bg-card p-4">
        <p className="text-sm font-bold">Este curso ya está desbloqueado en este dispositivo.</p>
        <Link href="/learn" className={cn(buttonVariants(), "mt-3 h-11 rounded-xl font-bold")}>
          Ir al mapa
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="text-[10px] font-bold tracking-widest text-primary uppercase">Pago único</p>
      <h2 className="mt-1 text-lg font-extrabold">
        {course.title} · {formatCoursePrice(course.priceUsd)}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Sin suscripción. {course.freeUnitCount === 1 ? "El primer tema es gratis" : `Los primeros ${course.freeUnitCount} temas son gratis`}.
        El cobro con tarjeta llegará después; aquí el desbloqueo queda en este dispositivo.
      </p>
      <button
        type="button"
        className={cn(buttonVariants(), "mt-4 h-11 w-full rounded-xl font-bold")}
        onClick={() => progress.unlockCourse(courseId)}
      >
        Desbloquear {formatCoursePrice(course.priceUsd)}
      </button>
      <p className="mt-2 text-xs text-muted-foreground">También puedes canjear un código en Perfil (IA25, DATOS25, AGENTES25).</p>
    </div>
  );
}

export function SchoolLicenseCard() {
  const progress = useProgress();
  const sent = Boolean(progress.schoolInterestAt);

  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="text-[10px] font-bold tracking-widest text-primary uppercase">Colegios y bootcamps</p>
      <h2 className="mt-1 text-lg font-extrabold">Licencia por estudiante</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Otro monto, por plaza, sin publicidad en clase. Deja tu interés aquí; no pedimos tarjeta.
      </p>
      {sent ? (
        <p className="mt-3 text-sm font-semibold text-emerald-600">Listo. Cuando cerremos collabs y plazas, usamos este dispositivo como aviso local.</p>
      ) : (
        <button
          type="button"
          className={cn(buttonVariants({ variant: "outline" }), "mt-4 h-11 w-full rounded-xl font-bold")}
          onClick={() => progress.registerSchoolInterest()}
        >
          Me interesa para un grupo
        </button>
      )}
    </div>
  );
}

export function PaywallNote({ courseId }: { courseId: CourseId }) {
  const course = COURSE_CATALOG.find((c) => c.id === courseId)!;
  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <Lock className="mx-auto size-8 text-primary" />
      <h1 className="font-heading mt-4 text-2xl font-bold">Sigue con {course.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Este tema está incluido en el pago único de {formatCoursePrice(course.priceUsd)}. Los primeros módulos siguen gratis.
      </p>
      <div className="mt-6 text-left">
        <CourseUnlockCard courseId={courseId} />
      </div>
      <Link href="/courses" className="mt-4 inline-block text-sm font-semibold text-muted-foreground">
        Ver todos los cursos
      </Link>
    </div>
  );
}
