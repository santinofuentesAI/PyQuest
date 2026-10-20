import {
  isAiProvider,
  scrubSecret,
  upstreamUrl,
  usefulModel,
  type AiMessage,
  type AiProviderId,
} from "@/lib/ai-providers";

export const dynamic = "force-dynamic";

type Body = {
  action?: "models" | "chat";
  provider?: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  messages?: AiMessage[];
};

function fail(status: number, error: string) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return fail(400, "El pedido no se pudo leer.");
  }
  const provider = body.provider ?? "";
  if (!isAiProvider(provider) || provider === "lmstudio") {
    return fail(400, "Ese proveedor no se consulta desde el servidor.");
  }
  const apiKey = (body.apiKey ?? "").trim();
  if (!apiKey || apiKey.length > 400) return fail(400, "Falta la clave de API.");
  try {
    if (body.action === "models") return Response.json({ models: await listModels(provider, apiKey) });
    if (body.action === "chat") {
      const messages = (body.messages ?? []).slice(-12).filter((item) => item && typeof item.content === "string" && typeof item.role === "string");
      if (!messages.length) return fail(400, "Falta el mensaje.");
      const text = await chat(provider, apiKey, (body.model ?? "").trim(), messages);
      return Response.json({ text });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "El modelo no respondió.";
    return fail(502, scrubSecret(message, apiKey));
  }
  return fail(400, "No entendí el pedido.");
}

async function listModels(provider: AiProviderId, apiKey: string) {
  const url = upstreamUrl(provider, "", "models");
  if (provider === "gemini") url.searchParams.set("key", apiKey);
  const response = await fetch(url, {
    headers: provider === "gemini" ? {} : { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(await response.text());
  const payload = (await response.json()) as { data?: { id?: string }[]; models?: { name?: string; supportedGenerationMethods?: string[] }[] };
  const ids =
    provider === "gemini"
      ? (payload.models ?? [])
          .filter((item) => !item.supportedGenerationMethods || item.supportedGenerationMethods.includes("generateContent"))
          .map((item) => (item.name ?? "").replace(/^models\//, ""))
      : (payload.data ?? []).map((item) => item.id ?? "");
  return ids.filter((id) => id && usefulModel(id)).slice(0, 60);
}

async function chat(provider: AiProviderId, apiKey: string, model: string, messages: AiMessage[]) {
  if (!model) throw new Error("Elige un modelo.");
  if (provider === "gemini") return geminiChat(apiKey, model, messages);
  const url = upstreamUrl(provider, "", "chat", model);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "PyQuest",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: messages.map((item) => ({ role: item.role, content: item.content.slice(0, 4000) })),
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(await response.text());
  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("El modelo contestó vacío.");
  return text;
}

async function geminiChat(apiKey: string, model: string, messages: AiMessage[]) {
  const url = upstreamUrl("gemini", "", "chat", model);
  url.searchParams.set("key", apiKey);
  const system = messages.filter((item) => item.role === "system").map((item) => item.content).join("\n");
  const contents = messages
    .filter((item) => item.role !== "system")
    .map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content.slice(0, 4000) }],
    }));
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system.slice(0, 4000) }] } : undefined,
      contents,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(await response.text());
  const payload = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) throw new Error("El modelo contestó vacío.");
  return text;
}
