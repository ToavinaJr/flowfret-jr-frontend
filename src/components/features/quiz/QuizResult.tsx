import { Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { scoreQuiz } from "@/utils/quizEngine";

interface QuizResultProps {
  results: readonly boolean[];
  isRecord: boolean;
  onReplay: () => void;
  onChangeSettings: () => void;
}

export function QuizResult({ results, isRecord, onReplay, onChangeSettings }: QuizResultProps) {
  const { t } = useTranslation();
  const { correct, total, percent } = scoreQuiz(results);

  return (
    <section aria-labelledby="quiz-result-title" className="space-y-4 text-center">
      <Trophy className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
      <h2 id="quiz-result-title" className="text-lg font-semibold text-foreground">
        {t("quiz.result.title")}
      </h2>
      <p className="text-3xl font-bold text-foreground" data-testid="quiz-score">
        {t("quiz.result.score", { correct, total })}
      </p>
      <p className="text-sm text-muted-foreground">{t("quiz.result.percent", { percent })}</p>
      {isRecord && <p className="text-sm font-medium text-primary">{t("quiz.result.record")}</p>}
      <ol className="flex flex-wrap justify-center gap-1.5" aria-label={t("quiz.result.details")}>
        {results.map((ok, index) => (
          <li
            key={index}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
              ok ? "bg-green-600/20 text-green-700 dark:text-green-400" : "bg-destructive/20 text-destructive"
            }`}
            aria-label={t(ok ? "quiz.result.itemCorrect" : "quiz.result.itemWrong", { number: index + 1 })}
          >
            {index + 1}
          </li>
        ))}
      </ol>
      <div className="flex flex-col justify-center gap-2 sm:flex-row">
        <Button type="button" className="min-h-11" onClick={onReplay}>
          {t("quiz.result.replay")}
        </Button>
        <Button type="button" variant="secondary" className="min-h-11" onClick={onChangeSettings}>
          {t("quiz.result.changeSettings")}
        </Button>
      </div>
    </section>
  );
}
