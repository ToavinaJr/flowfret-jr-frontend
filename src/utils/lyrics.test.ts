import { describe, expect, it } from "vitest";
import { findActiveLyricLine } from "./lyrics";

describe("findActiveLyricLine", () => {
  const lines = [
    { startTimeMs: 1000, text: "one" },
    { startTimeMs: 3000, text: "two" },
    { startTimeMs: 5000, text: "three" },
  ];

  it("finds the latest line at or before the player position", () => {
    expect(findActiveLyricLine(lines, 999)).toBe(-1);
    expect(findActiveLyricLine(lines, 3000)).toBe(1);
    expect(findActiveLyricLine(lines, 9000)).toBe(2);
  });
});
