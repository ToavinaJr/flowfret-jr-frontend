import type { LyricLine } from "@/types/lyrics";

export function findActiveLyricLine(lines: readonly LyricLine[], currentTimeMs: number): number {
  let low = 0;
  let high = lines.length - 1;
  let active = -1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const start = lines[middle].startTimeMs;
    if (start === null || start > currentTimeMs) high = middle - 1;
    else {
      active = middle;
      low = middle + 1;
    }
  }
  return active;
}
