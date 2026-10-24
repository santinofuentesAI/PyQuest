"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Pybot } from "@/components/pybot";
import { Button } from "@/components/ui/button";
import { isImmersivePath } from "@/lib/chrome";
import { useProgress, continueLessonId } from "@/lib/progress-store";
import { speakSpanish } from "@/lib/speech";
import { ensureModel, type AiSettings } from "@/lib/ai-client";
import { runPybot } from "@/lib/pybot-agent";
import { providerInfo, type AiMessage, type PybotAction } from "@/lib/ai-providers";
import { getCourseEntry } from "@/lib/courses";
import { getLesson } from "@/lib/curriculum";
import { PALETTES } from "@/lib/palettes";
import { scrollIntoViewSoon } from "@/lib/scroll-into-view";

const GUIDES: Record<string, { label: string; tips: string[]; href: string; action: string }> = {
  "/learn": { label: "Un paso a la vez", tips: ["Pulsa Empezar clase o Retomar clase, arriba a la derecha. Cada tema tiene cinco niveles; el primero abre la siguiente unidad.", "Equivocarte también enseña. Una pregunta consume como máximo un corazón y puedes corregirla.", "La clase explica el nivel y luego practicas. La librería es extra, por si quieres leer más."], href: "/learn", action: "Seguir en el mapa" },
  "/library": { label: "Aprende experimentando", tips: ["Lee un ejemplo, predice su resultado y cambia un dato antes de ejecutarlo.", "En el taller de cada tema puedes pasar de ejemplos resueltos a retos. Todos los niveles están disponibles.", "Si el código no imprime, añade print() para observar una variable. Mira qué cambió y por qué."], href: "/playground", action: "Abrir el laboratorio" },
  "/projects": { label: "Tu primera entrega", tips: ["Los dos encargos de Fundamentos están abiertos. Ejecuta antes de entregar para revisar tu código.", "Tu salario es ficticio. Las pistas lo reducen, pero pueden ayudarte a entender una idea nueva.", "Una entrega aceptada se guarda en tu portafolio. Podrás ver el código y sus resultados en Perfil."], href: "/profile", action: "Ver mi portafolio" },
  "/playground": { label: "Tu espacio para probar", tips: ["Cambia los datos del ejemplo, pulsa Ejecutar y mira cómo cambia el gráfico.", "Guarda tu código desde el laboratorio en el portafolio. El progreso vive en este navegador.", "La primera ejecución descarga Python y sus paquetes. Después se reutilizan para tus experimentos."], href: "/profile", action: "Ver mi portafolio" },
  "/practice": { label: "Practica a tu ritmo", tips: ["Aquí puedes corregir sin gastar corazones. Elige los temas que quieras reforzar.", "Alterna preguntas y código: reconocer una idea y escribirla son habilidades distintas.", "Una sesión corta y concentrada es un buen siguiente paso. Tú eliges cuántos retos resolver."], href: "/learn", action: "Volver a mi ruta" },
};

export function PybotHelp({ inline = false }: { inline?: boolean }) {
  const path = usePathname();
  const router = useRouter();
  const progress = useProgress();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<AiMessage[]>([]);
  const [lines, setLines] = useState<{ role: "pybot" | "you"; text: string }[]>([]);
  const thread = useRef<HTMLDivElement>(null);
  const guide = Object.entries(GUIDES).find(([key]) => path.startsWith(key))?.[1] ?? GUIDES["/learn"];
  const provider = progress.aiProvider ?? "openai";
  const ready = provider === "lmstudio" || Boolean((progress.aiApiKey ?? "").trim());

  useEffect(() => {
    const last = thread.current?.lastElementChild;
    if (last instanceof HTMLElement) scrollIntoViewSoon(last);
  }, [lines, busy]);

  if ((isImmersivePath(path) && !inline) || (path === "/playground" && !inline)) return null;

  function context() {
    const nextId = continueLessonId(progress);
    const next = nextId ? getLesson(nextId) : undefined;
    const course = getCourseEntry(progress.activeCourseId ?? "python-ia");
    return `Página ${path}. Curso ${course.title}. XP ${progress.xp}. Corazones ${progress.hearts}. Racha ${progress.streak}. ${next ? `Siguiente clase: ${next.title} (${next.id}).` : "No hay una clase pendiente."}`;
  }

  function apply(actions: PybotAction[]) {
    const notes: string[] = [];
    for (const action of actions) {
      switch (action.tool) {
        case "navigate":
          router.push(action.path);
          notes.push(`Abrí ${action.path}.`);
          break;
        case "set_course":
          progress.setActiveCourse(action.courseId);
          notes.push(`Curso activo: ${getCourseEntry(action.courseId).title}.`);
          break;
        case "set_palette":
          progress.setPalette(action.palette);
          notes.push(`Color: ${PALETTES.find((item) => item.id === action.palette)?.name ?? action.palette}.`);
          break;
        case "set_sound":
          progress.setSound(action.on);
          notes.push(action.on ? "Sonido activado." : "Sonido apagado.");
          break;
        case "speak":
          speakSpanish(action.text, progress.voiceURI);
          notes.push("Lo leí en voz alta.");
          break;
        case "status":
          notes.push(context());
          break;
        default: {
          const never: never = action;
          notes.push(String(never));
        }
      }
    }
    return notes.join(" ");
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    const user = draft.trim();
    if (!user || busy) return;
    setDraft("");
    setLines((current) => [...current, { role: "you", text: user }]);
    setBusy(true);
    try {
      const settings: AiSettings = {
        provider,
        apiKey: progress.aiApiKey ?? "",
        baseUrl: progress.aiBaseUrl ?? "",
        model: progress.aiModel ?? "",
      };
      const chosen = await ensureModel(settings);
      if (chosen.model !== settings.model) progress.setAi({ aiModel: chosen.model });
      const result = await runPybot({
        settings: chosen,
        history,
        user,
        context: context(),
        apply,
      });
      setHistory(result.history);
      setLines((current) => [...current, { role: "pybot", text: result.say }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Pybot no pudo hablar con el modelo.";
      toast.error(message);
      setLines((current) => [...current, { role: "pybot", text: message }]);
    } finally {
      setBusy(false);
    }
  }

  return <Dialog>
    <DialogTrigger aria-label="Hablar con Pybot" className={inline ? "flex size-11 items-center justify-center rounded-xl hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary" : "pybot-help fixed right-4 bottom-24 z-40 flex size-14 items-center justify-center rounded-2xl border-2 border-card bg-card shadow-lg transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-primary"}>
      <Pybot size={inline ? "xs" : "sm"} mood="wave" />
    </DialogTrigger>
    <DialogContent className="max-h-[85dvh] overflow-hidden rounded-3xl p-5 sm:max-w-md">
      <div className="flex max-h-[75dvh] flex-col gap-3">
      <div className="rounded-3xl bg-[radial-gradient(ellipse_at_50%_20%,#d9fff1,transparent_72%)] px-4 py-2">
        <Pybot mood={busy ? "thinking" : "wave"} size="lg" className="mx-auto" />
      </div>
      <DialogTitle className="text-center text-2xl font-extrabold">Hola, soy Pybot.</DialogTitle>
      <DialogDescription className="text-center">Puedo explicarte esta pantalla y mover la app si me conectas un modelo.</DialogDescription>
      <div ref={thread} className="min-h-28 flex-1 space-y-2 overflow-y-auto rounded-2xl bg-muted/60 p-4">
        <p className="text-xs font-bold text-primary">{guide.label}</p>
        <p className="text-sm leading-relaxed">{guide.tips[0]}</p>
        {lines.map((line, index) => (
          <p key={`${line.role}-${index}`} className={line.role === "you" ? "text-right text-sm font-semibold" : "text-sm leading-relaxed"}>
            {line.text}
          </p>
        ))}
        {busy ? <p className="text-xs text-muted-foreground">Pybot está consultando el modelo…</p> : null}
      </div>
      {ready ? (
        <form className="flex gap-2" onSubmit={send}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Pídele algo a ${providerInfo(provider).label}`}
            aria-label="Mensaje para Pybot"
            className="h-11 min-w-0 flex-1 rounded-xl border bg-background px-3 text-sm"
            disabled={busy}
          />
          <Button type="submit" className="h-11 rounded-xl px-3" disabled={busy || !draft.trim()} aria-label="Enviar">
            <Send className="size-4" />
          </Button>
        </form>
      ) : (
        <Button className="h-11 rounded-xl" render={<Link href="/profile" />}>Conectar un modelo<ArrowRight className="size-4" /></Button>
      )}
      </div>
    </DialogContent>
  </Dialog>;
}
