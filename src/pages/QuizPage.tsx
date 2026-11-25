import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QuizQuestionView } from '@/components/features/quiz/QuizQuestionView';
import { Button } from '@/components/ui/button';
import { PAGE_SHELL, PAGE_TITLE } from '@/constants/navigation';
import { useNotation } from '@/contexts/useNotation';
import { fetchActiveQuizAttempt, fetchMyQuizProgress, fetchPublishedQuizzes, startQuizAttempt, submitQuizAnswer, type QuizAnswer, type QuizAnswerResult, type QuizAttempt, type QuizCard, type QuizProgress, type LearnerQuestion } from '@/services/quizzesApi';

const QuizPage = () => {
  const { t } = useTranslation();
  const client = useQueryClient();
  const quizzes = useQuery({ queryKey: ['published-quizzes'], queryFn: fetchPublishedQuizzes });
  const active = useQuery({ queryKey: ['active-quiz-attempt'], queryFn: fetchActiveQuizAttempt });
  const progress = useQuery({ queryKey: ['my-quiz-progress'], queryFn: fetchMyQuizProgress });
  const [startedAttempt, setStartedAttempt] = useState<QuizAttempt | null>(null);
  const attempt = startedAttempt ?? active.data ?? null;
  const start = useMutation({
    mutationFn: startQuizAttempt,
    onSuccess: (value) => {
      setStartedAttempt(value);
      client.setQueryData(['active-quiz-attempt'], value);
    },
  });

  function leaveAttempt() {
    setStartedAttempt(null);
    client.invalidateQueries({ queryKey: ['active-quiz-attempt'] });
  }

  return (
    <main className={PAGE_SHELL}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className={PAGE_TITLE}>{t('quiz.title')}</h1>
        <Link className="text-sm font-medium text-primary hover:underline" to="/leaderboard">{t('leaderboard.title')}</Link>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">{t('quiz.subtitle')}</p>
      {attempt ? (
        <QuizRun key={attempt.id} attempt={attempt} onLeave={leaveAttempt} />
      ) : (
        <QuizCatalog quizzes={quizzes.data ?? []} progress={progress.data ?? []} loading={quizzes.isLoading || active.isLoading} error={Boolean(quizzes.error || active.error)} onStart={(id) => start.mutate(id)} starting={start.isPending} />
      )}
    </main>
  );
};

function QuizCatalog({ quizzes, progress, loading, error, onStart, starting }: { quizzes: QuizCard[]; progress: QuizProgress[]; loading: boolean; error: boolean; onStart: (id: string) => void; starting: boolean }) {
  const { t } = useTranslation();
  if (loading) return <p role="status">{t('quiz.loading')}</p>;
  if (error) return <p role="alert">{t('quiz.error')}</p>;
  if (!quizzes.length) return <p className="rounded-xl border p-5 text-muted-foreground">{t('quiz.empty')}</p>;
  return <ul className="grid gap-4 md:grid-cols-2">{quizzes.map((quiz) => (
    <li key={quiz.id} className="rounded-xl border bg-card p-5">
      <h2 className="text-lg font-semibold">{quiz.title}</h2>
      {quiz.description && <p className="mt-1 text-sm text-muted-foreground">{quiz.description}</p>}
      <p className="mt-3 text-xs text-muted-foreground">{t('quiz.questionCount', { count: quiz._count.questions })}</p>
      {progress.find((item) => item.quizId === quiz.id) && <p className="mt-1 text-xs text-muted-foreground">{t('quiz.progressSummary', { best: progress.find((item) => item.quizId === quiz.id)?.bestPercentage, recent: progress.find((item) => item.quizId === quiz.id)?.recentPercentage })}</p>}
      <Button className="mt-4" disabled={starting} onClick={() => onStart(quiz.id)}>{t('quiz.setup.start')}</Button>
    </li>
  ))}</ul>;
}

function QuizRun({ attempt, onLeave }: { attempt: QuizAttempt; onLeave: () => void }) {
  const { t } = useTranslation();
  const { notation } = useNotation();
  const [question, setQuestion] = useState<LearnerQuestion | null>(attempt.question);
  const [response, setResponse] = useState<QuizAnswerResult | null>(null);
  const [result, setResult] = useState<QuizAnswerResult['result']>(null);
  const [answeredCount, setAnsweredCount] = useState(attempt.currentPosition);
  const [correctCount, setCorrectCount] = useState(attempt.correctCount);
  const submit = useMutation({
    mutationFn: ({ questionId, answer }: { questionId: string; answer: QuizAnswer }) => submitQuizAnswer(attempt.id, questionId, answer),
    onSuccess: (value) => {
      setResponse(value);
      setAnsweredCount((current) => current + 1);
      if (value.feedback.correct) setCorrectCount((current) => current + 1);
    },
  });
  if (result) return <section className="rounded-xl border bg-card p-6 text-center">
    <h2 className="text-xl font-semibold">{t('quiz.result.title')}</h2>
    <p className="mt-3 text-3xl font-bold text-primary">{result.percentage}%</p>
    <p className="mt-1 text-sm text-muted-foreground">{t('quiz.result.score', { correct: result.correctCount, total: result.totalQuestions })}</p>
    <Button className="mt-5" onClick={onLeave}>{t('quiz.result.back')}</Button>
  </section>;
  if (!question) return <p role="alert">{t('quiz.error')}</p>;
  const feedback = response ? { ...response.feedback, answer: submit.variables?.answer ?? { kind: 'choice' as const, index: -1 } } : null;
  return <section className="space-y-4">
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>{t('quiz.progress', { current: answeredCount + 1, total: attempt.totalQuestions })}</span>
      <span>{t('quiz.score', { correct: correctCount })}</span>
    </div>
    <div role="progressbar" aria-valuemin={0} aria-valuemax={attempt.totalQuestions} aria-valuenow={answeredCount} aria-label={t('quiz.progressLabel')} className="h-1.5 overflow-hidden rounded-full bg-muted">
      <div className="h-full bg-primary transition-all" style={{ width: `${(answeredCount / attempt.totalQuestions) * 100}%` }} />
    </div>
    <QuizQuestionView question={question} notation={notation} feedback={feedback} isLast={!response?.nextQuestion} onSubmit={(answer) => submit.mutate({ questionId: question.id, answer })} onNext={() => {
      if (response?.result) setResult(response.result);
      else if (response?.nextQuestion) setQuestion(response.nextQuestion);
      setResponse(null);
    }} />
    {submit.isPending && <p role="status" className="text-sm text-muted-foreground">{t('quiz.submitting')}</p>}
    {submit.error && <p role="alert" className="text-sm text-destructive">{t('quiz.error')}</p>}
  </section>;
}

export default QuizPage;
