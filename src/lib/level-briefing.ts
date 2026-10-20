import type { LessonGuide } from "./lesson-guides";
import type { Lesson, Unit } from "./types";

export type BriefSlide = {
  label: string;
  kind: "text" | "code" | "practice";
  kicker: string;
  title: string;
  body: string;
};

/** Opening level of a module explains the theme. Later levels only explain themselves. */
export function levelBriefing(lesson: Lesson, unit: Unit, guide?: LessonGuide, showCode = false): BriefSlide[] {
  const opensModule = unit.lessons[0]?.id === lesson.id;
  const practice: BriefSlide = {
    label: "A practicar",
    kind: "practice",
    kicker: "Ahora te toca",
    title: "A practicar",
    body: "Los retos son de este nivel. Si quieres leer más, la librería está en el menú y no hace falta para esta clase.",
  };
  const level: BriefSlide = {
    label: "Este nivel",
    kind: "text",
    kicker: "Este nivel",
    title: "Qué vas a hacer",
    body: lesson.description,
  };

  const agents = unit.id.startsWith("ag");
  const example: BriefSlide = {
    label: "El ejemplo",
    kind: "code",
    kicker: agents ? "Mira el ejemplo" : "Mira el código",
    title: agents ? "Así se escribe" : "¿Qué mostrará Python?",
    body: agents
      ? "Es un prompt o un contrato. Léelo de arriba abajo y luego practícalo, sin pasar por la librería."
      : "Lee el ejemplo de arriba abajo. Luego lo practicas, sin pasar por la librería.",
  };

  if (!opensModule || !guide) return showCode ? [level, example, practice] : [level, practice];

  const ideas: BriefSlide[] = guide.steps.map((step, index) => ({
    label: `Idea ${index + 1}`,
    kind: "text",
    kicker: "Una idea",
    title: `Idea ${index + 1}`,
    body: step,
  }));

  return [
    level,
    {
      label: "El tema",
      kind: "text",
      kicker: "El tema",
      title: "En pocas palabras",
      body: guide.concept,
    },
    ...ideas,
    {
      label: "Ojo",
      kind: "text",
      kicker: "Ojo",
      title: "Un detalle",
      body: guide.caution,
    },
    example,
    practice,
  ];
}
