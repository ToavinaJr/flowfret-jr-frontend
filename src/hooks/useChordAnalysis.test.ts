import { describe, expect, it } from "vitest";
import { appendCapturedChord } from "./useChordAnalysis";

describe("captured chord timeline", () => {
  it("merges consecutive identical chords", () => {
    const first = appendCapturedChord([], "Am", 1);
    const second = appendCapturedChord(first, "Am", 1.75);

    expect(second).toEqual([{ start: 0.25, end: 2.5, chord: "Am" }]);
  });

  it("starts a new cue when the chord changes", () => {
    const first = appendCapturedChord([], "C", 1);
    const second = appendCapturedChord(first, "G", 1.75);

    expect(second).toHaveLength(2);
    expect(second[1]).toEqual({ start: 1, end: 2.5, chord: "G" });
  });

  it("does not corrupt the timeline after seeking backwards", () => {
    const cues = [{ start: 10, end: 11, chord: "F" }];

    expect(appendCapturedChord(cues, "C", 2)).toEqual(cues);
  });
});
