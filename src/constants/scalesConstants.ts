import type { ScaleDefinition, ScaleId, ScaleKey } from "@/types/scales";

export const NOTE_DISPLAY = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

export const KEYS: ScaleKey[] = [
  { label: "C", index: 0 },
  { label: "C#", index: 1 },
  { label: "D", index: 2 },
  { label: "Eb", index: 3 },
  { label: "E", index: 4 },
  { label: "F", index: 5 },
  { label: "F#", index: 6 },
  { label: "G", index: 7 },
  { label: "Ab", index: 8 },
  { label: "A", index: 9 },
  { label: "Bb", index: 10 },
  { label: "B", index: 11 },
];

export const SCALES: Record<ScaleId, ScaleDefinition> = {
  major: { label: "Majeure", intervals: [0, 2, 4, 5, 7, 9, 11] },
  minor: { label: "Mineure naturelle", intervals: [0, 2, 3, 5, 7, 8, 10] },
  harmMinor: {
    label: "Mineure harmonique",
    intervals: [0, 2, 3, 5, 7, 8, 11],
  },
  pentatonicMaj: {
    label: "Pentatonique majeure",
    intervals: [0, 2, 4, 7, 9],
  },
  pentatonicMin: {
    label: "Pentatonique mineure",
    intervals: [0, 3, 5, 7, 10],
  },
  blues: { label: "Blues", intervals: [0, 3, 5, 6, 7, 10] },
  dorian: { label: "Dorienne", intervals: [0, 2, 3, 5, 7, 9, 10] },
  mixolydian: {
    label: "Mixolydienne",
    intervals: [0, 2, 4, 5, 7, 9, 10],
  },
};

/** High e → low E note indices (C=0) */
export const STRING_OPEN_NOTES = [4, 11, 7, 2, 9, 4];
export const STRING_NAMES = ["e", "B", "G", "D", "A", "E"];
export const FRET_MARKERS = [3, 5, 7, 9, 12];
export const FRET_COUNT = 13;

export const INTERVAL_LABELS = [
  "R",
  "2m",
  "2M",
  "3m",
  "3M",
  "4",
  "#4",
  "5",
  "6m",
  "6M",
  "7m",
  "7M",
] as const;

export function isScaleId(value: string): value is ScaleId {
  return value in SCALES;
}
