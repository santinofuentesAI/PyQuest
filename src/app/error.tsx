"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="font-heading text-3xl font-extrabold">Algo se torció</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message || "Error inesperado."}</p>
      <div className="mt-6 flex gap-2">
        <button type="button" onClick={reset} className={cn(buttonVariants(), "h-11 rounded-2xl px-5 font-bold")}>
          Reintentar
        </button>
        <Link href="/learn" className={cn(buttonVariants({ variant: "outline" }), "h-11 rounded-2xl px-5 font-bold")}>
          Mapa
        </Link>
      </div>
    </div>
  );
}
