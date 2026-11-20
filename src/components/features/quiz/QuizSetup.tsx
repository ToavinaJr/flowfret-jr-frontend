import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { QuizProgress } from "@/services/quizProgress";
import { ALL_QUIZ_KINDS, type QuizDifficulty, type QuizKind } from "@/utils/quizEngine";

const DIFFICULTIES: readonly QuizDifficulty[] = ["basic", "advanced"];

interface QuizSetupProps {
  kinds: readonly QuizKind[];
  difficulty: QuizDifficulty;
  progress: QuizProgress;
  onKindsChange: (kinds: QuizKind[]) => void;
  onDifficultyChange: (difficulty: QuizDifficulty) => void;
  onStart: () => void;
}

export function QuizSetup({ kinds, difficulty, progress, onKindsChange, onDifficultyChange, onStart }: QuizSetupProps) {
  const { t } = useTranslation();

  function toggleKind(kind: QuizKind) {
    onKindsChange(kinds.includes(kind) ? kinds.filter((current) => current !== kind) : [...kinds, kind]);
  }

  return (
    <div className="space-y-5">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">{t("quiz.setup.kinds")}</legend>
        {ALL_QUIZ_KINDS.map((kind) => (
          <label
            key={kind}
            className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-primary"
              checked={kinds.includes(kind)}
              onChange={() => toggleKind(kind)}
            />
            <span>
              <span className="block text-sm font-medium text-foreground">{t(`quiz.kinds.${kind}.title`)}</span>
              <span className="block text-xs text-muted-foreground">{t(`quiz.kinds.${kind}.description`)}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">{t("quiz.setup.difficulty")}</legend>
        <div className="grid grid-cols-2 gap-2">
          {DIFFICULTIES.map((level) => {
            const best = progress[level];
            return (
              <label
                key={level}
                className={`flex min-h-12 cursor-pointer flex-col justify-center rounded-lg border p-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${
                  difficulty === level ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <input
                  type="radio"
                  name="quiz-difficulty"
                  className="sr-only"
                  checked={difficulty === level}
                  onChange={() => onDifficultyChange(level)}
                />
                <span className="text-sm font-medium text-foreground">{t(`quiz.setup.${level}`)}</span>
                <span className="text-xs text-muted-foreground">{t(`quiz.setup.${level}Hint`)}</span>
                {best && (
                  <span className="mt-1 text-xs text-muted-foreground">
                    {t("quiz.setup.best", { correct: best.correct, total: best.total })}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      {kinds.length === 0 && <p className="text-sm text-destructive">{t("quiz.setup.noKind")}</p>}
      <Button type="button" className="min-h-11 w-full sm:w-auto" disabled={kinds.length === 0} onClick={onStart}>
        {t("quiz.setup.start")}
      </Button>
    </div>
  );
}
