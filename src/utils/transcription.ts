import type { TranscriptionSegment } from "@/types/transcription";

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

export function mergeSegments(current: readonly TranscriptionSegment[], incoming: readonly TranscriptionSegment[]): TranscriptionSegment[] {
  const byId = new Map(current.map((segment) => [segment.id, segment]));
  for (const segment of incoming) byId.set(segment.id, segment);
  return [...byId.values()].sort((left, right) => left.start - right.start);
}

