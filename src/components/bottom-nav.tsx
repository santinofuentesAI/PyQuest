"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Map, Sparkles, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/learn", label: "Aprender", icon: Map },
  { href: "/practice", label: "Práctica", icon: Dumbbell },
  { href: "/league", label: "Liga", icon: Trophy },
  { href: "/playground", label: "Lab", icon: Sparkles },
  { href: "/profile", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const hide =
    pathname === "/" ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/placement") ||
    pathname.startsWith("/lesson");
  if (hide) return null;

  return (
    <nav className="sticky bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto grid max-w-3xl grid-cols-5">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("size-5", active && "fill-primary/15")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
