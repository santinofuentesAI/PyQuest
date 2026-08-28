import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-bold tracking-widest text-primary uppercase">404</p>
      <h1 className="font-heading mt-2 text-3xl font-extrabold">Esa ruta no existe</h1>
      <p className="mt-2 text-muted-foreground">Vuelve al mapa o al laboratorio. Nada se ha perdido.</p>
      <Link href="/learn" className={cn(buttonVariants(), "mt-6 h-11 rounded-2xl px-6 font-bold")}>
        Ir a aprender
      </Link>
    </div>
  );
}
