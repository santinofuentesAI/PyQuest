import { getLesson, getUnit } from "./curriculum";
import { getJobProject } from "./job-projects";
import { getLibraryArticle } from "./library";
import type { AiProviderId, CourseId } from "./types";
import type { PaletteId } from "./palettes";

export type { AiProviderId };

export const AI_PROVIDER_IDS: AiProviderId[] = ["openai", "deepseek", "gemini", "openrouter", "lmstudio"];

export const AI_PROVIDERS: { id: AiProviderId; label: string; base: string; needsKey: boolean }[] = [
  { id: "openai", label: "OpenAI", base: "https://api.openai.com/v1", needsKey: true },
  { id: "deepseek", label: "DeepSeek", base: "https://api.deepseek.com", needsKey: true },
  { id: "gemini", label: "Gemini", base: "https://generativelanguage.googleapis.com/v1beta", needsKey: true },
  { id: "openrouter", label: "OpenRouter", base: "https://openrouter.ai/api/v1", needsKey: true },
  { id: "lmstudio", label: "LM Studio", base: "http://127.0.0.1:1234/v1", needsKey: false },
];

export const DEFAULT_LMSTUDIO_BASE = "http://127.0.0.1:1234/v1";

export type AiMessage = { role: "system" | "user" | "assistant"; content: string };

export type PybotAction =
  | { tool: "navigate"; path: string }
  | { tool: "set_course"; courseId: CourseId }
  | { tool: "set_palette"; palette: PaletteId }
  | { tool: "set_sound"; on: boolean }
  | { tool: "speak"; text: string }
  | { tool: "status" };

const STATIC_PATHS = new Set([
  "/learn",
  "/practice",
  "/library",
  "/playground",
  "/projects",
  "/shop",
  "/profile",
  "/courses",
  "/league",
]);

const COURSE_IDS = new Set<CourseId>(["python-ia", "python-datos", "agentes-ia"]);
const PALETTE_IDS = new Set<PaletteId>(["violet", "ocean", "sunset", "night", "forest", "black"]);

export function isAiProvider(value: string): value is AiProviderId {
  return AI_PROVIDER_IDS.includes(value as AiProviderId);
}

export function providerInfo(id: AiProviderId) {
  return AI_PROVIDERS.find((item) => item.id === id) ?? AI_PROVIDERS[0];
}

/** Only localhost. LM Studio runs on the same computer as the browser. */
export function localBase(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("La dirección de LM Studio no es válida.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("LM Studio tiene que usar http o https.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host !== "localhost" && host !== "127.0.0.1" && host !== "::1") {
    throw new Error("LM Studio solo se conecta a esta computadora (localhost).");
  }
  return url.toString().replace(/\/$/, "");
}

export function upstreamUrl(provider: AiProviderId, baseUrl: string, kind: "models" | "chat", model = ""): URL {
  if (provider === "gemini") {
    if (kind === "models") return new URL("https://generativelanguage.googleapis.com/v1beta/models");
    const name = model.replace(/^models\//, "").trim();
    if (!/^[\w.\-:]+$/.test(name)) throw new Error("Elige un modelo de la lista.");
    return new URL(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(name)}:generateContent`);
  }
  const base = provider === "lmstudio" ? localBase(baseUrl || DEFAULT_LMSTUDIO_BASE) : providerInfo(provider).base;
  const root = new URL(base.endsWith("/") ? base : `${base}/`);
  const path = kind === "models" ? "models" : "chat/completions";
  return new URL(path, root);
}

export function usefulModel(id: string) {
  return !/embed|whisper|tts|dall-e|moderation|transcri|realtime|image|audio|speech/i.test(id);
}

export function pickDefaultModel(provider: AiProviderId, ids: string[]) {
  const usable = ids.filter(usefulModel);
  const pool = usable.length ? usable : ids;
  const prefer: Record<AiProviderId, string[]> = {
    openai: ["gpt-4o-mini", "gpt-4.1-mini", "gpt-4o"],
    deepseek: ["deepseek-chat", "deepseek-reasoner"],
    gemini: ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash"],
    openrouter: ["openai/gpt-4o-mini", "google/gemini-2.5-flash", "deepseek/deepseek-chat"],
    lmstudio: [],
  };
  for (const name of prefer[provider]) {
    const hit = pool.find((id) => id === name || id.endsWith(`/${name}`) || id.includes(name));
    if (hit) return hit;
  }
  return pool[0] ?? "";
}

export function safePath(path: string): string | null {
  const clean = path.trim().split("?")[0]?.split("#")[0] ?? "";
  if (!clean.startsWith("/") || clean.includes("..") || clean.includes("//")) return null;
  if (STATIC_PATHS.has(clean)) return clean;
  const lesson = clean.match(/^\/lesson\/([a-z0-9-]+)$/);
  if (lesson && getLesson(lesson[1])) return clean;
  const review = clean.match(/^\/review\/([a-z0-9-]+)$/);
  if (review && getLesson(review[1])) return clean;
  const unit = clean.match(/^\/unit\/([a-z0-9-]+)$/);
  if (unit && getUnit(unit[1])) return clean;
  const skip = clean.match(/^\/skip\/([a-z0-9-]+)$/);
  if (skip && getUnit(skip[1])) return clean;
  const project = clean.match(/^\/projects\/([a-z0-9-]+)$/);
  if (project && getJobProject(project[1])) return clean;
  const article = clean.match(/^\/library\/([a-z0-9-]+)$/);
  if (article && getLibraryArticle(article[1])) return clean;
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function oneAction(value: unknown): PybotAction | null {
  const row = asRecord(value);
  if (!row || typeof row.tool !== "string") return null;
  switch (row.tool) {
    case "navigate": {
      if (typeof row.path !== "string") return null;
      const path = safePath(row.path);
      return path ? { tool: "navigate", path } : null;
    }
    case "set_course": {
      if (typeof row.courseId !== "string" || !COURSE_IDS.has(row.courseId as CourseId)) return null;
      return { tool: "set_course", courseId: row.courseId as CourseId };
    }
    case "set_palette": {
      if (typeof row.palette !== "string" || !PALETTE_IDS.has(row.palette as PaletteId)) return null;
      return { tool: "set_palette", palette: row.palette as PaletteId };
    }
    case "set_sound":
      return { tool: "set_sound", on: row.on !== false };
    case "speak": {
      if (typeof row.text !== "string") return null;
      const text = row.text.trim().slice(0, 400);
      return text ? { tool: "speak", text } : null;
    }
    case "status":
      return { tool: "status" };
    default:
      return null;
  }
}

export function parsePybotReply(raw: string): { say: string; actions: PybotAction[] } {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced?.[1] ?? trimmed).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      const value = asRecord(JSON.parse(candidate.slice(start, end + 1)));
      if (value && ("say" in value || "actions" in value || "tool" in value)) {
        const listed = Array.isArray(value.actions) ? value.actions : value.tool ? [value] : [];
        const actions = listed.map(oneAction).filter((item): item is PybotAction => item !== null).slice(0, 4);
        const say = typeof value.say === "string" ? value.say.trim() : "";
        return { say, actions };
      }
    } catch {
      // The model spoke in prose.
    }
  }
  return { say: trimmed, actions: [] };
}

export function scrubSecret(text: string, secret: string) {
  const clean = secret ? text.split(secret).join("***") : text;
  return clean.replace(/key=[^&\s]+/gi, "key=***").slice(0, 280);
}
