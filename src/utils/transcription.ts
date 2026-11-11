import type { Lyrics } from "@/types/lyrics";
import type { TranscriptionSegment, TranscriptionWord } from "@/types/transcription";

export const TRANSCRIPTION_LYRICS_PROVIDER = "transcription";

/** Presents Whisper segments as synced lyrics so every lyrics view renders them the same way. */
export function transcriptionSegmentsToLyrics(segments: readonly TranscriptionSegment[]): Lyrics | null {
  const lines = segments
    .map((segment) => ({ startTimeMs: Math.round(segment.start * 1000), text: segment.text.trim() }))
    .filter((line) => line.text.length > 0);
  if (lines.length === 0) return null;
  return {
    provider: TRANSCRIPTION_LYRICS_PROVIDER,
    synced: true,
    instrumental: false,
    plainLyrics: lines.map((line) => line.text).join("\n"),
    lines,
  };
}

export function findActiveSegment(segments: readonly TranscriptionSegment[], currentTime: number): number {
  let low = 0;
  let high = segments.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const segment = segments[middle];
    if (currentTime < segment.start) high = middle - 1;
    else if (currentTime >= segment.end) low = middle + 1;
    else return middle;
  }
  return -1;
}

export function findActiveWord(words: readonly TranscriptionWord[], currentTime: number): number {
  let low = 0;
  let high = words.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const word = words[middle];
    if (currentTime < word.start) high = middle - 1;
    else if (currentTime >= word.end) low = middle + 1;
    else return middle;
  }
  return -1;
}

export function mergeSegments(current: readonly TranscriptionSegment[], incoming: readonly TranscriptionSegment[]): TranscriptionSegment[] {
  const byId = new Map(current.map((segment) => [segment.id, segment]));
  for (const segment of incoming) byId.set(segment.id, segment);
  return [...byId.values()].sort((left, right) => left.start - right.start);
}

