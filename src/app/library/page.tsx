"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Search, Sparkles } from "lucide-react";
import { librarySections } from "@/lib/library";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
    <div className="mx-auto max-w-5xl px-4 py-8 pb-24">
      <p className="text-xs font-bold tracking-widest text-primary uppercase">Guía visual</p>
      <h1 className="font-heading mt-1 flex items-center gap-2 text-3xl font-extrabold">
        <BookOpen className="size-8 text-primary" />
        Librería
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Guías desde cero de los {total} temas del camino. No hace falta haber programado: cada ficha explica las
        conceptos y te permite ejecutar ejemplos y resolver ejercicios sin gastar corazones.
      </p>
      <Link
        href="/playground"
        className={cn(buttonVariants({ variant: "outline" }), "mt-4 h-11 w-full rounded-2xl font-bold")}
      >
        <Sparkles className="size-4" />
        Probar en el laboratorio
      </Link>

      <label className="relative mt-6 block">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar: listas, media, overfitting…"
          aria-label="Buscar en la biblioteca"
          className="h-11 rounded-2xl pl-9"
        />
      </label>

      {filtered.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">Nada coincide. Prueba con “pandas” o “bucle”.</p>
      )}

      {filtered.map((section) => (
        <section key={section.id} className="mt-8">
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: section.color }}>
            {section.title}
          </p>
          <p className="text-sm text-muted-foreground">{section.subtitle}</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {section.articles.map((article) => (
              <li key={article.id}>
                <Link
                  href={`/library/${article.id}`}
                  className="block rounded-2xl border bg-card p-4 shadow-sm hover:border-primary/40"
                >
                  <span className="font-heading block font-bold leading-tight">{article.title}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {article.kicker} · {article.minutes} min de lectura
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
