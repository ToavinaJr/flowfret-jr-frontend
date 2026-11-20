import { CHORD_KEY_MAP, type ChordKey, type ChordPosition } from "@/types/chord";
import { getChordPositions } from "@/utils/chords";
import { chordPitchClasses, isPositionConsistent, positionPitchClasses } from "@/utils/chordTheory";

export type QuizKind = "identify" | "transpose" | "place";
export type QuizDifficulty = "basic" | "advanced";
export type Random = () => number;

export interface ChordRef {
  key: string;
  suffix: string;
}

/** Pitch classes (0-11) that an answer may use: every required tone, and nothing outside the chord. */
export interface PlacementRule {
  required: number[];
  allowed: number[];
}

export type QuizQuestion =
  | {
      id: string;
      kind: "identify";
      chord: ChordRef;
      position: ChordPosition;
      options: ChordRef[];
      answerIndex: number;
    }
  | {
      id: string;
      kind: "transpose";
      /** "note" questions show a bare note name; "chord" questions keep the chord quality. */
      subject: "note" | "chord";
      source: ChordRef;
      semitones: number;
      options: ChordRef[];
      answerIndex: number;
    }
  | {
      id: string;
      kind: "place";
      chord: ChordRef;
      rule: PlacementRule;
      /** A correct voicing, shown after a wrong answer. */
      example: ChordPosition;
    };

export type QuizAnswer =
  | { kind: "choice"; index: number }
  | { kind: "frets"; frets: number[] };

export const ALL_QUIZ_KINDS: readonly QuizKind[] = ["identify", "transpose", "place"];
export const DEFAULT_QUESTION_COUNT = 10;
export const STRING_COUNT = 6;
/** Highest fret offered by the finger-placement board. */
export const BOARD_FRETS = 5;
/** Open-string MIDI notes in standard tuning, low E to high E. */
export const OPEN_STRING_MIDI: readonly number[] = [40, 45, 50, 55, 59, 64];
export const MUTED = -1;
const MIN_SOUNDING_STRINGS = 3;
const OPTION_COUNT = 4;

/** Tones a placed chord must contain; seventh chords may omit the fifth. Other tones come from CHORD_INTERVALS. */
const REQUIRED_INTERVALS: Record<string, readonly number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  "7": [0, 4, 10],
  maj7: [0, 4, 11],
  m7: [0, 3, 10],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
};

/** Index in ROOTS is also the pitch class (C = 0 … B = 11). */
const ROOTS = Object.keys(CHORD_KEY_MAP) as ChordKey[];
const SUFFIXES_BY_DIFFICULTY: Record<QuizDifficulty, readonly string[]> = {
  basic: ["major", "minor"],
  advanced: ["major", "minor", "7", "maj7", "m7", "sus2", "sus4", "dim", "aug"],
};

/** Deterministic generator (mulberry32) so a seed reproduces the same quiz. */
export function createRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], random: Random): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function pick<T>(items: readonly T[], random: Random): T {
  return items[Math.floor(random() * items.length)];
}

function rootIndex(key: string): number {
  return ROOTS.indexOf(key as ChordKey);
}

function rootAt(index: number): string {
  return ROOTS[((index % 12) + 12) % 12];
}

function refId(ref: ChordRef): string {
  return `${ref.key}|${ref.suffix}`;
}

function sameRef(a: ChordRef, b: ChordRef): boolean {
  return a.key === b.key && a.suffix === b.suffix;
}

function tonesOf(ref: ChordRef, which: "intervals" | "required"): number[] {
  const root = rootIndex(ref.key);
  if (which === "intervals") return chordPitchClasses(root, ref.suffix) ?? [];
  return (REQUIRED_INTERVALS[ref.suffix] ?? []).map((interval) => (root + interval) % 12);
}

/**
 * Voicings that really spell the chord and can be shown as the answer. The chord library is
 * checked against the same theory, so this is a second line of defence for future data changes.
 */
function validPositions(ref: ChordRef): ChordPosition[] {
  const root = rootIndex(ref.key);
  const required = tonesOf(ref, "required");
  return getChordPositions(ref.key, ref.suffix).filter((position) => {
    const played = positionPitchClasses(position);
    return isPositionConsistent(root, ref.suffix, position) && required.every((pitchClass) => played.includes(pitchClass));
  });
}

export function chordPool(difficulty: QuizDifficulty): ChordRef[] {
  return ROOTS.flatMap((key) =>
    SUFFIXES_BY_DIFFICULTY[difficulty]
      .map((suffix) => ({ key, suffix }))
      .filter((ref) => validPositions(ref).length > 0),
  );
}

/** Two chords with the same signature sound the same (e.g. Caug and Eaug), so they cannot be told apart by name. */
function chordSignature(ref: ChordRef): string {
  return [...tonesOf(ref, "intervals")].sort((a, b) => a - b).join(",");
}

function noteSignature(ref: ChordRef): string {
  return String(rootIndex(ref.key));
}

function assembleOptions(
  answer: ChordRef,
  preferred: ChordRef[],
  pool: ChordRef[],
  signatureOf: (ref: ChordRef) => string,
  random: Random,
): { options: ChordRef[]; answerIndex: number } {
  const used = new Set([signatureOf(answer)]);
  const distractors: ChordRef[] = [];
  for (const candidate of [...shuffle(preferred, random), ...shuffle(pool, random)]) {
    if (distractors.length === OPTION_COUNT - 1) break;
    const signature = signatureOf(candidate);
    if (used.has(signature)) continue;
    used.add(signature);
    distractors.push(candidate);
  }
  const options = shuffle([answer, ...distractors], random);
  return { options, answerIndex: options.findIndex((option) => sameRef(option, answer)) };
}

function buildIdentify(id: string, pool: ChordRef[], random: Random): QuizQuestion {
  const chord = pick(pool, random);
  const position = pick(validPositions(chord).slice(0, 4), random);
  const rootShift = [-2, -1, 1, 2, 5, 7].map((shift) => rootAt(rootIndex(chord.key) + shift));
  const preferred = [
    ...rootShift.map((key) => ({ key, suffix: chord.suffix })),
    ...pool.filter((candidate) => candidate.key === chord.key),
  ];
  return {
    id,
    kind: "identify",
    chord,
    position,
    ...assembleOptions(chord, preferred, pool, chordSignature, random),
  };
}

function buildTranspose(
  id: string,
  pool: ChordRef[],
  difficulty: QuizDifficulty,
  random: Random,
): QuizQuestion {
  const subject = difficulty === "basic" ? "note" : "chord";
  const source = subject === "note" ? { key: pick(ROOTS, random), suffix: "major" } : pick(pool, random);
  const magnitude = 1 + Math.floor(random() * 7);
  const semitones = random() < 0.75 ? magnitude : -magnitude;
  const shifted = (amount: number): ChordRef => ({
    key: rootAt(rootIndex(source.key) + amount),
    suffix: source.suffix,
  });
  const answer = shifted(semitones);
  // Typical mistakes: off by one semitone, wrong direction, or forgetting the shift entirely.
  const preferred = [shifted(semitones + 1), shifted(semitones - 1), shifted(-semitones), shifted(0)];
  const candidates = ROOTS.map((key) => ({ key, suffix: source.suffix }));
  const signatureOf = subject === "note" ? noteSignature : chordSignature;
  return {
    id,
    kind: "transpose",
    subject,
    source,
    semitones,
    ...assembleOptions(answer, preferred, candidates, signatureOf, random),
  };
}

function placementRule(chord: ChordRef): PlacementRule {
  return { required: tonesOf(chord, "required"), allowed: tonesOf(chord, "intervals") };
}

function buildPlace(id: string, pool: ChordRef[], random: Random): QuizQuestion {
  // Only chords with a voicing inside the board's first frets can be asked.
  const placeable = pool.flatMap((chord) => {
    const example = validPositions(chord).find((position) => position.baseFret === 1);
    return example ? [{ chord, example }] : [];
  });
  const { chord, example } = pick(placeable, random);
  return { id, kind: "place", chord, rule: placementRule(chord), example };
}

function buildQuestion(
  kind: QuizKind,
  id: string,
  pool: ChordRef[],
  difficulty: QuizDifficulty,
  random: Random,
): QuizQuestion {
  if (kind === "identify") return buildIdentify(id, pool, random);
  if (kind === "transpose") return buildTranspose(id, pool, difficulty, random);
  return buildPlace(id, pool, random);
}

function questionSubject(question: QuizQuestion): string {
  if (question.kind === "identify" || question.kind === "place") return refId(question.chord);
  return `${question.subject}|${refId(question.source)}|${question.semitones}`;
}

export interface QuizConfig {
  kinds: readonly QuizKind[];
  difficulty: QuizDifficulty;
  count?: number;
  random?: Random;
}

/** Builds a quiz where kinds are evenly mixed and the same subject does not come up twice. */
export function generateQuiz({
  kinds,
  difficulty,
  count = DEFAULT_QUESTION_COUNT,
  random = Math.random,
}: QuizConfig): QuizQuestion[] {
  if (kinds.length === 0) return [];
  const pool = chordPool(difficulty);
  const order = shuffle(Array.from({ length: count }, (_, index) => kinds[index % kinds.length]), random);
  const seen = new Set<string>();
  return order.map((kind, index) => {
    let question = buildQuestion(kind, `q${index + 1}`, pool, difficulty, random);
    for (let attempt = 0; attempt < 8 && seen.has(questionSubject(question)); attempt += 1) {
      question = buildQuestion(kind, `q${index + 1}`, pool, difficulty, random);
    }
    seen.add(questionSubject(question));
    return question;
  });
}

/** Pitch classes sounded by a fretboard selection (MUTED strings are skipped). */
export function pitchClassesOfFrets(frets: readonly number[]): number[] {
  const sounding = frets.flatMap((fret, string) =>
    fret >= 0 && string < STRING_COUNT ? [(OPEN_STRING_MIDI[string] + fret) % 12] : [],
  );
  return [...new Set(sounding)];
}

export function soundingStringCount(frets: readonly number[]): number {
  return frets.filter((fret, string) => fret >= 0 && string < STRING_COUNT).length;
}

/** Accepts any voicing built from the right notes, not only the one shown in the chord library. */
export function isPlacementCorrect(frets: readonly number[], rule: PlacementRule): boolean {
  if (frets.length !== STRING_COUNT) return false;
  if (frets.some((fret) => !Number.isInteger(fret) || fret < MUTED || fret > BOARD_FRETS)) return false;
  if (soundingStringCount(frets) < MIN_SOUNDING_STRINGS) return false;
  const played = pitchClassesOfFrets(frets);
  return (
    rule.required.every((pitchClass) => played.includes(pitchClass)) &&
    played.every((pitchClass) => rule.allowed.includes(pitchClass))
  );
}

export function isAnswerCorrect(question: QuizQuestion, answer: QuizAnswer): boolean {
  if (question.kind === "place") {
    return answer.kind === "frets" && isPlacementCorrect(answer.frets, question.rule);
  }
  return answer.kind === "choice" && answer.index === question.answerIndex;
}

export function scoreQuiz(results: readonly boolean[]): { correct: number; total: number; percent: number } {
  const correct = results.filter(Boolean).length;
  const total = results.length;
  return { correct, total, percent: total === 0 ? 0 : Math.round((correct / total) * 100) };
}
