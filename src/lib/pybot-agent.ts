import { sendChat, type AiSettings } from "./ai-client";
import { parsePybotReply, type AiMessage, type PybotAction } from "./ai-providers";

const SYSTEM = `Eres Pybot, el compañero de PyQuest. Hablas en español, corto y claro, como un amigo que enseña.
Puedes mover la app. Si hace falta una acción, responde SOLO con JSON de esta forma:
{"say":"lo que ve la persona","actions":[{"tool":"navigate","path":"/learn"}]}
Herramientas:
- navigate con path: /learn /practice /library /playground /projects /shop /profile /courses /league, o /lesson/ID, /unit/ID, /projects/ID, /library/ID, /review/ID, /skip/ID
- set_course con courseId: python-ia, python-datos o agentes-ia
- set_palette con palette: violet, ocean, sunset, night, forest o black
- set_sound con on: true o false
- speak con text: una frase para leer en voz alta
- status sin argumentos: pide el progreso actual
No inventes rutas. No pidas claves. No completes lecciones ni des la respuesta de un reto: explica la idea y deja que la persona la escriba.
Si no hace falta mover nada, responde en prosa, sin JSON.`;

export async function runPybot(input: {
  settings: AiSettings;
  history: AiMessage[];
  user: string;
  context: string;
  apply: (actions: PybotAction[]) => string;
}): Promise<{ say: string; history: AiMessage[] }> {
  const history = [...input.history, { role: "user" as const, content: input.user }];
  let say = "";
  for (let round = 0; round < 3; round++) {
    const raw = await sendChat(input.settings, [{ role: "system", content: `${SYSTEM}\n\nAhora mismo: ${input.context}` }, ...history]);
    const parsed = parsePybotReply(raw);
    history.push({ role: "assistant", content: raw });
    say = parsed.say;
    if (parsed.actions.length === 0) break;
    const notes = input.apply(parsed.actions);
    const needsStatus = parsed.actions.some((action) => action.tool === "status");
    if (!needsStatus && say) break;
    history.push({
      role: "user",
      content: `Resultado: ${notes || "hecho"}. Responde a la persona en español. Usa JSON solo si necesitas otra acción.`,
    });
  }
  return { say: say || "Listo.", history };
}
