"use client";

import { PlacementPlayer } from "@/components/lesson-player";
import { PLACEMENT_UNIT } from "@/lib/curriculum";

export default function PlacementPage() {
  const lesson = PLACEMENT_UNIT.lessons[0];
  return <PlacementPlayer lesson={lesson} />;
}
