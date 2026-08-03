/**
 * Chord database types (tombatossals/chords-db shape).
 */

export interface ChordPosition {
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
  capo?: boolean;
  midi?: number[];
}

export interface Chord {
  key: string;
  suffix: string;
  positions: ChordPosition[];
}

export interface GuitarMain {
  strings: number;
  fretsOnChord: number;
  name: string;
}

export interface GuitarTunings {
  standard: string[];
  [tuningName: string]: string[];
}

export interface GuitarDB {
  main: GuitarMain;
  tunings: GuitarTunings;
  keys: string[];
  suffixes: string[];
  chords: Record<string, Chord[]>;
}

export const CHORD_KEY_MAP = {
  C: "C",
  "C#": "Csharp",
  D: "D",
  Eb: "Eb",
  E: "E",
  F: "F",
  "F#": "Fsharp",
  G: "G",
  Ab: "Ab",
  A: "A",
  Bb: "Bb",
  B: "B",
} as const;

export type ChordKey = keyof typeof CHORD_KEY_MAP;

export type ChordCategory = "All" | "Major" | "Minor" | "7th" | "Other";

export interface FretNote {
  string: number;
  fret: number;
}
