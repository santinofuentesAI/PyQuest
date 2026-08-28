"use client";

import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useProgress } from "@/lib/progress-store";
import { preloadPython } from "@/lib/python-runtime";

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useProgress((s) => s.theme);
  const hydrated = useProgress((s) => s.hydrated);

  useEffect(() => {
    preloadPython();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      forcedTheme={hydrated && theme !== "system" ? theme : undefined}
    >
      <TooltipProvider delay={200}>
        {children}
        <Toaster position="top-center" />
      </TooltipProvider>
    </ThemeProvider>
  );
}
