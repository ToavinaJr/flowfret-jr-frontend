import type { ChordPosition } from "@/types/chord";

/**
 * Every note a chord quality may contain, as semitones above the root.
 * Slash chords (e.g. "m/E", "7/G") are not listed: their extra bass note depends on the suffix.
 */
export const CHORD_INTERVALS: Readonly<Record<string, readonly number[]>> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dim: [0, 3, 6],
  dim7: [0, 3, 6, 9],
  sus: [0, 5, 7],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  sus2sus4: [0, 2, 5, 7],
  "7sus4": [0, 5, 7, 10],
  alt: [0, 1, 3, 4, 6, 8, 10],
  aug: [0, 4, 8],
  "5": [0, 7],
  "6": [0, 4, 7, 9],
  "69": [0, 2, 4, 7, 9],
  "7": [0, 4, 7, 10],
  "7b5": [0, 4, 6, 10],
  aug7: [0, 4, 8, 10],
  "9": [0, 2, 4, 7, 10],
  "9b5": [0, 2, 4, 6, 10],
  aug9: [0, 2, 4, 8, 10],
  "7b9": [0, 1, 4, 7, 10],
  "7#9": [0, 3, 4, 7, 10],
  "11": [0, 2, 4, 5, 7, 10],
  "9#11": [0, 2, 4, 6, 7, 10],
  "13": [0, 2, 4, 5, 7, 9, 10],
  maj7: [0, 4, 7, 11],
  maj7b5: [0, 4, 6, 11],
  "maj7#5": [0, 4, 8, 11],
  maj7sus2: [0, 2, 7, 11],
  maj9: [0, 2, 4, 7, 11],
  maj11: [0, 2, 4, 5, 7, 11],
  maj13: [0, 2, 4, 5, 7, 9, 11],
  m6: [0, 3, 7, 9],
  m69: [0, 2, 3, 7, 9],
  m7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
  m9: [0, 2, 3, 7, 10],
  m11: [0, 2, 3, 5, 7, 10],
  mmaj7: [0, 3, 7, 11],
  mmaj7b5: [0, 3, 6, 11],
  mmaj9: [0, 2, 3, 7, 11],
  mmaj11: [0, 2, 3, 5, 7, 11],
  add9: [0, 2, 4, 7],
  madd9: [0, 2, 3, 7],
  add11: [0, 4, 5, 7],
};

/** Pitch classes (C = 0 … B = 11) of the notes a chord may contain, or undefined for an unlisted suffix. */
export function chordPitchClasses(rootPitchClass: number, suffix: string): number[] | undefined {
  return CHORD_INTERVALS[suffix]?.map((interval) => (rootPitchClass + interval) % 12);
}

/** Pitch classes of the notes a voicing actually sounds. */
export function positionPitchClasses(position: ChordPosition): number[] {
  return [...new Set((position.midi ?? []).map((note) => note % 12))];
}

/**
 * True when every sounded note belongs to the chord. Used to keep voicings that spell another chord
 * (for example a "Bbm7" shape that sounds as Am7) out of lessons and quizzes.
 */
export function isPositionConsistent(rootPitchClass: number, suffix: string, position: ChordPosition): boolean {
  const allowed = chordPitchClasses(rootPitchClass, suffix);
  if (!allowed) return true;
  const played = positionPitchClasses(position);
  return played.length > 0 && played.every((pitchClass) => allowed.includes(pitchClass));
}
