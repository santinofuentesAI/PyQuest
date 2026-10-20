import {
  localBase,
  pickDefaultModel,
  scrubSecret,
  upstreamUrl,
  usefulModel,
  type AiMessage,
  type AiProviderId,
} from "./ai-providers";

export type AiSettings = {
  provider: AiProviderId;
  apiKey: string;
  baseUrl: string;
  model: string;
};

async function readError(response: Response, secret: string) {
  const text = await response.text();
  return scrubSecret(text || `El modelo respondió ${response.status}.`, secret);
}

export async function fetchModels(settings: AiSettings): Promise<string[]> {
  if (settings.provider === "lmstudio") {
    const url = upstreamUrl("lmstudio", settings.baseUrl, "models");
    const headers: Record<string, string> = {};
    if (settings.apiKey.trim()) headers.Authorization = `Bearer ${settings.apiKey.trim()}`;
    let response: Response;
    try {
      response = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
    } catch {
      throw new Error("No encontré LM Studio en esta computadora. Ábrelo y revisa la dirección.");
    }
    if (!response.ok) throw new Error(await readError(response, settings.apiKey));
    const payload = (await response.json()) as { data?: { id?: string }[] };
    return (payload.data ?? []).map((item) => item.id ?? "").filter((id) => id && usefulModel(id)).slice(0, 60);
  }
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "models",
      provider: settings.provider,
      apiKey: settings.apiKey,
    }),
  });
  const payload = (await response.json()) as { models?: string[]; error?: string };
  if (!response.ok) throw new Error(payload.error || "No pude consultar los modelos.");
  return payload.models ?? [];
}

export async function sendChat(settings: AiSettings, messages: AiMessage[]): Promise<string> {
  const model = settings.model.trim();
  if (!model) throw new Error("Primero consulta los modelos y elige uno.");
  if (settings.provider === "lmstudio") {
    const url = upstreamUrl("lmstudio", settings.baseUrl, "chat", model);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (settings.apiKey.trim()) headers.Authorization = `Bearer ${settings.apiKey.trim()}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          temperature: 0.4,
          messages: messages.map((item) => ({ role: item.role, content: item.content.slice(0, 4000) })),
        }),
        signal: AbortSignal.timeout(30000),
      });
    } catch {
      throw new Error("LM Studio no contestó. Revisa que el servidor local siga abierto.");
    }
    if (!response.ok) throw new Error(await readError(response, settings.apiKey));
    const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("El modelo contestó vacío.");
    return text;
  }
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "chat",
      provider: settings.provider,
      apiKey: settings.apiKey,
      model,
      messages,
    }),
  });
  const payload = (await response.json()) as { text?: string; error?: string };
  if (!response.ok || !payload.text) throw new Error(payload.error || "El modelo no contestó.");
  return payload.text;
}

export async function ensureModel(settings: AiSettings): Promise<AiSettings> {
  if (settings.provider === "lmstudio") localBase(settings.baseUrl);
  if (settings.model.trim()) return settings;
  const models = await fetchModels(settings);
  const model = pickDefaultModel(settings.provider, models);
  if (!model) throw new Error("Esa cuenta no devolvió modelos.");
  return { ...settings, model };
}
