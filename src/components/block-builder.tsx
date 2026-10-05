"use client";

import { useState } from "react";
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, ArrowRight, GripVertical, X } from "lucide-react";
import type { Exercise } from "@/lib/types";
import type { UserAnswer } from "@/lib/validators";
import { shuffle } from "@/lib/practice";
import { Button } from "@/components/ui/button";

type Block = { id: string; code: string };
function Piece({ block, index, count, token, move, remove }: { block: Block; index: number; count: number; token: boolean; move: (from: number, to: number) => void; remove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }} className={`flex min-w-0 items-center gap-1 rounded-xl border bg-zinc-950 p-1 text-zinc-100 ${token ? "" : "w-full"}`}>
    <button type="button" {...attributes} {...listeners} aria-label={`Arrastrar pieza ${index + 1}`} className="min-h-10 min-w-8 touch-none rounded-lg text-zinc-400"><GripVertical className="mx-auto size-4" /></button>
    <code className="min-w-0 flex-1 whitespace-pre-wrap px-1 text-sm">{block.code}</code>
    <button type="button" aria-label={`Mover pieza ${index + 1} antes`} disabled={index === 0} onClick={() => move(index, index - 1)} className="min-h-10 min-w-8 rounded-lg disabled:opacity-20"><ArrowLeft className="mx-auto size-3" /></button>
    <button type="button" aria-label={`Mover pieza ${index + 1} después`} disabled={index === count - 1} onClick={() => move(index, index + 1)} className="min-h-10 min-w-8 rounded-lg disabled:opacity-20"><ArrowRight className="mx-auto size-3" /></button>
    <button type="button" aria-label={`Quitar pieza ${index + 1}`} onClick={() => remove(block.id)} className="min-h-10 min-w-8 rounded-lg text-rose-300"><X className="mx-auto size-4" /></button>
  </div>;
}

export function BlockBuilder({ exercise, onSubmit }: { exercise: Exercise; onSubmit: (a: UserAnswer) => void }) {
  const [pool] = useState(() => shuffle(exercise.blocks ?? []));
  const [picked, setPicked] = useState<Block[]>([]);
  const token = exercise.type === "token_order";
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 8 } }), useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const available = pool.filter((b) => !picked.some((p) => p.id === b.id));
  function dragEnd(e: DragEndEvent) {
    if (e.over && e.active.id !== e.over.id) setPicked((rows) => arrayMove(rows, rows.findIndex((b) => b.id === e.active.id), rows.findIndex((b) => b.id === e.over?.id)));
  }
  return <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit({ type: "order", ids: picked.map((b) => b.id) }); }}>
    <p className="text-sm text-muted-foreground">Toca las piezas para añadirlas. Arrástralas por el asa o usa las flechas para cambiar el orden.</p>
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}>
      <SortableContext items={picked.map((b) => b.id)} strategy={rectSortingStrategy}>
        <div aria-label="Código construido" className={`min-h-24 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-3 ${token ? "flex flex-wrap content-start gap-2" : "space-y-2"}`}>
          {!picked.length && <p className="p-3 text-sm text-muted-foreground">Construye {token ? "la expresión" : "el programa"} aquí.</p>}
          {picked.map((b, i) => <Piece key={b.id} block={b} index={i} count={picked.length} token={token} move={(from, to) => setPicked((rows) => arrayMove(rows, from, to))} remove={(id) => setPicked((rows) => rows.filter((b) => b.id !== id))} />)}
        </div>
      </SortableContext>
    </DndContext>
    {token && picked.length > 0 && <pre aria-label="Vista previa" className="overflow-x-auto rounded-xl bg-zinc-950 p-3 font-mono text-sm text-cyan-100">{picked.map((b) => b.code).join("")}</pre>}
    <div className={token ? "flex flex-wrap gap-2" : "space-y-2"} aria-label="Piezas disponibles">
      {available.map((b) => <button key={b.id} type="button" onClick={() => setPicked((rows) => [...rows, b])} className={`min-h-12 rounded-xl border bg-card px-4 py-3 text-left font-mono text-sm hover:border-primary ${token ? "" : "block w-full whitespace-pre-wrap"}`}>{b.code}</button>)}
    </div>
    <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{picked.length}/{pool.length} piezas</span><button type="button" onClick={() => setPicked([])} className="min-h-10 px-3 font-semibold text-primary">Reiniciar</button></div>
    <Button type="submit" disabled={picked.length !== pool.length} className="h-12 w-full rounded-2xl font-bold">Comprobar</Button>
  </form>;
}
