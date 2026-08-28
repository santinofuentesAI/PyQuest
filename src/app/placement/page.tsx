"use client";

import dynamic from "next/dynamic";
import { PLACEMENT_UNIT } from "@/lib/curriculum";

const PlacementPlayer = dynamic(
  () => import("@/components/lesson-player").then((m) => m.PlacementPlayer),
  { ssr: false, loading: () => <p className="px-6 py-16 text-sm text-muted-foreground">Preparando el test de nivel…</p> }
);

export default function PlacementPage() {
  const lesson = PLACEMENT_UNIT.lessons[0];
  return <PlacementPlayer lesson={lesson} />;
}
