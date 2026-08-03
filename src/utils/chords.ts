import guitarJson from "@/data/guitar/guitar.json";
import type { Chord, ChordKey, ChordPosition, GuitarDB } from "@/types/chord";
import { parseGuitarDB } from "@/utils/parseGuitarDB";

const db: GuitarDB = parseGuitarDB(guitarJson);

export function getKeys(): string[] {
  return db.keys;
}

export function getSuffixes(): string[] {
  return db.suffixes;
}

function toDBKey(key: string): string {
  return key.replace("#", "sharp");
}

export function getChordsByKey(key: ChordKey | string): Chord[] {
  const dbKey = toDBKey(key);
  return db.chords[dbKey] ?? [];
}

export function getSuffixesByKey(key: ChordKey | string): string[] {
  return getChordsByKey(key).map((c) => c.suffix);
}

export function getChord(
  key: ChordKey | string,
  suffix: string,
): Chord | undefined {
  return getChordsByKey(key).find((c) => c.suffix === suffix);
}

export function getChordPositions(
  key: ChordKey | string,
  suffix: string,
): ChordPosition[] {
  return getChord(key, suffix)?.positions ?? [];
}

export function getChordPosition(
  key: ChordKey | string,
  suffix: string,
  positionIndex = 0,
): ChordPosition | undefined {
  const positions = getChordPositions(key, suffix);
  return positions[positionIndex];
}

export function getGuitarMeta(): GuitarDB["main"] {
  return db.main;
}

export function getFirstSuffixForKey(key: string): string {
  const chords = getChordsByKey(key);
  const major = chords.find((c) => c.suffix === "major");
  return major?.suffix ?? chords[0]?.suffix ?? "major";
}

/** Display label for a chord key + suffix (e.g. A + major → A, A + minor → Am). */
export function formatChordLabel(key: string, suffix: string): string {
  if (suffix === "major") return key;
  if (suffix === "minor") return `${key}m`;
  if (suffix.startsWith("m") || suffix.startsWith("/")) return `${key}${suffix}`;
  return `${key}${suffix}`;
}

export function categorizeSuffix(suffix: string): "Major" | "Minor" | "7th" | "Other" {
  if (suffix === "major") return "Major";
  if (suffix === "minor") return "Minor";

  const isExtended =
    suffix.includes("7") ||
    suffix.includes("9") ||
    suffix.includes("11") ||
    suffix.includes("13");

  if (suffix.startsWith("m") && !suffix.startsWith("maj")) {
    return isExtended ? "7th" : "Minor";
  }
  if (isExtended || suffix.startsWith("maj")) {
    return "7th";
  }
  if (suffix === "5" || suffix === "6" || suffix === "69") {
    return "Major";
  }
  return "Other";
}
