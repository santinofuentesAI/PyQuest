"use client";

import dynamic from "next/dynamic";
import { useProgress } from "@/lib/progress-store";
import { paletteById } from "@/lib/palettes";

const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-52 items-center justify-center rounded-xl border bg-muted/40 text-sm text-muted-foreground">
      Cargando editor…
    </div>
  ),
});

export function CodeEditor({
  value,
  onChange,
  height = 220,
}: {
  value: string;
  onChange: (v: string) => void;
  height?: number;
}) {
  const palette = useProgress((s) => s.palette);
  const dark = paletteById(palette).dark;
  return (
    <div className="overflow-hidden rounded-xl border border-border ring-1 ring-foreground/5">
      <Monaco
        height={height}
        defaultLanguage="python"
        language="python"
        theme={dark ? "vs-dark" : "light"}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
          tabSize: 4,
          padding: { top: 12, bottom: 12 },
          lineNumbers: "on",
        }}
      />
    </div>
  );
}
