import { graphqlRequest } from '@/services/graphqlClient';

export const QUIZ_BOARD_FRETS = 5;
export const QUIZ_STRING_COUNT = 6;
export const QUIZ_MUTED = -1;
export const soundingStringCount = (frets: readonly number[]) => frets.filter((fret) => fret >= 0).length;

export interface ChordRef { key: string; suffix: string }
export interface ChordPosition { frets: number[]; fingers: number[]; baseFret: number; barres: number[] }
export type LearnerQuestion =
  | { id: string; kind: 'identify'; position: ChordPosition; options: ChordRef[] }
  | { id: string; kind: 'transpose'; subject: 'note' | 'chord'; source: ChordRef; semitones: number; options: ChordRef[] }
  | { id: string; kind: 'place'; chord: ChordRef };
export type QuizAnswer = { kind: 'choice'; index: number } | { kind: 'frets'; frets: number[] };
export interface QuizAttempt {
  id: string; status: string; quizTitle: string; currentPosition: number;
  correctCount: number; totalQuestions: number; question: LearnerQuestion | null;
}
export interface QuizCard { id: string; title: string; description: string | null; _count: { questions: number } }
export interface QuizProgress { quizId: string; bestPercentage: number; bestScore: number; totalQuestions: number; recentPercentage: number; recentScore: number; completedAt: string | null; attempts: number }
export interface QuizAnswerResult {
  feedback: { correct: boolean; correctOption?: ChordRef; example?: ChordPosition };
  nextQuestion: LearnerQuestion | null;
  result: { correctCount: number; totalQuestions: number; percentage: number } | null;
}

export const fetchPublishedQuizzes = () => graphqlRequest<{ publishedQuizzes: QuizCard[] }>({
  query: 'query PublishedQuizzes { publishedQuizzes }',
}).then((data) => data.publishedQuizzes);

export const fetchActiveQuizAttempt = () => graphqlRequest<{ myActiveQuizAttempt: QuizAttempt | null }>({
  query: 'query MyActiveQuizAttempt { myActiveQuizAttempt }',
}).then((data) => data.myActiveQuizAttempt);

export const fetchMyQuizProgress = () => graphqlRequest<{ myQuizProgress: QuizProgress[] }>({
  query: 'query MyQuizProgress { myQuizProgress }',
}).then((data) => data.myQuizProgress);

export const startQuizAttempt = (quizId: string) => graphqlRequest<{ startQuizAttempt: QuizAttempt }>({
  query: 'mutation StartQuizAttempt($quizId: String!) { startQuizAttempt(quizId: $quizId) }',
  variables: { quizId },
}).then((data) => data.startQuizAttempt);

export const submitQuizAnswer = (attemptId: string, questionId: string, answer: QuizAnswer) =>
  graphqlRequest<{ submitQuizAnswer: QuizAnswerResult }>({
    query: 'mutation SubmitQuizAnswer($attemptId: String!, $questionId: String!, $answer: JSON!) { submitQuizAnswer(attemptId: $attemptId, questionId: $questionId, answer: $answer) }',
    variables: { attemptId, questionId, answer },
  }).then((data) => data.submitQuizAnswer);

export type LeaderboardPeriod = 'ALL_TIME' | 'WEEK' | 'DAY';
export interface LeaderboardEntry { rank: number; username: string; avatarUrl: string | null; points: number; completedQuizzes: number }
export const fetchQuizLeaderboard = (period: LeaderboardPeriod) => graphqlRequest<{ quizLeaderboard: LeaderboardEntry[] }>({
  query: 'query QuizLeaderboard($period: String!, $take: Float) { quizLeaderboard(period: $period, take: $take) }',
  variables: { period, take: 50 },
}).then((data) => data.quizLeaderboard);
