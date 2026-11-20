import type { QuizDifficulty } from "@/utils/quizEngine";

const STORAGE_KEY = "flowfret.quiz-progress.v1";

export interface QuizBest {
  correct: number;
  total: number;
  percent: number;
}

export type QuizProgress = Partial<Record<QuizDifficulty, QuizBest>>;

const DIFFICULTIES: readonly QuizDifficulty[] = ["basic", "advanced"];

function isBest(value: unknown): value is QuizBest {
  if (!value || typeof value !== "object") return false;
  const { correct, total, percent } = value as Record<string, unknown>;
  return (
    Number.isInteger(correct) &&
    Number.isInteger(total) &&
    Number.isInteger(percent) &&
    (total as number) > 0 &&
    (correct as number) >= 0 &&
    (correct as number) <= (total as number)
  );
}

export function readQuizProgress(): QuizProgress {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object") return {};
    const record = parsed as Record<string, unknown>;
    return Object.fromEntries(
      DIFFICULTIES.flatMap((difficulty) => (isBest(record[difficulty]) ? [[difficulty, record[difficulty]]] : [])),
    ) as QuizProgress;
  } catch {
    return {};
  }
}

/** Saves the score when it beats the stored best for that difficulty. Returns the progress and whether it is a record. */
export function recordQuizResult(
  difficulty: QuizDifficulty,
  score: QuizBest,
): { progress: QuizProgress; isRecord: boolean } {
  const progress = readQuizProgress();
  const best = progress[difficulty];
  const isRecord = score.total > 0 && (!best || score.percent > best.percent);
  if (!isRecord) return { progress, isRecord: false };
  const next: QuizProgress = { ...progress, [difficulty]: score };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* Storage is optional. */
  }
  return { progress: next, isRecord: true };
}
