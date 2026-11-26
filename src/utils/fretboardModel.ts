import { QUIZ_MUTED, QUIZ_STRING_COUNT, type QuizBarre } from "@/services/quizzesApi";

/** What the learner has placed on the board: one fret per string, plus an optional barre. */
export interface FretboardState {
  frets: readonly number[];
  barre: QuizBarre | null;
}

export const EMPTY_FRETBOARD: FretboardState = {
  frets: Array.from({ length: QUIZ_STRING_COUNT }, () => QUIZ_MUTED),
  barre: null,
};

/** A barre only makes sense while both end strings are still pressed on its fret. */
function stillAnchored(frets: readonly number[], barre: QuizBarre | null): QuizBarre | null {
  return barre && frets[barre.from] === barre.fret && frets[barre.to] === barre.fret ? barre : null;
}

export function isInBarre(barre: QuizBarre | null, string: number, fret: number): boolean {
  return barre !== null && barre.fret === fret && string >= barre.from && string <= barre.to;
}

/** Presses a string on a fret, or releases it when it is already there. */
export function toggleCell(state: FretboardState, string: number, fret: number): FretboardState {
  const frets = state.frets.map((current, index) => (index === string ? (current === fret ? QUIZ_MUTED : fret) : current));
  return { frets, barre: stillAnchored(frets, state.barre) };
}

/**
 * Lays one finger across the strings between `a` and `b` (either order) on `fret`.
 * Strings already pressed higher up keep their finger; the others go under the barre.
 */
export function applyBarre(state: FretboardState, fret: number, a: number, b: number): FretboardState {
  const from = Math.min(a, b);
  const to = Math.max(a, b);
  if (from === to) return toggleCell(state, from, fret);
  const frets = state.frets.map((current, string) => {
    if (string < from || string > to) return current;
    return string === from || string === to || current < fret ? fret : current;
  });
  return { frets, barre: { fret, from, to } };
}
