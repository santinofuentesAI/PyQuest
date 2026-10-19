import type { CourseId } from "@/lib/types";

export type CourseCatalogEntry = {
  id: CourseId;
  title: string;
  kicker: string;
  tagline: string;
  description: string;
  audience: string;
  includes: string[];
  comingSoon: string;
  /** First N units of the course are playable without paying. */
  freeUnitCount: number;
  priceUsd: number;
  accent: string;
  icon: string;
};

/** Consumer one-time price per course. Schools and bootcamps are a separate seat quote. */
export const COURSE_PRICE_USD = 25;

export const COURSE_CATALOG: CourseCatalogEntry[] = [
  {
    id: "python-ia",
    title: "Python para IA",
    kicker: "Camino completo",
    tagline: "De print() a un modelo, con NumPy, Pandas y las librerías en el navegador.",
    description:
      "El trayecto original de PyQuest: fundamentos, datos, visualización, estadística, machine learning y deep learning, con proyectos semi-reales y Python ejecutado aquí mismo.",
    audience: "Quien quiere programar para datos e inteligencia artificial, desde cero o con test de nivel.",
    includes: [
      "53 temas con lecciones interactivas",
      "NumPy, Pandas, Matplotlib y scikit-learn en el laboratorio",
      "Encargos tipo oficina y portafolio",
    ],
    comingSoon: "Collabs y laboratorios con partners de industria.",
    freeUnitCount: 3,
    priceUsd: COURSE_PRICE_USD,
    accent: "#7c3aed",
    icon: "brain",
  },
  {
    id: "python-datos",
    title: "Python para análisis de datos",
    kicker: "Nuevo",
    tagline: "Preguntar, limpiar y comunicar hallazgos con evidencia (n, recorte, unidad).",
    description:
      "Énfasis en el oficio del analista: una pregunta, una tabla, un KPI con denominador, limpieza que no esconde nulos y un informe que se puede auditar. Los primeros tres temas ya están listos.",
    audience: "Quien viene de hojas de cálculo o quiere el hábito de un analista, no solo la sintaxis.",
    includes: [
      "3 temas de cero a un insight de dos semanas",
      "CSV, pandas y gráficos con títulos honestos",
      "Guías paso a paso distintas de los ejercicios calificados",
    ],
    comingSoon: "Más unidades: cohortes, métricas de producto y collabs con datasets reales.",
    freeUnitCount: 1,
    priceUsd: COURSE_PRICE_USD,
    accent: "#0f766e",
    icon: "table",
  },
  {
    id: "agentes-ia",
    title: "Agentes de IA",
    kicker: "Nuevo",
    tagline: "MCP, skills y harness: de un chat a un agente que usa herramientas con límites.",
    description:
      "Aprende el bucle observar–decidir–actuar, el contrato de MCP (host, client, server, tools, resources, prompts) y cómo una skill vive dentro de un harness con permisos, parada y evals.",
    audience: "Quien ya habla con modelos y quiere construir agentes serios, interactivos y evaluables.",
    includes: [
      "3 temas: agente, MCP, skills y harness",
      "Ejercicios con contratos JSON y Python ejecutable",
      "Evals con resultado esperado y presupuesto de pasos",
    ],
    comingSoon: "Servidores MCP de ejemplo, skills de collab y un harness más completo.",
    freeUnitCount: 1,
    priceUsd: COURSE_PRICE_USD,
    accent: "#c2410c",
    icon: "bot",
  },
];

export function getCourseEntry(id: CourseId) {
  return COURSE_CATALOG.find((c) => c.id === id)!;
}
