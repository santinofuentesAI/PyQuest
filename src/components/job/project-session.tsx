"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Lightbulb, Play, TerminalSquare, Wallet } from "lucide-react";
import { toast } from "sonner";
import { CodeEditor } from "@/components/code-editor";
import { LaptopCinematic } from "@/components/job/laptop-cinematic";
import { OfficeCinematic } from "@/components/job/office-cinematic";
import { FiredScreen } from "@/components/job/fired-screen";
import { Typewriter } from "@/components/job/typewriter";
import { Button } from "@/components/ui/button";
import { PythonStatus } from "@/components/python-status";
import type { JobProject } from "@/lib/job-projects";
import {
  briefText,
  hintsFor,
  humanPythonError,
  looksIncomplete,
  projectPayout,
  reviewDelivery,
  testsToCode,
} from "@/lib/job-projects";
import { preloadPython, runPython } from "@/lib/python-runtime";
import { useProgress } from "@/lib/progress-store";
import { PybotCoach } from "@/components/pybot";
import "./cinematics.css";

type Phase = "office" | "laptop" | "wipe" | "brief" | "work";

const OFFICE_MS = 10000;
const LAPTOP_MS = 7000;
const WIPE_MS = 900;
const TYPE_MS = 42;
const LAPTOP_HOLD_MS = 5000;
const BRIEF_HOLD_MS = 8000;

export function ProjectSession({
  project,
  skipIntro = false,
}: {
  project: JobProject;
  skipIntro?: boolean;
}) {
  const router = useRouter();
  const progress = useProgress();
  const saved = progress.jobProjects?.[project.id];
  const [phase, setPhase] = useState<Phase>(skipIntro || saved?.introSeen ? "work" : "office");
  const [code, setCode] = useState(saved?.draftCode || project.starterCode);
  const [out, setOut] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [coins, setCoins] = useState<{ id: number; dx: string; dy: string }[]>([]);
  const [showSkip, setShowSkip] = useState(false);
  const [mood, setMood] = useState<"ok" | "missing" | "angry" | "fired">("ok");
  const [warning, setWarning] = useState<string | null>(null);
  const [bossNotice, setBossNotice] = useState(false);
  const coinId = useRef(0);
  const jobHints = hintsFor(project);

  const jobState = progress.jobProjects?.[project.id];
  const hintsUsed = jobState?.hintsUsed ?? 0;
  const completed = jobState?.completed ?? false;
  const wallet = progress.jobUsd ?? 0;
  const remaining = completed
    ? jobState?.paidUsd ?? 0
    : projectPayout(project, hintsUsed, jobState?.walletHints ?? 0);
  const failCount = jobState?.failCount ?? 0;

  useEffect(() => {
    preloadPython({ dataStack: true });
  }, []);

  function updateCode(value: string) {
    setCode(value);
    // Persist immediately as well: navigating away must not lose the final edit.
    progress.saveJobDraft(project.id, value);
  }

  useEffect(() => {
    if (phase === "work" || phase === "brief") return;
    const skipTimer = window.setTimeout(() => setShowSkip(true), 1400);
    return () => window.clearTimeout(skipTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "office") return;
    const t = window.setTimeout(() => setPhase("laptop"), OFFICE_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "laptop") return;
    const typeMs = project.laptopLine.length * TYPE_MS;
    const t = window.setTimeout(
      () => setPhase("wipe"),
      Math.max(LAPTOP_MS, typeMs + LAPTOP_HOLD_MS)
    );
    return () => window.clearTimeout(t);
  }, [phase, project.laptopLine]);

  useEffect(() => {
    if (phase !== "wipe") return;
    const t = window.setTimeout(() => setPhase("brief"), WIPE_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "brief") return;
    progress.saveJobDraft(project.id, code);
    const brief = briefText(project);
    const ms = brief.length * TYPE_MS + BRIEF_HOLD_MS;
    const t = window.setTimeout(() => setPhase("work"), ms);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when entering brief
  }, [phase]);

  function skipIntroNow() {
    setPhase("wipe");
  }

  function goToWork() {
    setPhase("work");
    progress.saveJobDraft(project.id, code);
  }

  async function run(submit: boolean) {
    setBusy(true);
    setErr(null);
    progress.saveJobDraft(project.id, code);
    try {
      const result = await runPython({
        code,
        tests: submit ? testsToCode(project) : "",
        files: project.files,
        packages: project.packages,
        capturePlots: project.capturePlots,
        timeoutMs: 90000,
      });
      setOut(result.stdout);
      setImages(result.images ?? []);
      if (!submit) {
        setErr(result.error ? humanPythonError(result.error) : null);
        return;
      }
      if (result.timedOut) {
        setErr("Python tardó demasiado. Revisa los bucles y vuelve a probar; tu entrega no se ha penalizado.");
        return;
      }
      const verdict = reviewDelivery(project, code, result);
      if (!verdict.accepted) {
        const msg = verdict.message;
        setErr(null);
        setWarning(msg);
        const n = progress.recordJobFail(project.id);
        if (n >= 3) {
          setMood("fired");
          return;
        }
        if (n === 1) {
          setMood("missing");
          toast.error(msg);
        } else {
          setMood("angry");
        }
        return;
      }
      const done = progress.completeJobProject(project.id, {
        code,
        stdout: result.stdout,
        image: result.images?.[0],
      });
      if (!done.ok) {
        const msg = "El jefe: me pasaste la plantilla. Quiero el trabajo hecho, no el archivo vacío.";
        setWarning(msg);
        setMood("missing");
        toast.error(msg);
        return;
      }
      setMood("ok");
      setWarning(null);
      toast.success(`Entrega aceptada. Te pagan $${done.paid}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Python no pudo cargar. Vuelve a intentarlo.";
      setErr(message);
      toast.error("No pudimos comprobarlo. Tu entrega no se ha penalizado.");
    } finally {
      setBusy(false);
    }
  }

  function askHint() {
    const result = progress.useJobHint(project.id);
    if (!result.ok) {
      if (result.reason === "empty") {
        toast.message("Ya usaste todas las pistas de este encargo.");
        if (result.hint) setHintText(result.hint);
        return;
      }
      toast.error(
        `La pista cuesta $${project.hintCostUsd}. Este encargo todavía paga $${remaining} y tu billetera tiene $${wallet}.`
      );
      return;
    }
    if (result.charged > 0) {
      const burst = Array.from({ length: 6 }, () => {
        coinId.current += 1;
        const angle = (Math.random() * 70 - 35) * (Math.PI / 180);
        const dist = 70 + Math.random() * 50;
        return {
          id: coinId.current,
          dx: `${Math.round(Math.sin(angle) * dist)}px`,
          dy: `${Math.round(-Math.cos(angle) * dist - 20)}px`,
        };
      });
      setCoins(burst);
      window.setTimeout(() => setCoins([]), 900);
    }
    if (result.hint) setHintText(result.hint);
    if (result.charged > 0) {
      toast.message(
        result.reason === "wallet"
          ? `Pista: −$${result.charged} de tu billetera`
          : `Pista: −$${result.charged} del sueldo de este encargo`
      );
    }
    if (result.ok && result.charged > 0 && hintsUsed + 1 === 4) {
      window.setTimeout(() => setBossNotice(true), 600);
    }
  }

  function retryThisJob() {
    progress.resetJobProject(project.id);
    setMood("ok");
    setPhase("work");
    setOut("");
    setImages([]);
    setErr(null);
    setWarning(null);
    setHintText(null);
    setShowSkip(false);
    setBossNotice(false);
  }

  const hintsLeft = Math.max(0, jobHints.length - hintsUsed);
  const canAffordHint = completed || remaining >= project.hintCostUsd || wallet >= project.hintCostUsd;
  const canHint = hintsLeft > 0 && canAffordHint;
  const stillTemplate = looksIncomplete(code, project.starterCode);

  if (mood === "fired" || failCount >= 3) {
    return (
      <FiredScreen
        projectTitle={project.title}
        onRetry={retryThisJob}
        onBack={() => {
          progress.resetJobProject(project.id);
          router.push("/projects");
        }}
      />
    );
  }

  if (phase !== "work") {
    return (
      <div className="relative min-h-dvh overflow-hidden bg-black text-white">
        <AnimatePresence mode="wait">
          {phase === "office" && (
            <motion.div
              key="office"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <OfficeCinematic />
            </motion.div>
          )}
          {(phase === "laptop" || phase === "wipe") && (
            <motion.div
              key="laptop"
              className="absolute inset-0 flex items-center justify-center bg-[#0f0f1a]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <LaptopCinematic />
            </motion.div>
          )}
          {phase === "brief" && (
            <motion.div
              key="brief"
              className="absolute inset-0 flex items-center justify-center bg-[#07070c] px-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-full max-w-2xl lg:max-w-4xl">
                <p className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase">
                  Briefing · {project.company}
                </p>
                <p className="mt-4 font-heading text-2xl font-extrabold leading-snug sm:text-3xl">
                  <Typewriter key="brief" text={briefText(project)} msPerChar={TYPE_MS} />
                </p>
                <Button
                  className="mt-8 h-12 rounded-2xl px-6 font-bold"
                  onClick={goToWork}
                >
                  Abrir el terminal
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {(phase === "office" || phase === "laptop") && (
          <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center px-4 sm:top-10">
            <p className="max-w-2xl rounded-2xl bg-black/65 px-4 py-3 text-center font-heading text-lg font-bold leading-snug text-white shadow-lg backdrop-blur-sm sm:text-2xl lg:max-w-4xl">
              {phase === "office" ? (
                <Typewriter key="office" text={project.officeLine} msPerChar={TYPE_MS} />
              ) : (
                <Typewriter key="laptop" text={project.laptopLine} msPerChar={TYPE_MS} />
              )}
            </p>
          </div>
        )}

        {phase === "wipe" && (
          <div className="scene-wipe" aria-hidden>
            <span />
            <span />
          </div>
        )}

        {showSkip && phase !== "brief" && phase !== "wipe" && (
          <button
            type="button"
            onClick={skipIntroNow}
            className="absolute right-4 top-4 z-30 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/20"
          >
            Saltar intro
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-[#0b0d12] text-zinc-100">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-3 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-300 hover:bg-white/10 hover:text-white"
            onClick={() => router.push("/projects")}
          >
            <ArrowLeft className="size-4" />
            Encargos
          </Button>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold tracking-wider text-amber-400 uppercase">
              {project.company}
            </p>
            <h1 className="truncate font-heading text-sm font-bold sm:text-base">{project.title}</h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-sm font-black tabular-nums text-emerald-950">
            <Wallet className="size-4" />
            ${remaining}
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1.5 text-[11px] font-black tabular-nums text-amber-950 sm:px-3 sm:text-xs">
            Billetera ${wallet}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg px-3 pb-28 pt-4 sm:max-w-2xl lg:max-w-6xl lg:px-8">
        <div className="lg:grid lg:grid-cols-5 lg:items-start lg:gap-6">
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#11141c] shadow-[0_0_0_1px_rgba(0,255,65,0.08)]">
              <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] text-zinc-400">
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <TerminalSquare className="size-3.5" />
                  entrega.py — {project.id}.py
                </span>
                <PythonStatus className="!text-zinc-400" />
              </div>
              <CodeEditor value={code} onChange={updateCode} height={340} forceDark />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                className="h-11 rounded-xl font-bold"
                onClick={() => run(false)}
                disabled={busy}
              >
                <Play className="size-4" />
                {busy ? "Ejecutando…" : "Ejecutar"}
              </Button>
              <Button
                variant="secondary"
                className="h-11 rounded-xl bg-zinc-800 font-bold text-zinc-100 hover:bg-zinc-700"
                onClick={() => run(true)}
                disabled={busy || completed}
              >
                {completed ? "Ya cobrado" : "Entregar al jefe"}
              </Button>
              <button
                type="button"
                onClick={askHint}
                className="relative inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-black shadow-md"
                style={{ backgroundColor: "#f5c518", color: "#1c1408" }}
              >
                <Lightbulb className="size-4" />
                {hintsLeft === 0 ? "Pistas agotadas" : `Pista · $${project.hintCostUsd}`}
                {coins.length > 0 && (
                  <span className="coin-burst" aria-hidden>
                    {coins.map((c) => (
                      <i key={c.id} style={{ ["--dx" as string]: c.dx, ["--dy" as string]: c.dy }}>
                        $
                      </i>
                    ))}
                  </span>
                )}
              </button>
              {completed && (
                <p className="self-center text-sm font-semibold text-emerald-400">
                  Cobraste ${jobState?.paidUsd ?? 0} · +40 XP
                </p>
              )}
            </div>
            {stillTemplate && !completed && (
              <div className="mt-3 rounded-2xl border border-sky-400/50 bg-sky-500 px-4 py-3 text-sm text-sky-950">
                <p className="font-black">Esto es la plantilla. Todavía no está hecho.</p>
                <p className="mt-1 leading-snug">
                  El jefe no acepta el archivo de ejemplo. Completa el cálculo, pulsa Ejecutar y después entrégalo.
                </p>
              </div>
            )}
            <p className="mt-2 text-xs font-medium text-zinc-300">
              {hintsLeft === 0
                ? "Ya no quedan pistas en este encargo."
                : canHint
                  ? `Quedan ${hintsLeft} pistas. Se descuentan del sueldo de este encargo${wallet > 0 ? " o de tu billetera" : ""}.`
                  : `Te faltan $${Math.max(0, project.hintCostUsd - Math.max(remaining, wallet))} para la siguiente pista.`}
            </p>
          </div>
          <div className="mt-4 space-y-3 lg:col-span-2 lg:mt-0">
            <PybotCoach mood={busy ? "thinking" : completed ? "celebrate" : "encourage"} className="!border-white/10 !bg-[#182131] !text-zinc-100">{completed ? "¡Entrega aceptada! Ya está en tu portafolio." : "Ejecuta para observar el resultado. Cuando esté listo, entrega tu trabajo."}</PybotCoach>
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
              <p className="text-[11px] font-black tracking-wider text-amber-800 uppercase">Encargo</p>
              <p className="mt-1 font-medium">{briefText(project)}</p>
            </div>
            {warning && mood !== "ok" && (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-950/80 px-4 py-3 text-sm font-semibold text-amber-100">
                {warning}
              </div>
            )}
            {hintText && (
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 shadow-lg">
                <p className="text-[11px] font-black tracking-wider text-amber-800 uppercase">Pista del jefe</p>
                <p className="mt-1 font-semibold">{hintText}</p>
              </div>
            )}
            {(out || err) && (
              <pre className="max-h-56 overflow-auto rounded-xl bg-black p-3 font-mono text-xs leading-relaxed text-emerald-300 lg:max-h-[28rem]">
                {err ? <span className="text-rose-300">{err}</span> : out || "(sin salida)"}
              </pre>
            )}
            {images.map((image, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={index} src={`data:image/png;base64,${image}`} alt="Gráfico de tu encargo" className="w-full rounded-2xl border border-white/10 bg-white" />
            ))}
          </div>
        </div>
      </div>

      {bossNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="max-w-md rounded-3xl border border-amber-500/40 bg-[#1a1408] p-6 text-center shadow-2xl">
            <p className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase">El jefe</p>
            <p className="mt-3 font-heading text-2xl font-extrabold leading-snug text-amber-50">
              Usaste las pistas disponibles. Antes de seguir, explica con tus palabras qué cambió en tu código.
            </p>
            <Button
              className="mt-6 h-11 rounded-2xl px-6 font-bold"
              onClick={() => setBossNotice(false)}
            >
              Seguir aprendiendo
            </Button>
          </div>
        </div>
      )}

      {mood === "angry" && (
        <div className="boss-angry-overlay fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="max-w-md rounded-3xl border border-rose-500/40 bg-black/70 p-6 text-center shadow-2xl">
            <p className="text-xs font-bold tracking-[0.2em] text-rose-400 uppercase">Revisión de entrega</p>
            <p className="mt-3 font-heading text-2xl font-extrabold text-white">
              Todavía hay algo por revisar. Mira el mensaje, cambia una cosa y vuelve a ejecutar.
            </p>
            <Button
              className="mt-6 h-11 rounded-2xl bg-zinc-800 px-6 font-bold text-zinc-100 hover:bg-zinc-700"
              variant="secondary"
              onClick={() => setMood("missing")}
            >
              Seguir intentando
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProjectLocked({ title }: { title: string }) {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-bold tracking-widest text-primary uppercase">Bloqueado</p>
      <h1 className="font-heading mt-2 text-2xl font-extrabold">{title}</h1>
      <p className="mt-2 text-muted-foreground">
        Termina todas las lecciones esenciales de esta sección en el mapa para desbloquear el encargo.
      </p>
      <Button className="mt-6 h-11 rounded-2xl px-6 font-bold" render={<Link href="/learn" />}>
        Ir al mapa
      </Button>
    </div>
  );
}
