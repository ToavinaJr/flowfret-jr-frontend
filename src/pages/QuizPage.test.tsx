import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotationProvider } from '@/contexts/NotationContext';
import * as api from '@/services/quizzesApi';
import QuizPage from './QuizPage';

vi.mock('@/services/quizzesApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/quizzesApi')>()),
  fetchPublishedQuizzes: vi.fn(),
  fetchMyQuizProgress: vi.fn(),
  fetchActiveQuizAttempt: vi.fn(),
  startQuizAttempt: vi.fn(),
  submitQuizAnswer: vi.fn(),
}));

const question = {
  id: 'question-1', kind: 'transpose' as const, subject: 'note' as const,
  source: { key: 'D', suffix: 'major' }, semitones: 2,
  options: [{ key: 'E', suffix: 'major' }, { key: 'F', suffix: 'major' }],
};
const attempt: api.QuizAttempt = {
  id: 'attempt-1', status: 'IN_PROGRESS', quizTitle: 'Starter quiz', currentPosition: 0,
  correctCount: 0, totalQuestions: 1, question,
};

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><BrowserRouter><NotationProvider><QuizPage /></NotationProvider></BrowserRouter></QueryClientProvider>);
}

describe('QuizPage', () => {
  beforeEach(() => {
    vi.mocked(api.fetchPublishedQuizzes).mockResolvedValue([{ id: 'quiz-1', title: 'Starter quiz', description: 'Three guitar basics', _count: { questions: 1 } }]);
    vi.mocked(api.fetchMyQuizProgress).mockResolvedValue([]);
    vi.mocked(api.fetchActiveQuizAttempt).mockResolvedValue(null);
    vi.mocked(api.startQuizAttempt).mockResolvedValue(attempt);
    vi.mocked(api.submitQuizAnswer).mockResolvedValue({ feedback: { correct: true }, nextQuestion: null, result: { correctCount: 1, totalQuestions: 1, percentage: 100 } });
  });

  it('loads server quizzes, starts an account attempt, and displays the server score', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Start quiz' }));
    expect(await screen.findByRole('heading', { name: 'What is D transposed up by 2 semitones?' })).toBeInTheDocument();
    expect(vi.mocked(api.startQuizAttempt).mock.calls[0]?.[0]).toBe('quiz-1');

    fireEvent.click(screen.getByRole('button', { name: 'E' }));
    expect(await screen.findByText('Correct!')).toBeInTheDocument();
    expect(api.submitQuizAnswer).toHaveBeenCalledWith('attempt-1', 'question-1', { kind: 'choice', index: 0 });
    fireEvent.click(screen.getByRole('button', { name: 'See results' }));
    expect(await screen.findByText('100%')).toBeInTheDocument();
    expect(screen.getByText('1 / 1')).toBeInTheDocument();
  });

  it('resumes an active account attempt returned by the backend', async () => {
    vi.mocked(api.fetchActiveQuizAttempt).mockResolvedValue(attempt);
    renderPage();
    expect(await screen.findByRole('heading', { name: 'What is D transposed up by 2 semitones?' })).toBeInTheDocument();
    expect(api.startQuizAttempt).not.toHaveBeenCalled();
  });
});
