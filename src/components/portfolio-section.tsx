"use client";

import { useState } from "react";
import { Briefcase, Copy, FlaskConical, FolderKanban, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PortfolioItem } from "@/lib/types";
import { useProgress } from "@/lib/progress-store";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Código copiado");
  } catch {
    toast.error("No se pudo copiar");
  }
}

function Piece({
  item,
  onRemove,
}: {
  item: PortfolioItem;
  onRemove?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-xl border bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
            {item.source === "job" ? <Briefcase className="size-3" /> : <FlaskConical className="size-3" />}
            {item.source === "job" ? item.company || "Oficina" : "Laboratorio"}
          </p>
          <p className="font-heading font-bold leading-tight">{item.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 rounded-lg"
            onClick={() => copyText(item.code)}
          >
            <Copy className="size-3.5" />
            Copiar
          </Button>
          {onRemove ? (
            <Button type="button" size="icon-sm" variant="ghost" onClick={onRemove} aria-label="Quitar">
              <Trash2 className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        className="mt-2 text-xs font-semibold text-primary"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Ocultar código" : "Ver código"}
      </button>
      {open && (
        <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100">
          {item.code}
        </pre>
      )}
      {item.stdout && open && (
        <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-zinc-900 p-2 text-[11px] text-emerald-300">
          {item.stdout}
        </pre>
      )}
      {item.image && open && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`Figura de ${item.title}`}
          src={item.image.startsWith("data:") ? item.image : `data:image/png;base64,${item.image}`}
          className="mt-2 max-h-48 rounded-lg border"
        />
      )}
    </li>
  );
}

export function PortfolioSection() {
  const portfolio = useProgress((s) => s.portfolio) ?? [];
  const addLab = useProgress((s) => s.addLabPortfolio);
  const remove = useProgress((s) => s.removePortfolioItem);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");

  const jobs = portfolio.filter((i) => i.source === "job");
  const labs = portfolio.filter((i) => i.source === "lab");

  function saveManual() {
    if (!addLab({ title, description, code })) {
      toast.error("Ponle un nombre y pega el código.");
      return;
    }
    toast.success("Guardado en el portafolio");
    setTitle("");
    setDescription("");
    setCode("");
    setAdding(false);
  }

  return (
    <section className="mt-6 rounded-2xl border bg-card p-4">
      <h2 className="flex items-center gap-2 font-bold">
        <span className="inline-flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FolderKanban className="size-4" />
        </span>
        Portafolio
      </h2>
      <p className="text-sm text-muted-foreground">
        Encargos que aceptó el jefe y piezas que pegaste desde el laboratorio. Copia el código para tu CV o un repo.
      </p>

      {jobs.length === 0 && labs.length === 0 && !adding && (
        <p className="mt-3 rounded-xl border border-dashed px-3 py-4 text-sm text-muted-foreground">
          Todavía no hay nada. Entrega un encargo en Proyectos o pega código del Laboratorio.
        </p>
      )}

      {jobs.length > 0 && (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Briefcase className="size-3.5" />
            Oficina
          </p>
          <ul className="mt-2 space-y-2">
            {jobs.map((item) => (
              <Piece key={item.id} item={item} />
            ))}
          </ul>
        </div>
      )}

      {labs.length > 0 && (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <FlaskConical className="size-3.5" />
            Laboratorio
          </p>
          <ul className="mt-2 space-y-2">
            {labs.map((item) => (
              <Piece key={item.id} item={item} onRemove={() => remove(item.id)} />
            ))}
          </ul>
        </div>
      )}

      {adding ? (
        <div className="mt-4 space-y-2 rounded-xl border bg-muted/40 p-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nombre del proyecto"
            className="h-10 rounded-xl"
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción corta"
            className="h-10 rounded-xl"
          />
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Pega aquí el código del laboratorio…"
            rows={8}
            className="w-full rounded-xl border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex gap-2">
            <Button className="h-10 rounded-xl font-bold" onClick={saveManual}>
              Guardar
            </Button>
            <Button variant="ghost" className="h-10 rounded-xl" onClick={() => setAdding(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="mt-4 h-10 rounded-xl font-bold"
          onClick={() => setAdding(true)}
        >
          <Plus className="size-4" />
          Pegar código del laboratorio
        </Button>
      )}
    </section>
  );
}
