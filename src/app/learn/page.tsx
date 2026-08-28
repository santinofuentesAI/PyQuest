"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SkillTree } from "@/components/skill-tree";

function LearnInner() {
  const params = useSearchParams();
  const placed = params.get("placed") ?? undefined;
  return <SkillTree highlight={placed ?? undefined} />;
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Cargando mapa…</div>}>
      <LearnInner />
    </Suspense>
  );
}
