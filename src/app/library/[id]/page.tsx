"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Dumbbell, Play } from "lucide-react";
import { getLibraryArticle, LIBRARY } from "@/lib/library";
import { getSectionForUnit, getUnit } from "@/lib/curriculum";
import { LibraryBlocks } from "@/components/library-blocks";
import { LibraryWorkshop } from "@/components/library-workshop";
import { UnitIcon } from "@/components/unit-icon";
import { Button } from "@/components/ui/button";

export default function LibraryArticlePage() {
  const params = useParams<{ id: string }>();
  const article = getLibraryArticle(params.id);
  const unit = article ? getUnit(article.unitId) : undefined;
  const idx = LIBRARY.findIndex((a) => a.id === params.id);
  const prev = idx > 0 ? LIBRARY[idx - 1] : null;
  const next = idx >= 0 && idx < LIBRARY.length - 1 ? LIBRARY[idx + 1] : null;

  if (!article) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold">Esa ficha no está</h1>
        <Button className="mt-4" render={<Link href="/library" />}>
          Volver a la librería
        </Button>
      </div>
    );
  }

  const lessonId = unit?.lessons[0]?.id;
  const section = unit ? getSectionForUnit(unit.id) : undefined;
  const accent = section?.color ?? "#7c3aed";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-24">
      <Link href="/library" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
        <ArrowLeft className="size-4" />
        Librería
      </Link>
      <header
        className="mt-4 overflow-hidden rounded-3xl border p-5 sm:p-6"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, ${accent} 22%, var(--card)), var(--card) 70%)`,
          borderColor: `color-mix(in oklab, ${accent} 35%, var(--border))`,
        }}
      >
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md" style={{ background: accent }}>
            <UnitIcon name={unit?.icon} className="size-7" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accent }}>
              {article.kicker}
              {section ? ` · ${section.title}` : ""}
            </p>
            <h1 className="font-heading mt-1 text-3xl font-extrabold">{article.title}</h1>
            <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
              <Clock className="size-4" />
              {article.minutes} min · ejemplos ejecutables · práctica libre
            </p>
          </div>
        </div>
      </header>

      <div className="mt-6 max-w-3xl">
        <LibraryBlocks blocks={article.blocks} />
      </div>
      {unit && <LibraryWorkshop key={unit.id} unit={unit} />}

      <div className="mt-8 grid gap-2">
        {lessonId && (
          <Button className="h-12 rounded-2xl font-bold" render={<Link href={`/lesson/${lessonId}`} />}>
            <Play className="size-4" />
            Practicar este tema
          </Button>
        )}
        {unit && (
          <Button variant="outline" className="h-12 rounded-2xl font-bold" render={<Link href={`/unit/${unit.id}`} />}>
            <Dumbbell className="size-4" />
            Ir a la unidad
          </Button>
        )}
      </div>

      <div className="mt-8 flex justify-between gap-3 text-sm font-semibold">
        {prev ? (
          <Link href={`/library/${prev.id}`} className="flex min-w-0 items-center gap-1 text-primary">
            <ArrowLeft className="size-4 shrink-0" />
            <span className="truncate">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/library/${next.id}`} className="flex min-w-0 items-center justify-end gap-1 text-right text-primary">
            <span className="truncate">{next.title}</span>
            <ArrowRight className="size-4 shrink-0" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
