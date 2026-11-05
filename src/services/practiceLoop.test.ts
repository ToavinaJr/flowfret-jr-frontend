import { describe, expect, it } from "vitest";
import {
  EMPTY_PRACTICE_LOOP,
  clampPracticeLoop,
  isPracticeLoopValid,
  setPracticeLoopEnd,
  setPracticeLoopStart,
} from "./practiceLoop";

describe("practice loop rules", () => {
  it("sets a start and enables a valid end", () => {
    const withStart = setPracticeLoopStart(EMPTY_PRACTICE_LOOP, 4, 20);
    const loop = setPracticeLoopEnd(withStart, 6, 20);

    expect(loop).toEqual({ start: 4, end: 6, enabled: true });
    expect(isPracticeLoopValid(loop!, 20)).toBe(true);
  });

  it("rejects an end without a start or a segment shorter than 0.5 seconds", () => {
    expect(setPracticeLoopEnd(EMPTY_PRACTICE_LOOP, 2, 20)).toBeNull();
    const withStart = setPracticeLoopStart(EMPTY_PRACTICE_LOOP, 4, 20);
    expect(setPracticeLoopEnd(withStart, 4.49, 20)).toBeNull();
  });

  it("clears an obsolete end when the new start passes it", () => {
    const loop = { start: 2, end: 5, enabled: true };
    expect(setPracticeLoopStart(loop, 5, 20)).toEqual({
      start: 5,
      end: null,
      enabled: false,
    });
  });

  it("clamps the end to the real media duration or clears an invalid segment", () => {
    expect(clampPracticeLoop({ start: 5, end: 12, enabled: true }, 10)).toEqual({
      start: 5,
      end: 10,
      enabled: true,
    });
    expect(clampPracticeLoop({ start: 9.8, end: 12, enabled: true }, 10)).toEqual({
      start: null,
      end: null,
      enabled: false,
    });
  });
});
