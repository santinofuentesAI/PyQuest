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
        articles: s.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(query) ||
            a.kicker.toLowerCase().includes(query) ||
            a.blocks.some((b) => "text" in b && String(b.text).toLowerCase().includes(query))
        ),
      }))
      .filter((s) => s.articles.length > 0);
  }, [sections, query]);

  const total = sections.reduce((n, s) => n + s.articles.length, 0);

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-24">
      <p className="text-xs font-bold tracking-widest text-primary uppercase">Guía visual</p>
      <h1 className="font-heading mt-1 flex items-center gap-2 text-3xl font-extrabold">
        <BookOpen className="size-8 text-primary" />
        Librería
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Lecturas cortas de los {total} temas del camino: variables, operadores, NumPy, Pandas, modelos y más. Para
        profundizar cuando un ejercicio no alcanza.
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
          <ul className="mt-3 space-y-2">
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
