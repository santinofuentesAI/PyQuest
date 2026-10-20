"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProgress } from "@/lib/progress-store";
import { fetchModels, type AiSettings } from "@/lib/ai-client";
import { AI_PROVIDERS, DEFAULT_LMSTUDIO_BASE, isAiProvider, pickDefaultModel, type AiProviderId } from "@/lib/ai-providers";

export function AiSettings() {
  const progress = useProgress();
  const provider = progress.aiProvider ?? "openai";
  const [models, setModels] = useState<string[]>(progress.aiModel ? [progress.aiModel] : []);
  const [busy, setBusy] = useState(false);
  const info = AI_PROVIDERS.find((item) => item.id === provider) ?? AI_PROVIDERS[0];

  function settings(): AiSettings {
    return {
      provider,
      apiKey: progress.aiApiKey ?? "",
      baseUrl: progress.aiBaseUrl || DEFAULT_LMSTUDIO_BASE,
      model: progress.aiModel ?? "",
    };
  }

  async function consult() {
    setBusy(true);
    try {
      const list = await fetchModels(settings());
      if (!list.length) {
        toast.error("Esa cuenta no devolvió modelos.");
        return;
      }
      setModels(list);
      const chosen = list.includes(progress.aiModel ?? "") ? progress.aiModel ?? list[0] : pickDefaultModel(provider, list);
      progress.setAi({ aiModel: chosen });
      toast.success(`Encontré ${list.length} modelos. Pybot usará ${chosen}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No pude consultar los modelos.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mt-4 rounded-xl border bg-muted/30 p-3" onSubmit={(event) => event.preventDefault()}>
      <p className="flex items-center gap-2 text-sm font-bold">
        <Bot className="size-4 text-primary" />
        Pybot con IA
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        La clave se queda en este navegador. Pybot consulta el modelo y puede abrir pantallas, cambiar el curso, el color y leerte en voz alta.
      </p>
      <label className="mt-3 block text-xs font-bold" htmlFor="ai-provider">Proveedor</label>
      <select
        id="ai-provider"
        className="mt-1 h-11 w-full rounded-xl border bg-background px-3 text-sm"
        value={provider}
        onChange={(event) => {
          const next = event.target.value;
          if (!isAiProvider(next)) return;
          progress.setAi({ aiProvider: next as AiProviderId, aiModel: "" });
          setModels([]);
        }}
      >
        {AI_PROVIDERS.map((item) => (
          <option key={item.id} value={item.id}>{item.label}</option>
        ))}
      </select>
      {provider === "lmstudio" ? (
        <>
          <label className="mt-3 block text-xs font-bold" htmlFor="ai-base">Dirección local</label>
          <Input
            id="ai-base"
            className="mt-1 h-11 rounded-xl px-3"
            value={progress.aiBaseUrl || DEFAULT_LMSTUDIO_BASE}
            onChange={(event) => progress.setAi({ aiBaseUrl: event.target.value })}
            spellCheck={false}
            aria-label="Dirección de LM Studio"
          />
        </>
      ) : null}
      <label className="mt-3 block text-xs font-bold" htmlFor="ai-key">
        {info.needsKey ? "Clave de API" : "Clave (opcional)"}
      </label>
      <Input
        id="ai-key"
        type="password"
        className="mt-1 h-11 rounded-xl px-3"
        value={progress.aiApiKey ?? ""}
        onChange={(event) => progress.setAi({ aiApiKey: event.target.value })}
        autoComplete="off"
        spellCheck={false}
        placeholder={info.needsKey ? "Pégala aquí" : "LM Studio suele no pedirla"}
        aria-label="Clave de API"
      />
      <Button type="button" variant="outline" className="mt-3 h-11 w-full rounded-xl" disabled={busy || (info.needsKey && !(progress.aiApiKey ?? "").trim())} onClick={consult}>
        {busy ? "Consultando…" : "Consultar modelos"}
      </Button>
      {models.length > 0 ? (
        <>
          <label className="mt-3 block text-xs font-bold" htmlFor="ai-model">Modelo</label>
          <select
            id="ai-model"
            className="mt-1 h-11 w-full rounded-xl border bg-background px-3 text-sm"
            value={progress.aiModel ?? ""}
            onChange={(event) => progress.setAi({ aiModel: event.target.value })}
          >
            {models.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </>
      ) : progress.aiModel ? (
        <p className="mt-2 text-xs text-muted-foreground">Modelo guardado: {progress.aiModel}</p>
      ) : null}
    </form>
  );
}
