"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getLesson } from "@/lib/curriculum";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ShuffledLesson = dynamic(() => import("@/components/shuffled-lesson"), {
  ssr: false,
  loading: () => <p className="px-6 py-16 text-sm text-muted-foreground">Preparando la lección…</p>,
});

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const lesson = getLesson(params.id);
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
