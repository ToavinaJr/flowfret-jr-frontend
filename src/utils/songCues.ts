import type { ChordCue, SongMeta } from "@/types/song";

const SHARP_TO_DB: Record<string, string> = {
  "D#": "Eb",
  "G#": "Ab",
  "A#": "Bb",
};

export function normaliseKey(raw: string): string {
  return SHARP_TO_DB[raw] ?? raw;
}

export function getCueAtTime(
  cues: ChordCue[],
  timeSeconds: number,
): ChordCue | null {
  const idx = getCueIndexAtTime(cues, timeSeconds);
  return idx === -1 ? null : cues[idx];
}

export function getCueIndexAtTime(
  cues: ChordCue[],
  timeSeconds: number,
): number {
  let lo = 0;
  let hi = cues.length - 1;

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const cue = cues[mid];

    if (timeSeconds < cue.start) {
      hi = mid - 1;
    } else if (timeSeconds >= cue.end) {
      lo = mid + 1;
    } else {
      return mid;
    }
  }

  return -1;
}

export function buildChordIndex(
  cues: ChordCue[],
  getFirstSuffix: (key: string) => string,
): Map<string, string> {
  const index = new Map<string, string>();
  const seen = new Set<string>();

  for (const cue of cues) {
    const key = normaliseKey(cue.chord);
    if (!seen.has(key)) {
      seen.add(key);
      index.set(key, getFirstSuffix(key));
    }
  }

  return index;
}

function isChordCue(value: object | string | number | boolean | null): value is ChordCue {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const record = value as {
    start?: number;
    end?: number;
    chord?: string;
  };
  return (
    typeof record.start === "number" &&
    typeof record.end === "number" &&
    typeof record.chord === "string"
  );
}

export function isSongMeta(value: object): value is SongMeta {
  const record = value as {
    audioFile?: string;
    title?: string;
    duration?: number;
    cues?: Array<object | string | number | boolean | null>;
  };
  return (
    typeof record.audioFile === "string" &&
    typeof record.title === "string" &&
    typeof record.duration === "number" &&
    Array.isArray(record.cues) &&
    record.cues.every((cue) => isChordCue(cue))
  );
}
