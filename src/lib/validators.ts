import type { CheckResult, Exercise } from "./types";
import { runPython } from "./python-runtime";
import { normalizeOutput as norm, normalizeFragment as compact, outputMatches } from "./answer-utils";

function testsToCode(exercise: Exercise) {
  if (!exercise.tests?.length) return "";
  return exercise.tests
    .map((t) => {
      const msg = t.message ? `, ${JSON.stringify(t.message)}` : "";
      const setup = t.setup ? `${t.setup}\n` : "";
      return `${setup}assert ${t.assert.replace(/^assert\s+/, "")}${msg}`;
    })
    .join("\n");
}

function fillCode(template: string, blanks: string[]) {
  let i = 0;
  return template.replace(/___/g, () => blanks[i++] ?? "");
}

export type UserAnswer =
  | { type: "choice"; id: string }
  | { type: "blanks"; values: string[] }
  | { type: "code"; code: string }
  | { type: "order"; ids: string[] }
  | { type: "match"; pairs: Record<string, string> }
  | { type: "text"; value: string };

export async function checkExercise(
  exercise: Exercise,
  answer: UserAnswer
): Promise<CheckResult> {
  switch (exercise.type) {
    case "multiple_choice":
    case "find_error": {
      if (answer.type !== "choice") {
        return { correct: false, feedback: "Selecciona una opción." };
      }
      const correct = answer.id === exercise.correctChoiceId;
      return {
        correct,
        feedback: correct
          ? exercise.explanation
          : `Revisa la idea: ${exercise.explanation}`,
      };
    }
    case "matching": {
      if (answer.type !== "match" || !exercise.pairs) {
        return { correct: false, feedback: "Empareja todos los conceptos." };
      }
      const keys = Object.keys(exercise.pairs);
      const correct = keys.every((k) => answer.pairs[k] === exercise.pairs![k]);
      return {
        correct,
        feedback: correct ? exercise.explanation : `Revisa “${exercise.left?.find((x) => answer.pairs[x.id] !== exercise.pairs![x.id])?.text ?? "los conceptos"}”. ${exercise.explanation}`,
      };
    }
    case "token_order":
    case "reorder": {
      if (answer.type !== "order" || !exercise.correctOrder) {
        return { correct: false, feedback: "Ordena todos los bloques." };
      }
      const correct =
        answer.ids.length === exercise.correctOrder.length &&
        (exercise.type === "token_order"
          ? new Set(answer.ids).size === answer.ids.length &&
            answer.ids.every((id) => exercise.blocks?.some((b) => b.id === id)) &&
            answer.ids.map((id) => exercise.blocks!.find((b) => b.id === id)!.code).join("") === exercise.solution
          : answer.ids.every((id, i) => id === exercise.correctOrder![i]));
      return {
        correct,
        feedback: correct ? exercise.explanation : `El orden todavía no es el correcto. ${exercise.hint ?? exercise.explanation}`,
      };
    }
    case "fill_blank": {
      if (answer.type !== "blanks" || !exercise.blanks || !exercise.template) {
        return { correct: false, feedback: "Completa los huecos." };
      }
      const ok = exercise.blanks.every((blank, i) => {
        const value = compact(answer.values[i] ?? "");
        return blank.accepted.some((a) => compact(a) === value);
      });
      if (ok) return { correct: true, feedback: exercise.explanation };
      const i = exercise.blanks.findIndex((blank, i) => !blank.accepted.some((a) => compact(a) === compact(answer.values[i] ?? "")));
      return { correct: false, feedback: `Revisa el hueco ${i + 1}. ${exercise.hint ?? "Piensa qué función o valor necesita esa parte de la instrucción."}` };
    }
    case "trace": {
      if (answer.type !== "match" || !exercise.traceSteps?.length) return { correct: false, feedback: "Responde cada paso del programa." };
      const i = exercise.traceSteps.findIndex((step, i) => answer.pairs[String(i)] !== step.correctChoiceId);
      return i < 0
        ? { correct: true, feedback: exercise.explanation }
        : { correct: false, feedback: `Revisa el paso ${i + 1} (línea ${exercise.traceSteps[i].line}). ${exercise.traceSteps[i].explanation}` };
    }
    case "predict_output": {
      if (answer.type !== "text") {
        return { correct: false, feedback: "Escribe la salida." };
      }
      const value = norm(answer.value);
      const accepted = (exercise.acceptedOutputs ?? [exercise.expectedStdout ?? ""]).map(norm);
      const correct = accepted.some((a) => outputMatches(value, a, exercise.outputComparison));
      return {
        correct,
        feedback: correct ? exercise.explanation : "La salida no coincide. Sigue las instrucciones de arriba abajo y comprueba los espacios y los saltos de línea.",
      };
    }
    case "code":
    case "data": {
      if (answer.type !== "code") {
        return { correct: false, feedback: "Escribe código." };
      }
      let result;
      try { result = await runPython({
        code: answer.code,
        tests: testsToCode(exercise),
        files: exercise.files,
        packages: exercise.packages,
        capturePlots: exercise.capturePlots,
      }); } catch {
        return { correct: false, retryable: true, feedback: "Python no pudo cargar o perdió la conexión. Reintenta; este fallo no consume corazones." };
      }
      if (result.timedOut) {
        return {
          correct: false,
          feedback: result.error ?? "Tiempo agotado.",
          stdout: result.stdout,
          error: result.error,
        };
      }
      if (exercise.expectedStdout != null && !result.error) {
        const got = norm(result.stdout);
        const expected = norm(exercise.expectedStdout);
        const stdoutOk = outputMatches(got, expected, exercise.outputComparison);
        if (!stdoutOk) {
          return {
            correct: false,
            feedback: `La salida no coincide.\nEsperada:\n${expected}\nObtenida:\n${got || "(vacía)"}`,
            stdout: result.stdout,
            stderr: result.stderr,
            images: result.images,
          };
        }
      }
      if (result.error) {
        const friendly = result.error.replace(/PythonError:\s*/g, "").split("\n").filter(Boolean).slice(-4).join("\n");
        const guidance = /IndentationError|TabError/.test(friendly) ? "Revisa la indentación: usa cuatro espacios para cada nivel del bloque."
          : /SyntaxError/.test(friendly) ? "Revisa paréntesis, comillas y los dos puntos al abrir un bloque."
          : /NameError/.test(friendly) ? "Comprueba que el nombre esté bien escrito y definido antes de usarlo."
          : /TypeError/.test(friendly) ? "Comprueba los tipos de los valores que estás combinando."
          : /AssertionError/.test(friendly) ? "El programa ejecutó, pero el resultado no cumple el objetivo. Revisa las variables que pide el enunciado."
          : "Lee la última línea del error y vuelve al cálculo que la provocó.";
        return {
          correct: false,
          feedback: `${guidance}\n\n${friendly}`,
          stdout: result.stdout,
          stderr: result.stderr,
          error: result.error,
          images: result.images,
        };
      }
      return {
        correct: true,
        feedback: exercise.explanation,
        stdout: result.stdout,
        images: result.images,
      };
    }
    default:
      return { correct: false, feedback: "Tipo de ejercicio no soportado." };
  }
}

export function assembleFillBlank(exercise: Exercise, values: string[]) {
  if (!exercise.template) return "";
  return fillCode(exercise.template, values);
}
