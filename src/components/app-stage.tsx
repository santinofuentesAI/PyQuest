"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

export function AppStage({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const reduce = useReducedMotion();
  return <motion.div key={path} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .2 }} className="min-w-0">{children}</motion.div>;
}
