import { useState } from "react";
import { useTranslation } from "react-i18next";
import { QuizQuestionView } from "@/components/features/quiz/QuizQuestionView";
import { QuizResult } from "@/components/features/quiz/QuizResult";
import { QuizSetup } from "@/components/features/quiz/QuizSetup";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { useNotation } from "@/contexts/useNotation";
import { useQuizSession } from "@/hooks/useQuizSession";
import { readQuizProgress, recordQuizResult, type QuizProgress } from "@/services/quizProgress";
import {
  ALL_QUIZ_KINDS,
  generateQuiz,
  scoreQuiz,
  type QuizDifficulty,
  type QuizKind,
  type QuizQuestion,
} from "@/utils/quizEngine";

const QuizPage = () => {
  const { t } = useTranslation();
  const [kinds, setKinds] = useState<QuizKind[]>([...ALL_QUIZ_KINDS]);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("basic");
  const [progress, setProgress] = useState<QuizProgress>(readQuizProgress);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [round, setRound] = useState(0);

  function start() {
    setQuestions(generateQuiz({ kinds, difficulty }));
    setRound((current) => current + 1);
  }

  return (
    <div className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>{t("quiz.title")}</h1>
      {questions === null ? (
        <>
          <p className="mb-4 text-sm text-muted-foreground">{t("quiz.subtitle")}</p>
          <QuizSetup
            kinds={kinds}
            difficulty={difficulty}
            progress={progress}
            onKindsChange={setKinds}
            onDifficultyChange={setDifficulty}
            onStart={start}
          />
        </>
      ) : (
        <QuizRound
          // A new key remounts the round so each run starts from a clean session.
          key={round}
          questions={questions}
          difficulty={difficulty}
          onProgress={setProgress}
          onReplay={start}
          onChangeSettings={() => setQuestions(null)}
        />
      )}
    </div>
  );
};

interface QuizRoundProps {
  questions: QuizQuestion[];
  difficulty: QuizDifficulty;
  onProgress: (progress: QuizProgress) => void;
  onReplay: () => void;
  onChangeSettings: () => void;
}

function QuizRound({ questions, difficulty, onProgress, onReplay, onChangeSettings }: QuizRoundProps) {
  const { t } = useTranslation();
  const { notation } = useNotation();
  const session = useQuizSession(questions);
  const [isRecord, setIsRecord] = useState(false);

  function handleNext() {
    if (session.isLast) {
      // Recorded from the click so it happens exactly once per round.
      const outcome = recordQuizResult(difficulty, scoreQuiz(session.results));
      setIsRecord(outcome.isRecord);
      onProgress(outcome.progress);
    }
    session.next();
  }

  if (session.finished) {
    return (
      <QuizResult results={session.results} isRecord={isRecord} onReplay={onReplay} onChangeSettings={onChangeSettings} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{t("quiz.progress", { current: session.index + 1, total: session.total })}</span>
        <span>{t("quiz.score", { correct: session.results.filter(Boolean).length })}</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={session.total}
        aria-valuenow={session.index}
        aria-label={t("quiz.progressLabel")}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full bg-primary transition-all" style={{ width: `${(session.index / session.total) * 100}%` }} />
      </div>
      <QuizQuestionView
        // Resets the finger-placement board between questions.
        key={session.question.id}
        question={session.question}
        notation={notation}
        feedback={session.feedback}
        isLast={session.isLast}
        onSubmit={session.submit}
        onNext={handleNext}
      />
    </div>
  );
}

export default QuizPage;
