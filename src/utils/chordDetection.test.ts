import { describe, expect, it } from "vitest";
import { classifyChordFromChroma } from "./chordDetection";

function chroma(...notes: Array<[number, number]>): number[] {
  const values = Array<number>(12).fill(0.01);
  for (const [pitch, energy] of notes) values[pitch] = energy;
  return values;
}

describe("chord classification", () => {
  it("distinguishes major and minor triads", () => {
    expect(classifyChordFromChroma(chroma([0, 1], [4, 0.9], [7, 0.8]))).toBe(
      "C",
    );
    expect(classifyChordFromChroma(chroma([9, 1], [0, 0.9], [4, 0.8]))).toBe(
      "Am",
    );
  });

  it("recognizes seventh and suspended chords", () => {
    expect(
      classifyChordFromChroma(chroma([7, 1], [11, 0.9], [2, 0.8], [5, 0.75])),
    ).toBe("G7");
    expect(classifyChordFromChroma(chroma([2, 1], [7, 0.9], [9, 0.8]))).toBe(
      "Dsus4",
    );
  });

  it("returns no chord for an empty chromagram", () => {
    expect(classifyChordFromChroma(Array(12).fill(0))).toBe("—");
  });
});
