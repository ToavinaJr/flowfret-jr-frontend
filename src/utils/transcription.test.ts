import { describe, expect, it } from "vitest";
import { findActiveSegment, mergeSegments } from "./transcription";

const segments = [
  { id: "a", start: 0, end: 2, text: "one", words: [] },
  { id: "b", start: 2, end: 4, text: "two", words: [] },
  { id: "c", start: 5, end: 6, text: "three", words: [] },
];

describe("transcription utilities", () => {
  it("finds an active segment using start-inclusive/end-exclusive rules", () => {
    expect(findActiveSegment(segments, 0)).toBe(0);
    expect(findActiveSegment(segments, 2)).toBe(1);
    expect(findActiveSegment(segments, 4.5)).toBe(-1);
  });
  it("deduplicates progressive segments and keeps chronological order", () => {
    expect(mergeSegments([segments[1]], [segments[0], segments[1]])).toEqual([segments[0], segments[1]]);
  });
});

