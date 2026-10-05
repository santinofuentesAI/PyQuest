"use client";

import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useProgress } from "@/lib/progress-store";
import { applyPalette, DEFAULT_PALETTE, paletteById } from "@/lib/palettes";

function PaletteShell({ children }: { children: React.ReactNode }) {
  const palette = useProgress((s) => s.palette) ?? DEFAULT_PALETTE;
  const hydrated = useProgress((s) => s.hydrated);
  const spec = paletteById(palette);

  useEffect(() => {
    applyPalette(palette);
  }, [palette, hydrated]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={spec.dark ? "dark" : "light"}
      enableSystem={false}
      forcedTheme={spec.dark ? "dark" : "light"}
    >
      {children}
    </ThemeProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PaletteShell>
      <TooltipProvider delay={200}>
        {children}
        <Toaster position="top-center" />
      </TooltipProvider>
    </PaletteShell>
  );
}
