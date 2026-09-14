import { describe, expect, it } from "vitest";
import { findActiveSegment, mergeSegments } from "./transcription";
import type { TranscriptionSegment } from "@/types/transcription";

const segment = (
  id: string,
  start: number,
  end: number,
  text = id,
): TranscriptionSegment => ({ id, start, end, text });

describe("transcription utilities", () => {
  it("finds a segment at its inclusive start and excludes its end", () => {
    const segments = [segment("a", 0, 2), segment("b", 2, 4)];

    expect(findActiveSegment(segments, 0)).toBe(0);
    expect(findActiveSegment(segments, 2)).toBe(1);
    expect(findActiveSegment(segments, 4)).toBe(-1);
  });

  it("merges, replaces and orders streamed segments", () => {
    const result = mergeSegments(
      [segment("b", 2, 4), segment("a", 0, 2, "old")],
      [segment("a", 0, 2, "new"), segment("c", 4, 6)],
    );

    expect(result.map(({ id }) => id)).toEqual(["a", "b", "c"]);
    expect(result[0].text).toBe("new");
  });
});
