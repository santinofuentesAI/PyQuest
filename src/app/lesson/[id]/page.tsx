"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getCourseIdForUnit, getLesson, getUnitByLessonId } from "@/lib/curriculum";
import { unitAccess } from "@/lib/courses";
import { PaywallNote } from "@/components/course-picker";
import { useProgress } from "@/lib/progress-store";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ShuffledLesson = dynamic(() => import("@/components/shuffled-lesson"), {
  ssr: false,
  loading: () => <p className="px-6 py-16 text-sm text-muted-foreground">Preparando la lección…</p>,
});

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const progress = useProgress();
  const lesson = getLesson(params.id);
  const unit = lesson ? getUnitByLessonId(lesson.id) : undefined;
  if (!progress.hydrated) {
    return <p className="px-6 py-16 text-sm text-muted-foreground">Cargando…</p>;
  }
  if (unit && unitAccess(unit.id, progress) === "paywall") {
    return <PaywallNote courseId={getCourseIdForUnit(unit.id) ?? "python-ia"} />;
  }
  if (!lesson) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold">Lección no encontrada</h1>
        <Button className="mt-4" render={<Link href="/learn" />}>
          Volver al mapa
        </Button>
      </div>
    );
  }
  return <ShuffledLesson lesson={lesson} />;
}
