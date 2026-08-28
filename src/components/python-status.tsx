"use client";

import { useEffect, useState } from "react";
import { Loader2, FlaskConical } from "lucide-react";
import { subscribeRuntimeStatus, type RuntimeStatus } from "@/lib/python-runtime";
import { cn } from "@/lib/utils";

export function PythonStatus({ className }: { className?: string }) {
  const [status, setStatus] = useState<RuntimeStatus>({ state: "idle" });
  useEffect(() => subscribeRuntimeStatus(setStatus), []);

  if (status.state === "ready") {
    return (
      <p className={cn("inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400", className)}>
        <FlaskConical className="size-3.5" />
        Python listo en el navegador
      </p>
    );
  }
  if (status.state === "error") {
    return (
      <p className={cn("text-xs text-destructive", className)}>
        No se pudo cargar Python: {status.message}
      </p>
    );
  }
  return (
    <p className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <Loader2 className="size-3.5 animate-spin" />
      {status.state === "loading" ? "Cargando Pyodide (NumPy, Pandas, Matplotlib)…" : "Laboratorio en espera"}
    </p>
  );
}
