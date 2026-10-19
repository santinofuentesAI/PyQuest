import type { CourseId, Exercise, ExerciseType, UserProgress } from "./types";
import { getCourseIdForUnit, getUnit, unitsForCourse } from "./curriculum";
import { unitAccess, unitIsIncluded } from "./courses";

export const SKIP_EXAM_SIZE = 20;
export const SKIP_EXAM_PASS = 16;

const QUESTION_TYPES = new Set<ExerciseType>([
  "multiple_choice",
  "fill_blank",
  "predict_output",
  "find_error",
  "matching",
]);

export type SkipExam = {
  targetUnitId: string;
  title: string;
  exercises: Exercise[];
};

export function priorUnits(unitId: string) {
  const courseId = getCourseIdForUnit(unitId);
  const target = getUnit(unitId);
  if (!courseId || !target) return [];
  return unitsForCourse(courseId).filter((unit) => unit.index < target.index);
}

export function canSkipToUnit(unitId: string, progress: UserProgress) {
  if (unitAccess(unitId, progress) !== "progression") return false;
  const courseId = getCourseIdForUnit(unitId);
  const units = courseId ? unitsForCourse(courseId) : [];
  const index = units.findIndex((unit) => unit.id === unitId);
  if (index <= 0 || !courseId) return false;
  if (!unitIsIncluded(courseId, index, progress)) return false;
  return buildSkipExam(unitId)?.exercises.length === SKIP_EXAM_SIZE;
}

export function skipExamPassed(score: number, total = SKIP_EXAM_SIZE) {
  return total >= SKIP_EXAM_SIZE && score >= SKIP_EXAM_PASS;
}

export function skipDifficultyLabel(difficulty: number) {
  if (difficulty <= 1) return "Fácil";
  if (difficulty === 2) return "Media";
  if (difficulty === 3) return "Media-alta";
  if (difficulty === 4) return "Difícil";
  return "Reto";
}

export function buildSkipExam(unitId: string): SkipExam | null {
  const target = getUnit(unitId);
  const courseId = getCourseIdForUnit(unitId);
  if (!target || !courseId) return null;
  const prior = priorUnits(unitId);
  if (prior.length === 0) return null;

  const pool = [
    ...prior.flatMap((unit) => unit.lessons.flatMap((lesson) => lesson.exercises)),
    ...skipExamBank(courseId),
  ];
  const picked = pickRamp(pool, SKIP_EXAM_SIZE);
  if (picked.length < SKIP_EXAM_SIZE) return null;

  return {
    targetUnitId: unitId,
    title: target.title,
    exercises: picked.map((exercise, index) => ({
      ...exercise,
      id: `skip:${unitId}:${index}:${exercise.id}`,
      xp: 0,
    })),
  };
}

function isQuestion(type: ExerciseType) {
  return QUESTION_TYPES.has(type);
}

function pickRamp(pool: Exercise[], size: number) {
  const seen = new Set<string>();
  const unique: Exercise[] = [];
  for (const exercise of pool) {
    const key = exercise.prompt;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(exercise);
  }
  unique.sort(
    (a, b) => a.difficulty - b.difficulty || Number(isQuestion(b.type)) - Number(isQuestion(a.type))
  );

  const questions = unique.filter((exercise) => isQuestion(exercise.type));
  const coding = unique.filter((exercise) => !isQuestion(exercise.type));
  const questionCount = Math.min(12, questions.length, size);
  const codeCount = Math.min(size - questionCount, coding.length);
  const picked = [...spread(questions, questionCount), ...spread(coding, codeCount)];
  const used = new Set(picked.map((exercise) => exercise.id));
  for (const exercise of unique) {
    if (picked.length >= size) break;
    if (used.has(exercise.id)) continue;
    picked.push(exercise);
  }
  picked.sort((a, b) => a.difficulty - b.difficulty);
  return picked.slice(0, size);
}

function spread(list: Exercise[], count: number) {
  if (count <= 0) return [];
  if (list.length <= count) return list.slice();
  const out: Exercise[] = [];
  for (let i = 0; i < count; i++) {
    out.push(list[Math.floor((i * list.length) / count)]!);
  }
  return out;
}

function skipExamBank(courseId: CourseId): Exercise[] {
  switch (courseId) {
    case "python-ia":
      return [];
    case "python-datos":
      return DATOS_BANK;
    case "agentes-ia":
      return AGENTES_BANK;
    default: {
      const neverCourse: never = courseId;
      return neverCourse;
    }
  }
}

const DATOS_BANK: Exercise[] = [
  {
    id: "skip-bank-da-1",
    type: "multiple_choice",
    prompt: "Una métrica sin `n` (cuántas filas la sostienen) es…",
    difficulty: 1,
    xp: 8,
    explanation: "Sin el recuento no sabes si el número viene de 3 filas o de 3.000.",
    solution: "Difícil de auditar",
    choices: [
      { id: "a", text: "Difícil de auditar" },
      { id: "b", text: "Más precisa" },
      { id: "c", text: "Automáticamente porcentual" },
    ],
    correctChoiceId: "a",
  },
  {
    id: "skip-bank-da-2",
    type: "multiple_choice",
    prompt: "¿Qué recorte hace comparable un total de ventas?",
    difficulty: 1,
    xp: 8,
    explanation: "El recorte nombra ventana y unidad. Sin eso, el total mezcla periodos.",
    solution: "Unidades vendidas en la semana 1",
    choices: [
      { id: "a", text: "Unidades vendidas en la semana 1" },
      { id: "b", text: "Ventas en general" },
      { id: "c", text: "Lo que salga en el gráfico" },
    ],
    correctChoiceId: "a",
  },
  {
    id: "skip-bank-da-3",
    type: "predict_output",
    prompt: "¿Salida?",
    difficulty: 2,
    xp: 8,
    explanation: "len cuenta observaciones; sum agrega la métrica.",
    solution: "2\n9",
    starterCode: "unidades = [4, 5]\nprint(len(unidades))\nprint(sum(unidades))",
    expectedStdout: "2\n9",
  },
  {
    id: "skip-bank-da-4",
    type: "fill_blank",
    prompt: "Completa el denominador de la media.",
    difficulty: 2,
    xp: 8,
    explanation: "La media divide el total entre n, no entre un número inventado.",
    solution: "len",
    template: "valores = [2, 4, 6]\nmedia = sum(valores) / ___(valores)",
    blanks: [{ accepted: ["len"] }],
  },
  {
    id: "skip-bank-da-5",
    type: "find_error",
    prompt: "¿Qué falla en este hallazgo?",
    difficulty: 2,
    xp: 8,
    explanation: "'Siempre' generaliza dos filas. El análisis se queda en lo observado.",
    solution: "Generaliza más allá de los datos",
    starterCode: "web, tienda = 4, 2\nprint('La web siempre vende el doble')",
    choices: [
      { id: "a", text: "Generaliza más allá de los datos" },
      { id: "b", text: "4 no es mayor que 2" },
      { id: "c", text: "Falta import numpy" },
    ],
    correctChoiceId: "a",
  },
  {
    id: "skip-bank-da-6",
    type: "code",
    prompt: "Con `canal = ['web', 'web', 'tienda']`, guarda `n` y `n_web`. Imprime `n` y, en la línea siguiente, `n_web`.",
    difficulty: 2,
    xp: 12,
    explanation: "n es el total de filas; n_web es el recorte. Los dos hacen auditable el porcentaje.",
    solution: "canal = ['web', 'web', 'tienda']\nn = len(canal)\nn_web = canal.count('web')\nprint(n)\nprint(n_web)",
    starterCode: "canal = ['web', 'web', 'tienda']\n",
    tests: [{ assert: "n == 3" }, { assert: "n_web == 2" }],
    expectedStdout: "3\n2",
  },
  {
    id: "skip-bank-da-7",
    type: "matching",
    prompt: "Empareja cada cifra con lo que comunica.",
    difficulty: 2,
    xp: 10,
    explanation: "El total, el n y la unidad contestan preguntas distintas.",
    solution: '{"l1": "r1", "l2": "r2", "l3": "r3"}',
    left: [
      { id: "l1", text: "n = 40" },
      { id: "l2", text: "total = 120" },
      { id: "l3", text: "unidad = kg" },
    ],
    right: [
      { id: "r1", text: "Cuántas filas hay" },
      { id: "r2", text: "La métrica agregada" },
      { id: "r3", text: "En qué se mide" },
    ],
    pairs: { l1: "r1", l2: "r2", l3: "r3" },
  },
  {
    id: "skip-bank-da-8",
    type: "multiple_choice",
    prompt: "¿Cuál es un KPI con denominador?",
    difficulty: 2,
    xp: 8,
    explanation: "Un KPI serio divide (unidades por pedido, tasa) y nombra el recorte.",
    solution: "Unidades por pedido en marzo (n = 80)",
    choices: [
      { id: "a", text: "Unidades por pedido en marzo (n = 80)" },
      { id: "b", text: "Un número grande en un titular" },
      { id: "c", text: "El color del gráfico" },
    ],
    correctChoiceId: "a",
  },
];

const AGENTES_BANK: Exercise[] = [
  {
    id: "skip-bank-ag-1",
    type: "multiple_choice",
    prompt: "El bucle mínimo de un agente es…",
    difficulty: 1,
    xp: 8,
    explanation: "Observa, decide, actúa y vuelve a observar. Un chat sin herramientas solo escribe una vez.",
    solution: "Observar → decidir → actuar → observar",
    choices: [
      { id: "a", text: "Observar → decidir → actuar → observar" },
      { id: "b", text: "Entrenar → publicar → olvidar" },
      { id: "c", text: "Preguntar al usuario en cada token" },
    ],
    correctChoiceId: "a",
  },
  {
    id: "skip-bank-ag-2",
    type: "multiple_choice",
    prompt: "Si el modelo inventa una herramienta que no existe, el harness debe…",
    difficulty: 1,
    xp: 8,
    explanation: "El harness es el recinto: rechaza lo que no está en el inventario.",
    solution: "Rechazarla y devolver un error observable",
    choices: [
      { id: "a", text: "Rechazarla y devolver un error observable" },
      { id: "b", text: "Inventar la herramienta al vuelo" },
      { id: "c", text: "Silenciar el fallo" },
    ],
    correctChoiceId: "a",
  },
  {
    id: "skip-bank-ag-3",
    type: "predict_output",
    prompt: "¿Salida?",
    difficulty: 2,
    xp: 8,
    explanation: "El despacho llama solo a herramientas registradas.",
    solution: "ok:stock",
    starterCode: "def ejecutar(nombre, argumento):\n    if nombre == 'buscar':\n        return 'ok:' + argumento\n    return 'error'\nprint(ejecutar('buscar', 'stock'))",
    expectedStdout: "ok:stock",
  },
  {
    id: "skip-bank-ag-4",
    type: "fill_blank",
    prompt: "Completa la parada por presupuesto.",
    difficulty: 2,
    xp: 8,
    explanation: "El agente para si terminó o si se acabaron los pasos.",
    solution: "pasos",
    template: "hecho = False\nmax_pasos = 3\npasos = 3\nparar = hecho or ___ >= max_pasos",
    blanks: [{ accepted: ["pasos"] }],
  },
  {
    id: "skip-bank-ag-5",
    type: "find_error",
    prompt: "¿Qué falla en este agente?",
    difficulty: 2,
    xp: 8,
    explanation: "Sin condición de parada, el bucle no es un agente controlado: es un while infinito.",
    solution: "No tiene condición de parada",
    starterCode: "while True:\n    print('otro paso')",
    choices: [
      { id: "a", text: "No tiene condición de parada" },
      { id: "b", text: "print no existe" },
      { id: "c", text: "Falta un GPU" },
    ],
    correctChoiceId: "a",
  },
  {
    id: "skip-bank-ag-6",
    type: "code",
    prompt: "Con `herramientas = {'eco': lambda t: t}`, guarda `n` y `eco`. Imprime `n` y, en la línea siguiente, `eco`.",
    difficulty: 2,
    xp: 12,
    explanation: "El inventario se cuenta y se llama. Eso es el despacho mínimo.",
    solution: "herramientas = {'eco': lambda t: t}\nn = len(herramientas)\neco = herramientas['eco']('mcp')\nprint(n)\nprint(eco)",
    starterCode: "herramientas = {'eco': lambda t: t}\n",
    tests: [{ assert: "n == 1" }, { assert: "eco == 'mcp'" }],
    expectedStdout: "1\nmcp",
  },
  {
    id: "skip-bank-ag-7",
    type: "matching",
    prompt: "Empareja cada pieza del recinto.",
    difficulty: 2,
    xp: 10,
    explanation: "Herramientas, presupuesto y parada son el harness, no el modelo.",
    solution: '{"l1": "r1", "l2": "r2", "l3": "r3"}',
    left: [
      { id: "l1", text: "Inventario" },
      { id: "l2", text: "Presupuesto" },
      { id: "l3", text: "Parada" },
    ],
    right: [
      { id: "r1", text: "Qué herramientas existen" },
      { id: "r2", text: "Cuántos pasos puede dar" },
      { id: "r3", text: "Cuándo deja de actuar" },
    ],
    pairs: { l1: "r1", l2: "r2", l3: "r3" },
  },
  {
    id: "skip-bank-ag-8",
    type: "multiple_choice",
    prompt: "¿Cuándo debe parar un agente bien diseñado?",
    difficulty: 2,
    xp: 8,
    explanation: "Termina por éxito, por error observable o porque se acabó el presupuesto.",
    solution: "Cuando la tarea está hecha, hay un error claro, o se acabaron los pasos",
    choices: [
      { id: "a", text: "Cuando la tarea está hecha, hay un error claro, o se acabaron los pasos" },
      { id: "b", text: "Nunca: más pasos siempre es mejor" },
      { id: "c", text: "Solo si el usuario cierra la pestaña" },
    ],
    correctChoiceId: "a",
  },
];
