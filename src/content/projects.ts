export type CareerProject = {
  id: string;
  level: "Empieza" | "Portafolio" | "Cliente";
  title: string;
  client: string;
  question: string;
  outcome: string;
  skills: string[];
  hours: string;
  price: string;
  deliverables: string[];
  milestones: string[];
  pitch: string;
};

export const careerProjects: CareerProject[] = [
  {
    id: "ventas",
    level: "Empieza",
    title: "Radiografía de ventas",
    client: "Cafetería, tienda o emprendimiento local",
    question: "¿Qué se vende, cuándo y qué producto merece atención?",
    outcome: "Un reporte claro con tres hallazgos y una recomendación accionable.",
    skills: ["Python", "Pandas", "gráficos", "insights"],
    hours: "3–5 horas",
    price: "Piloto guía: ₡25k–₡60k",
    deliverables: ["CSV limpio y diccionario de columnas", "3 gráficos que responden una pregunta", "Resumen de una página", "Video de 2 minutos explicando el resultado"],
    milestones: ["Definir la decisión que el negocio quiere tomar", "Limpiar fechas, montos y productos", "Encontrar un patrón y verificarlo", "Comunicar una recomendación concreta"],
    pitch: "Vi que llevan ventas y puedo convertir ese registro en un reporte corto: qué se vende más, qué día conviene reforzar y una recomendación clara. Primero hago un piloto pequeño con datos anonimizados; si te sirve, definimos el siguiente paso.",
  },
  {
    id: "clientes",
    level: "Portafolio",
    title: "Segmentos que sí se pueden usar",
    client: "Negocio con clientes, pedidos o membresías",
    question: "¿Qué grupos de clientes se comportan distinto y qué hacer con cada uno?",
    outcome: "Una segmentación explicada sin jerga, con una acción propuesta por grupo.",
    skills: ["Pandas", "scikit-learn", "K-Means", "storytelling"],
    hours: "5–8 horas",
    price: "Piloto guía: ₡45k–₡90k",
    deliverables: ["Variables justificadas", "Gráfico de segmentos", "Ficha de cada grupo", "Plan de acción de una semana"],
    milestones: ["Acordar qué significa un buen cliente", "Escalar y probar agrupaciones", "Nombrar los grupos con evidencia", "Presentar acciones, no solo clusters"],
    pitch: "Puedo revisar los datos de compras para encontrar grupos útiles, por ejemplo clientes frecuentes, en riesgo o de alto valor. No entrego solo un algoritmo: entrego una ficha clara con qué acción tomar para cada grupo.",
  },
  {
    id: "demanda",
    level: "Portafolio",
    title: "Pronóstico de demanda semanal",
    client: "Restaurante, tienda o negocio con inventario",
    question: "¿Cuánto deberíamos preparar o comprar la próxima semana?",
    outcome: "Una predicción simple comparada contra una referencia honesta.",
    skills: ["series de tiempo", "baseline", "métricas", "visualización"],
    hours: "6–10 horas",
    price: "Piloto guía: ₡60k–₡120k",
    deliverables: ["Serie temporal limpia", "Baseline y métrica de error", "Pronóstico con intervalo", "Lista de límites y supuestos"],
    milestones: ["Comprobar que la fecha esté completa", "Crear una predicción base", "Medir antes de prometer precisión", "Traducir la predicción a una decisión de inventario"],
    pitch: "Con tus ventas históricas puedo preparar un pronóstico semanal para apoyar compras o producción. Empezamos comparándolo con una regla simple para saber si realmente mejora la decisión; te muestro el error y los límites, no una promesa vacía.",
  },
  {
    id: "reporte",
    level: "Cliente",
    title: "Reporte automático para gerencia",
    client: "Pyme que repite el mismo reporte cada semana",
    question: "¿Cómo quitar trabajo manual sin perder control sobre los números?",
    outcome: "Un flujo reproducible que genera un reporte y deja trazabilidad.",
    skills: ["Python", "automatización", "validación", "documentación"],
    hours: "8–14 horas",
    price: "Piloto guía: ₡80k–₡160k",
    deliverables: ["Archivo de entrada documentado", "Script reproducible", "Reporte exportable", "Manual de uso y video de entrega"],
    milestones: ["Mapear el proceso actual y sus errores", "Definir un único formato de entrada", "Agregar validaciones antes del reporte", "Entregar con una demostración y plan de soporte"],
    pitch: "Puedo convertir el reporte repetitivo que hoy hacen a mano en un flujo de Python que valida el archivo y genera un resumen consistente. Primero documento el proceso actual y preparo un piloto; así sabes exactamente qué se automatiza y qué sigue siendo una revisión humana.",
  },
];

export const offerSteps = [
  ["1. Muestra evidencia", "Publica un caso corto: problema, datos simulados o autorizados, tres hallazgos y una recomendación."],
  ["2. Ofrece un piloto pequeño", "Vende una decisión concreta, no ‘IA para todo’. Aclara alcance, plazo, datos necesarios y una sola entrega."],
  ["3. Mide y cierra", "Enseña antes/después: horas ahorradas, error reducido o pregunta respondida. Pide permiso para usar el caso en tu portafolio."],
] as const;
