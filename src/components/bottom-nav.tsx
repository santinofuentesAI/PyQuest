"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BriefcaseBusiness, Dumbbell, FlaskConical, Map, User } from "lucide-react";
import { isImmersivePath } from "@/lib/chrome";
import { cn } from "@/lib/utils";

const items = [
  { href: "/learn", label: "Aprender", icon: Map },
  { href: "/practice", label: "Práctica", icon: Dumbbell },
  { href: "/projects", label: "Proyectos", icon: BriefcaseBusiness },
  { href: "/library", label: "Librería", icon: BookOpen },
  { href: "/playground", label: "Laboratorio", icon: FlaskConical },
  { href: "/profile", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  if (isImmersivePath(pathname)) return null;

  return (
    <nav aria-label="Navegación principal" className="sticky bottom-0 z-40 border-t border-border/70 bg-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto grid max-w-3xl grid-cols-6 gap-0.5 px-1 py-1.5">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "quest-nav-link flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-0.5 py-2 text-[11px] font-semibold transition",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("size-5 shrink-0", active && "fill-primary/15")} />
                <span className="max-w-[4.4rem] text-center text-[10px] leading-[1.1] sm:text-[11px]">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
