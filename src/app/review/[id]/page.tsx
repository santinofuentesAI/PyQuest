"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getUnit } from "@/lib/curriculum";
import { Button } from "@/components/ui/button";

const ReviewSession = dynamic(() => import("@/components/review-session"), {
  ssr: false,
  loading: () => <p className="px-6 py-16 text-sm text-muted-foreground">Preparando el repaso…</p>,
});

export default function ReviewPage() {
  const params = useParams<{ id: string }>();
  const unit = getUnit(params.id);

  if (!unit) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold">Nada que repasar</h1>
        <Button className="mt-4" render={<Link href="/learn" />}>
          Mapa
        </Button>
      </div>
    );
  }

  return <ReviewSession unitId={unit.id} />;
}
