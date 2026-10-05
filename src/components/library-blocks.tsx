"use client";

import type { LibraryBlock } from "@/content/library";
import { cn } from "@/lib/utils";

export function LibraryBlocks({ blocks }: { blocks: LibraryBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        if (b.type === "h") {
          return (
            <h2 key={i} className="font-heading pt-2 text-xl font-bold">
              {b.text}
            </h2>
          );
        }
        if (b.type === "p") {
          return (
            <p key={i} className="text-[16px] leading-relaxed text-foreground/90">
              {b.text}
            </p>
          );
        }
        if (b.type === "code") {
          return (
            <figure key={i}>
              <pre className="overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-[13px] leading-6 text-zinc-100">
                <code>{b.code}</code>
              </pre>
              {b.caption ? <figcaption className="mt-1.5 text-xs text-muted-foreground">{b.caption}</figcaption> : null}
            </figure>
          );
        }
        if (b.type === "list") {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed">
              {b.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (b.type === "glossary") {
          return (
            <div key={i} className="space-y-3 rounded-2xl border bg-muted/40 px-4 py-3">
              <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Palabras nuevas</p>
              <dl className="space-y-3">
              {b.items.map((item) => (
                <div key={item.term}>
                  <dt className="font-mono text-sm font-bold">{item.term}</dt>
                  <dd className="text-[15px] leading-relaxed text-foreground/90">{item.def}</dd>
                </div>
              ))}
              </dl>
            </div>
          );
        }
        return (
          <p
            key={i}
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm leading-relaxed",
              b.tone === "tip" && "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
              b.tone === "warn" && "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
              b.tone === "idea" && "border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-100",
              b.tone === "zero" && "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100"
            )}
          >
            <span className="mr-1 font-bold">
              {b.tone === "tip"
                ? "Consejo."
                : b.tone === "warn"
                  ? "Cuidado."
                  : b.tone === "zero"
                    ? "Si no sabes nada de esto."
                    : "Idea."}
            </span>
            {b.text}
          </p>
        );
      })}
    </div>
  );
}
