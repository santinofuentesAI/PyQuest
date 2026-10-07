"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Search, Sparkles } from "lucide-react";
import { librarySections } from "@/lib/library";
import { getUnit } from "@/lib/curriculum";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UnitIcon } from "@/components/unit-icon";
import { PybotCoach } from "@/components/pybot";
import { cn } from "@/lib/utils";
import type { LibraryBlock } from "@/content/library";

function blurb(blocks: LibraryBlock[]): string {
  const paragraph = blocks.find((b) => b.type === "p");
  const text = paragraph && "text" in paragraph ? paragraph.text : "";
  return text.length > 120 ? `${text.slice(0, 117).trimEnd()}…` : text;
}

export default function LibraryPage() {
  const sections = librarySections();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!query) return sections;
    return sections
      .map((s) => ({
        ...s,
        articles: s.articles.filter((a) => {
          const blob = [
            a.title,
            a.kicker,
            ...a.blocks.flatMap((b) => {
              if ("text" in b) return [b.text];
              if (b.type === "code") return [b.code, b.caption ?? ""];
              if (b.type === "list") return b.items;
              if (b.type === "glossary") return b.items.flatMap((x) => [x.term, x.def]);
              return [];
            }),
          ]
            .join(" ")
            .toLowerCase();
          return blob.includes(query);
        }),
      }))
      .filter((s) => s.articles.length > 0);
  }, [sections, query]);

  const total = sections.reduce((n, s) => n + s.articles.length, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28">
      <section
        className="overflow-hidden rounded-3xl border p-5 shadow-sm sm:p-7"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, #7c3aed 22%, var(--card)) 0%, color-mix(in oklab, #06b6d4 16%, var(--card)) 55%, var(--card) 100%)",
        }}
      >
        <p className="text-xs font-bold tracking-widest text-violet-700 uppercase dark:text-violet-300">Guía visual</p>
        <h1 className="font-heading mt-1 flex items-center gap-3 text-3xl font-extrabold">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md">
            <BookOpen className="size-6" />
          </span>
          Librería
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {total} fichas para aprender Python desde cero. Cada tema trae explicación, ejemplo ejecutable y práctica
          libre, sin gastar corazones.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-violet-600 px-3 py-1 text-white">{sections.length} secciones</span>
          <span className="rounded-full bg-cyan-600 px-3 py-1 text-white">{total} temas</span>
          <span className="rounded-full bg-amber-400 px-3 py-1 text-amber-950">Sin corazones</span>
        </div>
        <Link
          href="/playground"
          className={cn(buttonVariants(), "mt-5 h-11 rounded-2xl bg-violet-600 font-bold text-white hover:bg-violet-500")}
        >
          <Sparkles className="size-4" />
          Probar en el laboratorio
        </Link>
      </section>
      <PybotCoach className="mt-5" mood="thinking">Lee, cambia un dato y ejecuta. No memorices el ejemplo: descubre qué pasa cuando lo transformas.</PybotCoach>

      <label className="relative mt-6 block">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar: listas, media, overfitting…"
          aria-label="Buscar en la biblioteca"
          className="h-12 rounded-2xl pl-9"
        />
      </label>

      {filtered.length === 0 && (
        <p className="mt-8 rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Nada coincide. Prueba con “pandas” o “bucle”.
        </p>
      )}

      {filtered.map((section) => (
        <section key={section.id} className="mt-8">
          <div
            className="mb-3 flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
            style={{ background: `color-mix(in oklab, ${section.color} 16%, var(--card))` }}
          >
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: section.color }}>
                {section.title}
              </p>
              <p className="text-sm text-muted-foreground">{section.subtitle}</p>
            </div>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-xs font-black text-white"
              style={{ background: section.color }}
            >
              {section.articles.length}
            </span>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {section.articles.map((article) => {
              const icon = getUnit(article.unitId)?.icon;
              return (
                <li key={article.id}>
                  <Link
                    href={`/library/${article.id}`}
                    className="group flex h-full flex-col rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      background: `linear-gradient(165deg, color-mix(in oklab, ${section.color} 14%, var(--card)) 0%, var(--card) 58%)`,
                      borderColor: `color-mix(in oklab, ${section.color} 32%, var(--border))`,
                    }}
                  >
                    <span className="flex items-start gap-3">
                      <span
                        className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                        style={{ background: section.color }}
                      >
                        <UnitIcon name={icon} className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="font-heading block font-bold leading-tight">{article.title}</span>
                        <span className="mt-1 flex items-center gap-1 text-xs font-semibold" style={{ color: section.color }}>
                          <Clock className="size-3" />
                          {article.minutes} min · {article.kicker}
                        </span>
                      </span>
                    </span>
                    <span className="mt-3 block flex-1 text-sm leading-snug text-muted-foreground">{blurb(article.blocks)}</span>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold" style={{ color: section.color }}>
                      Leer ficha
                      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
