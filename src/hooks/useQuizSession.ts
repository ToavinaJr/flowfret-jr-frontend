import { useCallback, useReducer } from "react";
import { isAnswerCorrect, type QuizAnswer, type QuizQuestion } from "@/utils/quizEngine";

export interface QuizFeedback {
  correct: boolean;
  answer: QuizAnswer;
}

interface SessionState {
  index: number;
  results: boolean[];
  feedback: QuizFeedback | null;
}

type SessionAction =
  | { type: "submit"; question: QuizQuestion; answer: QuizAnswer }
  | { type: "next" };

const INITIAL_STATE: SessionState = { index: 0, results: [], feedback: null };

function reducer(state: SessionState, action: SessionAction): SessionState {
  if (action.type === "submit") {
    if (state.feedback) return state;
    const correct = isAnswerCorrect(action.question, action.answer);
    return { ...state, results: [...state.results, correct], feedback: { correct, answer: action.answer } };
  }
  if (!state.feedback) return state;
  return { index: state.index + 1, results: state.results, feedback: null };
}

/** Walks through a generated quiz: one answer per question, feedback, then the next question. */
export function useQuizSession(questions: readonly QuizQuestion[]) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const question = questions[state.index];

  const submit = useCallback(
    (answer: QuizAnswer) => {
      if (question) dispatch({ type: "submit", question, answer });
    },
    [question],
  );
  const next = useCallback(() => dispatch({ type: "next" }), []);

  return {
    question,
    index: state.index,
    total: questions.length,
    results: state.results,
    feedback: state.feedback,
    finished: state.index >= questions.length,
    isLast: state.index === questions.length - 1,
    submit,
    next,
  };
}
