import type { LibraryArticle } from "./library";

function a(
  id: string,
  title: string,
  kicker: string,
  minutes: number,
  blocks: LibraryArticle["blocks"]
): LibraryArticle {
  return { id, unitId: id, title, kicker, minutes, blocks };
}

export const TRACK_LIBRARY: LibraryArticle[] = [
  a("da1", "Preguntas que un dato puede responder", "Análisis de datos", 7, [
    { type: "p", text: "Un análisis no empieza por el gráfico. Empieza por una pregunta con recorte (qué periodo o grupo), una métrica y un denominador n. Sin n, un 12 es un adorno." },
    { type: "h", text: "Fila, columna, métrica" },
    { type: "glossary", items: [
      { term: "Fila", def: "Una observación: un pedido, un día, una persona." },
      { term: "Columna", def: "La misma variable medida en cada fila." },
      { term: "Métrica", def: "El número que resume la pregunta (suma, media, tasa)." },
    ] },
    { type: "code", code: "ventas = [4, 2, 6]\nn = len(ventas)\nprint(n, sum(ventas) / n)", caption: "n y media juntos." },
    { type: "callout", tone: "warn", text: "No dividas si n es 0. Una lista vacía no tiene media." },
  ]),
  a("da2", "Limpiar sin esconder el sucio", "Análisis de datos", 8, [
    { type: "p", text: "Un NaN no es un cero. Cero es una medición; NaN es 'no sé'. Si imputas o borras, cuenta cuántas filas tocaste." },
    { type: "code", code: "import pandas as pd\ns = pd.Series([4.0, None, 6.0])\nprint(int(s.isna().sum()))\nprint(s.mean())", caption: "1 nulo; la media usa n efectivo = 2." },
    { type: "h", text: "Agrupar con el tamaño a cuestas" },
    { type: "p", text: "groupby separa. size/count dice de cuántas filas habla cada grupo. Un 100% de n=1 no es una ley." },
    { type: "callout", tone: "tip", text: "to_numeric(..., errors='coerce') convierte basura en NaN. Después decides." },
  ]),
  a("da3", "Contar el hallazgo", "Análisis de datos", 7, [
    { type: "p", text: "Barras comparan categorías. El título dice el hallazgo, no el nombre de la columna. El eje Y nombra la unidad." },
    { type: "code", code: "casos, total = 3, 12\nprint(f'{casos} de {total}: {casos / total * 100:.0f}%')", caption: "El 25% se puede auditar." },
    { type: "callout", tone: "warn", text: "Truncar el eje de una barra de 10.0 vs 10.2 convierte un empate en un abismo." },
    { type: "list", items: ["Hallazgo", "Evidencia (n)", "Límite (qué no afirma)"] },
  ]),
  a("ag1", "De un chat a un agente", "Agentes de IA", 8, [
    { type: "p", text: "Un LLM completa texto. Un agente observa, elige una herramienta registrada, actúa y vuelve a leer el resultado. Ese bucle necesita una condición de parada." },
    { type: "code", code: "def ejecutar(nombre, argumento):\n    if nombre == 'buscar':\n        return 'ok:' + argumento\n    return 'error:tool'\nprint(ejecutar('buscar', 'ventas'))", caption: "Actuar es llamar; el return es la nueva observación." },
    { type: "callout", tone: "idea", text: "Para cuando la tarea está hecha, el usuario lo pide, o se acaba el presupuesto de pasos." },
  ]),
  a("ag2", "MCP: herramientas con contrato", "Agentes de IA", 8, [
    { type: "p", text: "Model Context Protocol separa el host (IDE, chat) del servidor que toca el mundo. El servidor declara tools, resources y prompts. El modelo no inventa nombres." },
    { type: "glossary", items: [
      { term: "Tool", def: "Acción con efectos: leer un issue, escribir un archivo." },
      { term: "Resource", def: "Dato legible con URI, sin ejecutarlo." },
      { term: "Prompt", def: "Plantilla reutilizable de instrucciones." },
    ] },
    { type: "code", code: "tool = {'name': 'leer_archivo', 'inputSchema': {'required': ['path']}}\nprint(tool['inputSchema']['required'])", caption: "El schema es el contrato." },
    { type: "callout", tone: "tip", text: "Un server MCP se puede enchufar a varios hosts. Un plugin ad hoc, no." },
  ]),
  a("ag3", "Skills y harness", "Agentes de IA", 8, [
    { type: "p", text: "Una skill es un playbook (cuándo usarla, pasos, tools). El harness es el runtime: permisos, reintentos, memoria y parada. La eval compara el artefacto y el presupuesto." },
    { type: "code", code: "permitidas = {'leer', 'resumir'}\nprint('borrar' in permitidas)\nprint('n=3' == 'n=3' and 2 <= 4)", caption: "Permiso negado; eval de contenido y de pasos." },
    { type: "list", items: ["Skill: procedimiento estable (como un SKILL.md)", "Harness: mínimo privilegio y stop conditions", "Eval: input, esperado, límite de pasos"] },
    { type: "callout", tone: "warn", text: "Si acertó usando una tool prohibida, no es un aprobado: aprieta los permisos." },
  ]),
];
