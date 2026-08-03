export interface ScaleKey {
  label: string;
  index: number;
}

export interface ScaleDefinition {
  label: string;
  intervals: number[];
}

export type ScaleId =
  | "major"
  | "minor"
  | "harmMinor"
  | "pentatonicMaj"
  | "pentatonicMin"
  | "blues"
  | "dorian"
  | "mixolydian";
