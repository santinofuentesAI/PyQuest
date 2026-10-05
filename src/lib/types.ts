export type ExerciseType =
  | "multiple_choice"
  | "fill_blank"
  | "code"
  | "reorder"
  | "find_error"
  | "predict_output"
  | "data"
  | "matching"
  | "token_order"
  | "trace";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type Choice = {
  id: string;
  text: string;
};

export type CodeTest = {
  setup?: string;
  assert: string;
  message?: string;
};

export type Exercise = {
  id: string;
  type: ExerciseType;
  prompt: string;
  difficulty: Difficulty;
  xp: number;
  hint?: string;
  explanation: string;
  /** Reference solution shown after a failed attempt or in review. */
  solution: string;
  /** Multiple choice / find-error options. */
  choices?: Choice[];
  correctChoiceId?: string;
  /** Fill-in-the-blank: code with ___ placeholders. */
  template?: string;
  blanks?: { accepted: string[] }[];
  /** Code-from-scratch / data / find-error (fix) starter. */
  starterCode?: string;
  tests?: CodeTest[];
  expectedStdout?: string;
  /** Hidden files mounted into the Pyodide FS (e.g. CSVs). */
  files?: Record<string, string>;
  /** Reorder blocks. */
  blocks?: { id: string; code: string }[];
  correctOrder?: string[];
  /** Matching pairs. */
  left?: { id: string; text: string }[];
  right?: { id: string; text: string }[];
  pairs?: Record<string, string>;
  /** Predict-output accepted answers (normalized). */
  acceptedOutputs?: string[];
  /** Optional packages to micropip-install before running. */
  packages?: string[];
  /** If true, matplotlib figures are captured. */
  capturePlots?: boolean;
  /** Numeric comparison is opt-in; text output remains exact. */
  outputComparison?: "exact" | "numeric";
  /** Distractors for the optional word bank; accepted answers are included by the UI. */
  wordBank?: string[];
  /** Trace a program through authored, independently checked checkpoints. */
  traceSteps?: {
    line: number;
    question: string;
    choices: Choice[];
    correctChoiceId: string;
    explanation: string;
    /** Assertion used to verify this checkpoint against starterCode. */
    assert: string;
  }[];
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  xp: number;
  exercises: Exercise[];
  /** 1 = camino principal. 2–4 = niveles extra para afianzar el tema. */
  level?: 1 | 2 | 3 | 4;
};

export type Unit = {
  id: string;
  index: number;
  title: string;
  description: string;
  icon: string;
  isProject?: boolean;
  isTemplate?: boolean;
  lessons: Lesson[];
};

export type Section = {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  color: string;
  accent: string;
  units: Unit[];
};

export type BadgeDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: "unit" | "streak" | "xp" | "section" | "placement" | "perfect";
  value: string | number;
};

export type Curriculum = {
  sections: Section[];
  badges: BadgeDef[];
  placementLessonId: string;
};

export type LeagueId =
  | "bronze"
  | "silver"
  | "gold"
  | "sapphire"
  | "ruby"
  | "diamond";

export type LessonResult = {
  lessonId: string;
  completedAt: string;
  correct: number;
  total: number;
  xp: number;
  perfect: boolean;
};

export type UnitProgress = {
  strength: number;
  lastPracticedAt: string | null;
  completedLessonIds: string[];
};

export type UserProgress = {
  displayName: string;
  onboarded: boolean;
  placementDone: boolean;
  placementScore: number | null;
  startingUnitId: string;
  xp: number;
  gems: number;
  hearts: number;
  heartsUpdatedAt: number;
  streak: number;
  lastPracticeDate: string | null;
  streakFreezes: number;
  freezeUsedToday: boolean;
  weeklyXp: number;
  weekId: string;
  league: LeagueId;
  completedLessons: Record<string, LessonResult>;
  units: Record<string, UnitProgress>;
  badges: string[];
  legendaryHighScore: number;
  theme: "light" | "dark" | "system";
  /** Full-app color pack. Independent of OS light/dark. */
  palette: import("./palettes").PaletteId;
  soundEnabled: boolean;
  redeemedCodes: string[];
};

export type PythonRunResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  error: string | null;
  images: string[];
  timedOut?: boolean;
};

export type CheckResult = {
  correct: boolean;
  feedback: string;
  stdout?: string;
  stderr?: string;
  images?: string[];
  error?: string | null;
  /** Runtime/network failure: retry without spending hearts or affecting the score. */
  retryable?: boolean;
};
