import type { CheckResult, Exercise } from "./types";
import { runPython } from "./python-runtime";

function norm(s: string) {
  return s.replace(/\r\n/g, "\n").replace(/\t/g, " ").trim();
}

function compact(s: string) {
  return norm(s).replace(/\s+/g, " ").replace(/['"]/g, '"');
}

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
          : "No es esa. Revisa el enunciado y vuelve a intentarlo.",
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
        feedback: correct ? exercise.explanation : "Hay al menos un empareje incorrecto.",
      };
    }
    case "reorder": {
      if (answer.type !== "order" || !exercise.correctOrder) {
        return { correct: false, feedback: "Ordena todos los bloques." };
      }
      const correct =
        answer.ids.length === exercise.correctOrder.length &&
        answer.ids.every((id, i) => id === exercise.correctOrder![i]);
      return {
        correct,
        feedback: correct ? exercise.explanation : "El orden todavía no es el correcto.",
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
      return { correct: false, feedback: "Ese hueco no coincide con la solución esperada." };
    }
    case "predict_output": {
      if (answer.type !== "text") {
        return { correct: false, feedback: "Escribe la salida." };
      }
      const value = norm(answer.value);
      const accepted = (exercise.acceptedOutputs ?? [exercise.expectedStdout ?? ""]).map(norm);
      const correct = accepted.some((a) => a === value);
      return {
        correct,
        feedback: correct ? exercise.explanation : `La salida no coincide. Esperábamos algo como: ${accepted[0]}`,
      };
    }
    case "code":
    case "data": {
      if (answer.type !== "code") {
        return { correct: false, feedback: "Escribe código." };
      }
      const result = await runPython({
        code: answer.code,
        tests: testsToCode(exercise),
        files: exercise.files,
        packages: exercise.packages,
        capturePlots: exercise.capturePlots,
      });
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
        const stdoutOk = got === expected;
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
        return {
          correct: false,
          feedback: `Tu código lanzó un error:\n${friendly}`,
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
