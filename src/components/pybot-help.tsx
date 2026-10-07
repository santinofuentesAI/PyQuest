"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Pybot } from "@/components/pybot";
import { Button } from "@/components/ui/button";
import { isImmersivePath } from "@/lib/chrome";

const GUIDES: Record<string, { label: string; tips: string[]; href: string; action: string }> = {
  "/learn": { label: "Un paso a la vez", tips: ["Empieza por la misión sugerida. Cada tema tiene cinco niveles; el primero abre la siguiente unidad.", "Equivocarte también enseña. Una pregunta consume como máximo un corazón y puedes corregirla.", "¿Una idea no te queda clara? En la librería puedes cambiar ejemplos y practicar sin corazones."], href: "/library", action: "Explorar la librería" },
  "/library": { label: "Aprende experimentando", tips: ["Lee un ejemplo, predice su resultado y cambia un dato antes de ejecutarlo.", "En el taller de cada tema puedes pasar de ejemplos resueltos a retos. Todos los niveles están disponibles.", "Si el código no imprime, añade print() para observar una variable. Mira qué cambió y por qué."], href: "/playground", action: "Abrir el laboratorio" },
  "/projects": { label: "Tu primera entrega", tips: ["Los dos encargos de Fundamentos están abiertos. Ejecuta antes de entregar para revisar tu código.", "Tu salario es ficticio. Las pistas lo reducen, pero pueden ayudarte a entender una idea nueva.", "Una entrega aceptada se guarda en tu portafolio. Podrás ver el código y sus resultados en Perfil."], href: "/profile", action: "Ver mi portafolio" },
  "/playground": { label: "Tu espacio para probar", tips: ["Cambia los datos del ejemplo, pulsa Ejecutar y mira cómo cambia el gráfico.", "Guarda tu código desde el laboratorio en el portafolio. El progreso vive en este navegador.", "La primera ejecución descarga Python y sus paquetes. Después se reutilizan para tus experimentos."], href: "/profile", action: "Ver mi portafolio" },
  "/practice": { label: "Practica a tu ritmo", tips: ["Aquí puedes corregir sin gastar corazones. Elige los temas que quieras reforzar.", "Alterna preguntas y código: reconocer una idea y escribirla son habilidades distintas.", "Una sesión corta y concentrada es un buen siguiente paso. Tú eliges cuántos retos resolver."], href: "/learn", action: "Volver a mi ruta" },
};

export function PybotHelp() {
  const path = usePathname();
  const [tip, setTip] = useState(0);
  if (isImmersivePath(path)) return null;
  const guide = Object.entries(GUIDES).find(([key]) => path.startsWith(key))?.[1] ?? GUIDES["/learn"];
  return <Dialog>
    <DialogTrigger aria-label="Hablar con Pybot" className="pybot-help fixed right-4 bottom-24 z-40 flex size-14 items-center justify-center rounded-2xl border-2 border-card bg-card shadow-lg transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-primary">
      <Pybot size="sm" mood="wave" />
    </DialogTrigger>
    <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-3xl p-6 sm:max-w-md">
      <Pybot mood="wave" size="lg" className="mx-auto" />
      <DialogTitle className="text-center text-2xl font-extrabold">Hola, soy Pybot.</DialogTitle>
      <DialogDescription className="text-center">Tu compañero de aprendizaje en PyQuest.</DialogDescription>
      <div className="rounded-2xl bg-muted/60 p-4"><p className="mb-2 text-xs font-bold text-primary">{guide.label}</p><p role="status" className="text-sm leading-relaxed">{guide.tips[tip % guide.tips.length]}</p></div>
      <Button variant="outline" className="h-11 rounded-xl" onClick={() => setTip((n) => n + 1)}><RefreshCw className="size-4" />Otro consejo</Button>
      <Button className="h-11 rounded-xl" render={<Link href={guide.href} />}>{guide.action}<ArrowRight className="size-4" /></Button>
    </DialogContent>
  </Dialog>;
}
